import { useEffect, useState } from "react";
import axios from "axios";
import { TrendingUp } from "lucide-react";

interface PriceItem {
  symbol: string;
  price?: string;
}

const PriceWidget = () => {
  const [prices, setPrices] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/market/price");
        console.log("API response:", res.data);
        setPrices(res.data);
      } catch (err) {
        console.error("Error fetching prices:", err);
        setError("Failed to load market prices");
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  if (loading) {
    return <p className="text-muted-foreground mb-8">Loading market prices...</p>;
  }

  if (error) {
    return <p className="text-red-500 mb-8">{error}</p>;
  }

  if (!prices.length) {
    return <p className="text-muted-foreground mb-8">No market data available.</p>;
  }

  return (
    <div className="space-y-4 mb-8">
      {prices.map((item, index) => (
        <div key={index} className="flex items-start gap-3">
          <TrendingUp className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />

          <span className="text-foreground">
            {item.symbol}
            {item.price ? ` : $${Number(item.price).toFixed(2)}` : " : Price unavailable"}
          </span>
        </div>
      ))}
    </div>
  );
};

export default PriceWidget;