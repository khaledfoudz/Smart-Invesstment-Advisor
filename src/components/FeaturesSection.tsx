import { Brain, TrendingUp, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Brain,
    title: "AI-Advisor Your Way",
    description: "Personalized investment strategies powered by advanced machine learning algorithms that adapt to your financial goals and risk tolerance.",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Analytics & Insights",
    description: "Access comprehensive market data, portfolio performance metrics, and predictive analytics updated in real-time for informed decision-making.",
  },
  {
    icon: DollarSign,
    title: "Completely Free Service",
    description: "No hidden costs, no subscriptions, no fees. Enjoy full access to all features completely free with complete transparency.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="relative py-24 px-4 overflow-hidden">
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Built for <span className="text-gradient">Modern Investors</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to make smarter investment decisions, all in one powerful platform
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="group relative bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-all duration-500 overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-primary/10 group-hover:to-transparent transition-all duration-500" />
              
              <CardContent className="relative p-8">
                <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                
                <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-gradient transition-all duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-500" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
