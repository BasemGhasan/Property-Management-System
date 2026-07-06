import React, { useState, useCallback, useEffect } from "react";
import { Menu, PanelRightOpen, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import Map from "@/features/assistant/components/map/Map";
import ResultsPanel from "@/features/assistant/components/map/ResultsPanel";
import ChatSidebar from "@/features/assistant/components/chat/ChatSidebar";
import { useChat } from "@/features/assistant/hooks/useChat";
import { useMapActions } from "@/features/assistant/hooks/useMapActions";
import { useMarketAnalysis } from "@/features/assistant/hooks/useMarketAnalysis";
import { ChatContext, ChatMessage, AnalysisCardData } from "@/shared/types/chat";

export default function AssistantPage() {
    const navigate = useNavigate();
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => typeof window !== "undefined" && window.innerWidth >= 640);
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
        if (inStreetView) setIsSidebarOpen(false);
    }, []);

    const handleNewChat = () => setMessages([]);

    return (
        <main className="relative h-screen w-screen overflow-hidden bg-[#0a0a0f]">
            {/* Go Back / Sidebar Toggle Button */}
            {!isSidebarOpen && (
                <div className="absolute top-4 left-4 z-[100] flex gap-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 bg-[#12121a]/90 backdrop-blur-sm border border-[#2a2a3a] rounded-lg flex items-center justify-center hover:bg-[#1a1a25] transition-all"
                    >
                        <ArrowLeft size={20} className="text-white" />
                    </button>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="w-10 h-10 bg-[#12121a]/90 backdrop-blur-sm border border-[#2a2a3a] rounded-lg flex items-center justify-center hover:bg-[#1a1a25] hover:border-cyan-500/30 transition-all duration-300 ease-out"
                    >
                        <Menu size={20} className="text-white" />
                    </button>
                </div>
            )}

            <ChatSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
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

            {!isResultsPanelOpen && searchResults.length > 0 && (
                <button
                    onClick={() => setIsResultsPanelOpen(true)}
                    className="absolute top-35 right-2.5 z-[100] w-10 h-10 bg-[#12121a]/90 backdrop-blur-sm border border-[#2a2a3a] rounded-lg flex items-center justify-center hover:bg-[#1a1a25] hover:border-cyan-500/30 transition-all duration-300 ease-out"
                >
                    <PanelRightOpen size={20} className="text-white" />
                </button>
            )}

            <ResultsPanel
                results={searchResults}
                aiZones={aiZones}
                isVisible={isResultsPanelOpen}
                onClose={() => setIsResultsPanelOpen(false)}
                onPlaceClick={handlePlaceClick}
            />

            <div className="w-full h-full">
                <Map
                    onMapReady={handleMapReady}
                    searchResults={searchResults}
                    directionsResult={directionsResult}
                    selectedRouteIndex={selectedRouteIndex}
                    onStreetViewChange={handleStreetViewChange}
                    zoneClusters={zoneClusters}
                    aiZones={aiZones}
                />

                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#0a0a0f]/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0a0a0f]/50 to-transparent" />
                </div>
            </div>
        </main>
    );
}
