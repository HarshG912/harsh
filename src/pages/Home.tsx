import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, CheckCircle2, Shield, Zap, TrendingUp, Users, Clock } from "lucide-react";
import { Link } from "react-router-dom";
const Home = () => {
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <img alt="Logo" className="h-10 w-10 object-cover rounded-none" src="https://qpnkeklxlwtpotucfdba.supabase.co/storage/v1/object/public/STT/STT%20Logo%20blue%20(1).png" />
            </Link>

            <span className="text-xl font-bold text-foreground">RestaurantSTT</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
            <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
          </nav>
          <Link to="/plansopen">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              Smart Restaurant Management
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
              Streamline your restaurant operations
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage orders, track inventory, and delight customers with our all-in-one platform. Built for modern
              restaurants.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/plansopen">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/plansopen">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Watch Demo
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-8 pt-4">
              <div>
                <div className="text-2xl font-bold text-foreground">500+</div>
                <div className="text-sm text-muted-foreground">Restaurants</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">98%</div>
                <div className="text-sm text-muted-foreground">Satisfaction</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">24/7</div>
                <div className="text-sm text-muted-foreground">Support</div>
              </div>
            </div>
          </div>

          {/* Dashboard Preview */}
          <Card className="overflow-hidden shadow-2xl">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Dashboard</h3>
                <span className="text-sm text-muted-foreground">Today</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <div className="text-sm text-muted-foreground">Total Orders</div>
                    <div className="text-2xl font-bold text-foreground">156</div>
                    <div className="text-xs text-primary">↑ 12% vs yesterday</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <div className="text-sm text-muted-foreground">Revenue</div>
                    <div className="text-2xl font-bold text-foreground">₹45,678</div>
                    <div className="text-xs text-primary">↑ 8% vs yesterday</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="text-sm font-medium text-foreground">Recent Orders</div>
                  {[1, 2, 3].map(i => <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <div className="text-sm font-medium text-foreground">Table {i + 5}</div>
                        <div className="text-xs text-muted-foreground">Order #{1000 + i}</div>
                      </div>
                      <div className="text-sm font-medium text-foreground">
                        ₹{(Math.random() * 2000 + 500).toFixed(0)}
                      </div>
                    </div>)}
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Powerful tools for modern restaurants</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to run your restaurant efficiently and scale your business.
          </p>
        </div>

        <Tabs defaultValue="overview" className="max-w-5xl mx-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-foreground">Real-time insights at your fingertips</h3>
                <p className="text-muted-foreground">
                  Track orders, monitor kitchen performance, and analyze sales trends with live updates and smart
                  analytics.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">Live order tracking & status updates</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">Sales analytics & revenue forecasting</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">Customer feedback & ratings</span>
                  </li>
                </ul>
              </div>
              <Card className="overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <TrendingUp className="h-8 w-8 text-primary" />
                    <span className="text-sm font-medium text-primary">Live</span>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-foreground">₹1,23,456</div>
                    <div className="text-sm text-muted-foreground">Today's Revenue</div>
                  </div>
                  <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="automation" className="mt-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-foreground">Automate repetitive tasks</h3>
                <p className="text-muted-foreground">
                  Save time with automated inventory alerts, bill generation, and kitchen order management.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">Automated bill generation & QR payments</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">Smart inventory tracking & alerts</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">Kitchen display system integration</span>
                  </li>
                </ul>
              </div>
              <Card className="overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Zap className="h-8 w-8 text-primary" />
                    <div>
                      <div className="text-sm font-medium text-foreground">Automation Enabled</div>
                      <div className="text-xs text-muted-foreground">45+ tasks automated</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {["Bill Generation", "Inventory Alerts", "Order Routing"].map(task => <div key={task} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm text-foreground">{task}</span>
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </div>)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security" className="mt-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-foreground">Enterprise-grade security</h3>
                <p className="text-muted-foreground">
                  Your data is protected with industry-standard encryption and secure payment processing.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">End-to-end encryption</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">PCI-DSS compliant payments</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">Regular security audits</span>
                  </li>
                </ul>
              </div>
              <Card className="overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-8 w-8 text-primary" />
                    <div>
                      <div className="text-sm font-medium text-foreground">Security Status</div>
                      <div className="text-xs text-primary">All systems secure</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {["Data Encryption", "Secure Payments", "Access Control"].map(feature => <div key={feature} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm text-foreground">{feature}</span>
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </div>)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <Users className="h-12 w-12 text-primary mx-auto" />
            <div className="text-4xl font-bold text-foreground">500+</div>
            <div className="text-muted-foreground">Active Restaurants</div>
          </div>
          <div className="space-y-2">
            <Clock className="h-12 w-12 text-primary mx-auto" />
            <div className="text-4xl font-bold text-foreground">50K+</div>
            <div className="text-muted-foreground">Orders Processed Daily</div>
          </div>
          <div className="space-y-2">
            <TrendingUp className="h-12 w-12 text-primary mx-auto" />
            <div className="text-4xl font-bold text-foreground">98%</div>
            <div className="text-muted-foreground">Customer Satisfaction</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="pricing" className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Ready to transform your restaurant?</h2>
          <p className="text-lg text-muted-foreground">
            Join hundreds of restaurants already using RestaurantSTT to streamline their operations.
          </p>
          <Link to="/plansopen">
            <Button size="lg" className="text-lg px-8">
              Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground">No credit card required. 14-day free trial.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Link to="/" className="flex items-center gap-2">
                  <img alt="Logo" className="h-10 w-10 object-cover rounded-none" src="https://qpnkeklxlwtpotucfdba.supabase.co/storage/v1/object/public/STT/STT%20Logo%20blue%20(1).png" />
                </Link>
                <span className="text-lg font-bold text-foreground">RestaurantSTT</span>
              </div>
              <p className="text-sm text-muted-foreground">Modern restaurant management for the digital age.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#features" className="hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-foreground transition-colors rounded-none">
                    Pricing
                  </a>
                </li>
                <li>
                  <Link to="/auth" className="hover:text-foreground transition-colors">
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="about" className="hover:text-foreground transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="/contact" className="hover:text-foreground transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/privacy-policy" className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms-of-service" className="hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/refund-policy" className="hover:text-foreground transition-colors">
                    Refund Policy
                  </Link>
                </li>
                <li>
                  <Link to="/payment-processing" className="hover:text-foreground transition-colors">
                    Payment Processing Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 RestaurantSTT. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Home;