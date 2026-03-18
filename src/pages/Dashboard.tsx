import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity, DollarSign, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";

// Mock data for market overview since we don't have a live market API yet
const marketUpdates = [
  { name: "S&P 500", value: "5,123.41", change: "+1.2%", isPositive: true },
  { name: "NASDAQ", value: "16,234.12", change: "+1.8%", isPositive: true },
  { name: "Bitcoin", value: "$64,230", change: "-0.5%", isPositive: false },
  { name: "Gold", value: "$2,150.30", change: "+0.3%", isPositive: true },
];

export default function Dashboard() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Get user name from local storage
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserName(user.name);
    }

    // Fetch investments from your database
    const fetchInvestments = async () => {
      try {
        const response = await api.get("/api/investments");
        setInvestments(response.data);
      } catch (error) {
        toast({
          title: "Error fetching data",
          description: "Could not load investment options.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInvestments();
  }, [toast]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto max-w-7xl px-4 pt-28 pb-12">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, <span className="text-gradient">{userName || "Investor"}</span>
          </h1>
          <p className="text-muted-foreground">Here is your daily market overview and available investment options.</p>
        </div>

        {/* Market Updates Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {marketUpdates.map((market, index) => (
            <Card key={index} className="border-primary/20 bg-card/50 backdrop-blur-sm animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {market.name}
                </CardTitle>
                {market.isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{market.value}</div>
                <p className={`text-sm ${market.isPositive ? "text-green-500" : "text-red-500"}`}>
                  {market.change} today
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Database Investments Section */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Available Investment Vehicles
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {investments.map((inv: any) => (
                <Card key={inv.investmentId} className="border-primary/20 hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-xl">{inv.investmentname}</CardTitle>
                    <CardDescription>Risk Level: <span className="capitalize font-semibold text-foreground">{inv.investmentrisk}</span></CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Min Capital:</span>
                      <span className="font-medium">${Number(inv.investment_capital).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Expected Return:</span>
                      <span className="font-medium text-green-500">+{inv.expectedreturn}%</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Horizon:</span>
                      <span className="font-medium capitalize">{inv.investment_horizon.replace('_', ' ')}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {investments.length === 0 && (
                <p className="text-muted-foreground col-span-full">No investments found in the database yet.</p>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}