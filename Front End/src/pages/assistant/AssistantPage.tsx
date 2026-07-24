import React, { useState, useCallback } from "react";
import { useLocation } from "react-router";
import { PanelRightOpen, PanelLeftOpen } from "lucide-react";
import { DashboardLayout } from "@/app/layouts/dashboardLayout";
import { OwnerLayout } from "@/app/layouts/ownerLayout";
import Map from "@/features/assistant/components/map/Map";
import ResultsPanel from "@/features/assistant/components/map/ResultsPanel";
import ChatSidebar from "@/features/assistant/components/chat/ChatSidebar";
import { useChat } from "@/features/assistant/hooks/useChat";
import { useMapActions } from "@/features/assistant/hooks/useMapActions";
import { useMarketAnalysis } from "@/features/assistant/hooks/useMarketAnalysis";
import { ChatContext, ChatMessage, AnalysisCardData } from "@/shared/types/chat";

export default function AssistantPage() {
    const location = useLocation();
    const isOwner = location.pathname.startsWith("/owner");
    const Layout = isOwner ? OwnerLayout : DashboardLayout;

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiZones, setAiZones] = useState<AnalysisCardData | null>(null);
    const [isResultsPanelOpen, setIsResultsPanelOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    const addMessage = useCallback(async (msg: ChatMessage) => {
        setMessages((prev) => [...prev, msg]);
    }, []);

    const { isLoading, sendMessage, addMessage: chatAddMessage } = useChat({
        messages,
        onMessageAdd: addMessage,
    });

    const { analyzeMarket } = useMarketAnalysis();
    const {
        searchResults,
        isSearching,
        directionsResult,
        recentSearches,
        selectedRouteIndex,
        searchPlaces,
        getDirections,
        analyzeAccessibility,
        clearSearchResults,
        clearDirections,
        setHeatmapMode,
        zoneClusters,
        renderAIZones,
        triggerMarkerClick,
    } = useMapActions();

    const handleMapReady = useCallback((mapInstance: google.maps.Map) => {
        setMap(mapInstance);
    }, []);

    const getMapContext = useCallback((): ChatContext | undefined => {
        if (!map) return undefined;
        const center = map.getCenter();
        return {
            center: center ? { lat: center.lat(), lng: center.lng() } : undefined,
            zoom: map.getZoom(),
        };
    }, [map]);

    const handleClearMap = useCallback(() => {
        clearSearchResults();
        clearDirections();
        setAiZones(null);
        setIsResultsPanelOpen(false);
    }, [clearSearchResults, clearDirections]);

    const handleSendMessage = useCallback(
        async (content: string) => {
            const mapContext = getMapContext();
            const result = await sendMessage(content, mapContext);

            if (result && map) {
                if ((result.intent === "search" || result.intent === "analyze") && result.query) {
                    clearSearchResults();
                    clearDirections();
                    setAiZones(null);
                    const places = await searchPlaces(result.query, map, {
                        category: result.category,
                        location: result.location,
                    });

                    if (places.length > 0) {
                        setIsResultsPanelOpen(true);
                    }

                    if (result.intent === "analyze") {
                        if (places.length === 0) {
                            chatAddMessage({
                                id: `analysis-fallback-${Date.now()}`,
                                role: "assistant",
                                content: `I couldn't find any ${result.category || "business"} competitors in ${result.location || "this area"}. Try a different location or business type.`,
                                timestamp: new Date(),
                            });
                        } else {
                            setHeatmapMode("competition");
                            setIsAnalyzing(true);
                            try {
                                const analysis = await analyzeMarket(places, result.category || "business", result.location || "this area", content);
                                if (analysis) {
                                    renderAIZones(analysis.analysis, map);
                                    setAiZones(analysis.analysis);
                                    chatAddMessage({
                                        id: `analysis-${Date.now()}`,
                                        role: "assistant",
                                        content: "",
                                        timestamp: new Date(),
                                        analysisData: analysis.analysis,
                                    });
                                }
                            } finally {
                                setIsAnalyzing(false);
                            }
                        }
                    }
                } else if (result.intent === "directions" && result.directions) {
                    clearSearchResults();
                    clearDirections();
                    await getDirections(result.directions.origin, result.directions.destination, map);
                } else if (result.intent === "accessibility" && result.query) {
                    clearSearchResults();
                    clearDirections();
                    await analyzeAccessibility(result.query, map);
                }
            }
        },
        [sendMessage, getMapContext, map, clearSearchResults, clearDirections, searchPlaces, getDirections, analyzeAccessibility, analyzeMarket, chatAddMessage, setHeatmapMode, renderAIZones]
    );

    const handleSearch = useCallback(
        async (query: string) => {
            if (map) {
                clearDirections();
                await searchPlaces(query, map);
            }
        },
        [map, searchPlaces, clearDirections]
    );

    const handlePlaceClick = useCallback(
        (placeId: string, location: { lat: number; lng: number }) => {
            if (!map) return;
            map.panTo(location);
            map.setZoom(16);
            triggerMarkerClick(placeId);
        },
        [map, triggerMarkerClick]
    );

    const handleStreetViewChange = useCallback((inStreetView: boolean) => {
        if (inStreetView) setIsChatOpen(false);
    }, []);

    const handleNewChat = () => setMessages([]);

    return (
        <Layout title="AI Assistant">
            {/* Content area: chat panel + map, filling the viewport below the header */}
            <div className="relative flex" style={{ height: "calc(100vh - 64px)", margin: "-1.5rem -1rem", marginTop: "-1.5rem" }}>

                {/* Chat Panel — inline flex child */}
                {isChatOpen && (
                    <div className="relative flex-shrink-0 w-[360px] border-r border-border bg-card flex flex-col overflow-hidden">
                        <ChatSidebar
                            isOpen={isChatOpen}
                            onClose={() => setIsChatOpen(false)}
                            messages={messages}
                            isLoading={isLoading}
                            isAnalyzing={isAnalyzing}
                            onSendMessage={handleSendMessage}
                            onSearch={handleSearch}
                            onClearSearch={handleClearMap}
                            isSearching={isSearching}
                            recentSearches={recentSearches}
                            onClearMap={handleClearMap}
                            onNewChat={handleNewChat}
                            hasMarkers={searchResults.length > 0}
                            hasDirections={directionsResult !== null}
                        />
                    </div>
                )}

                {/* Map area */}
                <div className="relative flex-1 bg-[#1c2420] overflow-hidden">
                    {/* Toggle chat button */}
                    <div className="absolute top-3 left-3 z-[10] flex gap-2">
                        <button
                            onClick={() => setIsChatOpen(!isChatOpen)}
                            className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm transition-colors hover:bg-accent"
                        >
                            {isChatOpen ? <PanelLeftOpen size={16} /> : <PanelRightOpen size={16} />}
                            {isChatOpen ? "Hide Chat" : "Show Chat"}
                        </button>
                    </div>

                    {/* Results panel toggle */}
                    {!isResultsPanelOpen && searchResults.length > 0 && (
                        <button
                            onClick={() => setIsResultsPanelOpen(true)}
                            className="absolute top-3 right-3 z-[10] flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm transition-colors hover:bg-accent"
                        >
                            <PanelRightOpen size={16} />
                            Results
                        </button>
                    )}

                    <ResultsPanel
                        results={searchResults}
                        aiZones={aiZones}
                        isVisible={isResultsPanelOpen}
                        onClose={() => setIsResultsPanelOpen(false)}
                        onPlaceClick={handlePlaceClick}
                    />

                    <Map
                        onMapReady={handleMapReady}
                        searchResults={searchResults}
                        directionsResult={directionsResult}
                        selectedRouteIndex={selectedRouteIndex}
                        onStreetViewChange={handleStreetViewChange}
                        zoneClusters={zoneClusters}
                        aiZones={aiZones}
                    />
                </div>
            </div>
        </Layout>
    );
}
