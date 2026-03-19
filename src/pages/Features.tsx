import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Brain, 
  TrendingUp, 
  Lock,
  UserPlus,
  ClipboardList,
  Target,
  Lightbulb,
  AlertTriangle,
  DollarSign
} from "lucide-react";
import PriceWidget from "@/components/PriceWidget" ;
const Features = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description: "Advanced AI analyzes your profile and provides personalized investment recommendations that match your risk tolerance and financial goals.",
    },
    {
      icon: TrendingUp,
      title: "Real-Time Analytics",
      description: <PriceWidget />  ,
    },
    {
      icon: Lock,
      title: "100% Free Service",
      description: "No charges, no subscriptions, no hidden fees. All features are completely free to use forever.",
    },
    {
      icon: UserPlus,
      title: "Secure Authentication",
      description: "Simple and secure user registration and login system to protect your personal data and investment preferences.",
    },
    {
      icon: ClipboardList,
      title: "Smart Questionnaire",
      description: "Answer a few questions about your salary, risk tolerance, and investment goals to help us understand your needs.",
    },
    {
      icon: Target,
      title: "Profile Analysis",
      description: "Our AI evaluates your responses to determine your investor profile - whether you're balanced or aggressive in your approach.",
    },
    {
      icon: Lightbulb,
      title: "Investment Recommendations",
      description: "Receive the best investment type tailored specifically for your profile, with clear explanations of why it's ideal for you.",
    },
    {
      icon: AlertTriangle,
      title: "Risk Analysis",
      description: "Understand the risk ratio of your recommended investments with detailed breakdowns and comparisons.",
    },
    {
      icon: DollarSign,
      title: "Financial Return Insights",
      description: "Get transparent projections of potential financial returns based on your investment profile and market conditions.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-electric-blue/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Powerful Features for{" "}
              <span className="text-gradient">SMIA</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to make informed investment decisions and grow your wealth confidently
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Features;