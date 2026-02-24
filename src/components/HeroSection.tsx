import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import heroDashboard from "@/assets/hero-dashboard.jpg";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleStartJourney = () => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/questionnaire");
    } else {
      navigate("/auth");
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-32 px-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-electric-blue/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="text-center lg:text-left animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-card/50 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                AI-Powered Investment Platform
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Invest Smarter. <span className="text-gradient">Grow Confidently.</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
              AI-powered portfolio insights, personalised to you
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                onClick={handleStartJourney}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-primary/50 transition-all duration-300 group"
              >
                {isLoggedIn ? "Continue Your Journey" : "Start Your Journey"}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="flex items-center gap-8 mt-12 justify-center lg:justify-start text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span>100% Free Forever</span>
              </div>
            </div>
          </div>

          {/* Right content - Dashboard visual */}
          <div className="relative animate-scale-in" style={{ animationDelay: "0.3s" }}>
            <div className="relative rounded-2xl overflow-hidden border border-primary/20 shadow-2xl">
              <img
                src={heroDashboard}
                alt="AI-powered investment dashboard showing real-time analytics and portfolio insights"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            </div>

            {/* Floating stat cards */}
            <div
              className="absolute -bottom-6 -left-6 bg-card/90 backdrop-blur-md border border-primary/20 rounded-xl p-4 shadow-lg animate-fade-in"
              style={{ animationDelay: "0.6s" }}
            >
              <div className="text-2xl font-bold text-primary">+47.3%</div>
              <div className="text-sm text-muted-foreground">Portfolio Growth</div>
            </div>

            <div
              className="absolute -top-6 -right-6 bg-card/90 backdrop-blur-md border border-secondary/20 rounded-xl p-4 shadow-lg animate-fade-in"
              style={{ animationDelay: "0.9s" }}
            >
              <div className="text-2xl font-bold text-secondary">$124.5K</div>
              <div className="text-sm text-muted-foreground">Assets Under Management</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
