import { CheckCircle2 } from "lucide-react";
import dashboardTablet from "@/assets/dashboard-tablet.jpg";
import PriceWidget from "@/components/PriceWidget";

const features = [
  "Real-time portfolio tracking and performance metrics",
  "AI-powered insights and investment recommendations",
  "Customizable alerts and notifications",
  "Multi-asset class support (stocks, bonds, crypto, ETFs)",
  "Advanced risk analysis and diversification tools",
  "Seamless integration with major brokerages",
];

const DashboardSection = () => {
  return (
    <section className="relative py-24 px-4 overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/30 to-transparent" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Image */}
          <div className="relative animate-fade-in">
            <div className="relative rounded-2xl overflow-hidden border border-primary/20 shadow-2xl">
              <img 
                src={dashboardTablet} 
                alt="Young professional reviewing investment portfolio on tablet with modern dashboard interface" 
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
            </div>
            
            {/* Floating badge */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary text-primary-foreground px-6 py-3 rounded-full shadow-xl font-semibold animate-fade-in" style={{ animationDelay: "0.5s" }}>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Live Dashboard Updates
              </span>
            </div>
          </div>

          {/* Right - Content */}
          <div className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-medium text-primary">Intuitive Interface</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Dashboard <span className="text-gradient">Built for You</span>
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Experience the power of a fully personalized investment dashboard designed to give you complete control over your financial future. Track, analyze, and optimize your portfolio with tools trusted by thousands of investors.
            </p>

            <div className="space-y-4">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-3 animate-fade-in"
                  style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                >
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 p-6 bg-card/50 backdrop-blur-sm border border-primary/20 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-card flex items-center justify-center text-xs font-bold text-primary-foreground">
                      {i}K
                    </div>
                  ))}
                  
                </div>
                <div>
                  <div className="font-semibold text-foreground">Trusted by 10,000+ investors</div>
                  <div className="text-sm text-muted-foreground">Join a community of smart investors</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardSection;
