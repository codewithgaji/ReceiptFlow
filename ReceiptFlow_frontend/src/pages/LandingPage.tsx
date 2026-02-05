import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Receipt, ArrowRight, Sparkles, Shield, Zap, Mail } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden gradient-hero">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="container relative z-10 px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent mb-8 animate-fade-in">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Professional Receipt Generation</span>
            </div>

            {/* Main heading */}
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-primary-foreground mb-6 animate-slide-up">
              ReceiptFlow
              <span className="block text-2xl md:text-3xl lg:text-4xl font-medium text-primary-foreground/70 mt-4">
                by Gaji
              </span>
            </h1>

            {/* Tagline */}
            <p className="text-xl md:text-2xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Generate professional receipts instantly. 
              <span className="text-accent"> Automated PDF creation, cloud storage, and email delivery.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Button asChild size="lg" className="h-14 px-8 text-lg gradient-accent text-accent-foreground hover:opacity-90 transition-opacity shadow-glow">
                <Link to="/generate">
                  <Receipt className="mr-2 h-5 w-5" />
                  Generate Receipt
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <Link to="/dashboard">
                  View Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/30 flex items-start justify-center p-2">
            <div className="w-1 h-3 rounded-full bg-primary-foreground/50" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Streamlined Receipt Management
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create, manage, and deliver professional receipts to your customers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard
              icon={Zap}
              title="Instant Generation"
              description="Create professional PDF receipts in seconds with our streamlined form. Automatically calculate taxes and totals."
            />
            <FeatureCard
              icon={Shield}
              title="Cloud Storage"
              description="All receipts are securely stored in the cloud via Cloudinary. Access them anytime, anywhere."
            />
            <FeatureCard
              icon={Mail}
              title="Email Delivery"
              description="Receipts are automatically emailed to your customers immediately after generation."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-muted/50">
        <div className="container px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ReceiptFlow by Gaji. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="group p-6 rounded-2xl bg-card border border-border hover:border-accent/50 hover:shadow-lg transition-all duration-300">
      <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center mb-5 group-hover:shadow-glow-sm transition-shadow">
        <Icon className="h-6 w-6 text-accent-foreground" />
      </div>
      <h3 className="font-display text-xl font-semibold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
