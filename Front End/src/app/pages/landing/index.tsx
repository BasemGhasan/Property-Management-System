import { useNavigate } from "react-router";
import { ROUTES } from "@/app/constants/auth";
import { LANDING_ASSETS } from "@/app/constants/landing-assets";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Building2, Wrench, Users, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* ── Sticky Nav ──────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-medium tracking-tight">PropCare</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(ROUTES.login)}>
              Log In
            </Button>
            <Button onClick={() => navigate(ROUTES.roleSelection)}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* ── Hero Section ────────────────────────────────────────────────────── */}
        <section className="relative pt-24 pb-32 overflow-hidden">
          {/* Subtle grid texture overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

          <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
            <h1 className="font-display text-5xl md:text-7xl tracking-tight max-w-4xl text-balance">
              Smarter Property Management, <span className="text-primary italic">Realized.</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl text-balance">
              Streamline operations, delight tenants, and empower owners from a single intelligent platform designed for modern real estate.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="h-12 px-8 text-base" onClick={() => navigate(ROUTES.roleSelection)}>
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-transparent border-primary/20 hover:bg-primary/5" onClick={() => navigate(ROUTES.login)}>
                Log In
              </Button>
            </div>

            <div className="mt-20 w-full max-w-5xl rounded-2xl overflow-hidden border border-border shadow-2xl shadow-primary/10">
              <div className="aspect-[16/9] md:aspect-[21/9] relative bg-muted">
                <img
                  src={LANDING_ASSETS.hero}
                  alt="Modern apartment building exterior with balconies"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Value Proposition Section ───────────────────────────────────────── */}
        <section className="py-24 bg-card border-y border-border">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl">Everything you need to manage smarter</h2>
              <p className="mt-4 text-muted-foreground">Comprehensive tools built for property managers, owners, and residents.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="bg-background border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-display text-2xl">Portfolio Oversight</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-foreground/80">
                    Track all your properties, units, and leases in one centralized dashboard. Get real-time insights into occupancy and performance.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-background border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-warning-soft flex items-center justify-center mb-4">
                    <Wrench className="h-6 w-6 text-warning" />
                  </div>
                  <CardTitle className="font-display text-2xl">Maintenance Hub</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-foreground/80">
                    Streamline repair requests from submission to resolution. Assign tasks, track progress, and communicate with vendors effortlessly.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-background border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-plum-soft flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-plum" />
                  </div>
                  <CardTitle className="font-display text-2xl">Dedicated Portals</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-foreground/80">
                    Empower residents with self-service tools and provide property owners with transparent reporting through dedicated access portals.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ── Stats Band ──────────────────────────────────────────────────────── */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-primary-foreground/20">
              <div className="py-4 md:py-0">
                <div className="font-display text-5xl font-medium">5+</div>
                <div className="mt-2 text-primary-foreground/80">Properties Managed</div>
              </div>
              <div className="py-4 md:py-0">
                <div className="font-display text-5xl font-medium">4+</div>
                <div className="mt-2 text-primary-foreground/80">Tenants Supported</div>
              </div>
              <div className="py-4 md:py-0">
                <div className="font-display text-5xl font-medium">24/7</div>
                <div className="mt-2 text-primary-foreground/80">Support Uptime</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Product Showcase Section ────────────────────────────────────────── */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="font-display text-4xl">Designed for Clarity and Control</h2>
            </div>

            <div className="space-y-24 max-w-6xl mx-auto">
              {/* Feature 1 */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="font-display text-3xl mb-4">Real-time Dashboard</h3>
                  <p className="text-lg text-muted-foreground mb-6">
                    Get instant visibility into maintenance requests, occupancy rates, and financial health. Our intuitive dashboard brings the most critical metrics to the forefront, allowing you to make informed decisions quickly.
                  </p>
                  <ul className="space-y-3">
                    {["Instant alerts for urgent requests", "Visual portfolio mapping", "Exportable compliance reports"].map((item, i) => (
                      <li key={i} className="flex items-center text-foreground/80">
                        <ArrowRight className="h-4 w-4 mr-3 text-primary" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl overflow-hidden border border-border bg-muted shadow-lg aspect-square md:aspect-[4/3] relative">
                  <img
                    src={LANDING_ASSETS.showcase1}
                    alt="Modern apartment facade"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Feature 2 */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1 rounded-2xl overflow-hidden border border-border bg-muted shadow-lg aspect-square md:aspect-[4/3] relative">
                  <img
                    src={LANDING_ASSETS.showcase2}
                    alt="Apartment building with geometric balconies"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="order-1 md:order-2">
                  <h3 className="font-display text-3xl mb-4">Seamless Communication</h3>
                  <p className="text-lg text-muted-foreground mb-6">
                    Keep owners, residents, and staff perfectly in sync. Broadcast community announcements, track maintenance chats, and securely share documents without ever leaving the platform.
                  </p>
                  <ul className="space-y-3">
                    {["Automated status updates", "Integrated messaging channels", "Document sharing repository"].map((item, i) => (
                      <li key={i} className="flex items-center text-foreground/80">
                        <ArrowRight className="h-4 w-4 mr-3 text-primary" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Final CTA Banner ────────────────────────────────────────────────── */}
        <section className="py-24 bg-card border-t border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-background border border-border/50 rounded-3xl p-12 md:p-16 text-center shadow-sm">
              <h2 className="font-display text-4xl mb-6">Ready to elevate your properties?</h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Join modern property managers who are already saving time and delighting their communities with PropCare.
              </p>
              <Button size="lg" className="h-14 px-10 text-lg" onClick={() => navigate(ROUTES.roleSelection)}>
                Create an Account
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-background py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <span className="font-display text-lg text-muted-foreground">PropCare</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">About</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          </div>
          <div className="text-sm text-muted-foreground">
            &copy; 2026 PropCare. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
