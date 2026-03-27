import { useEffect, useState } from "react";
import axios from "axios";
import { TrendingUp } from "lucide-react";

interface PriceItem {
  symbol: string;
  price_usd?: number;
  price_egp?: number;
}

const PriceWidget = () => {
  const [prices, setPrices] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currency, setCurrency] = useState<"USD" | "EGP">("USD"); // Currency state

  const fetchPrices = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/market/price");
      setPrices(res.data.data); // backend returns { data: [...] }
    } catch (err) {
      setError("Failed to load market prices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  // Toggle currency when any stock clicked
  const handleStockClick = () => {
    setCurrency(currency === "USD" ? "EGP" : "USD");
  };

  return (
    <section className="py-20 px-6 text-center">
      {/* Title */}
      <div className="mb-10 animate-fade-in">
        <h2 className="text-4xl font-bold mb-3">
          Real-Time <span className="text-primary">Analytics</span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Stay updated with live stock prices and market movements.
        </p>
      </div>

      {/* Loading & Error */}
      {loading && <p className="text-muted-foreground animate-pulse">Loading market prices...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Prices Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {prices.map((item, index) => (
            <div
              key={index}
              onClick={handleStockClick} // Click any stock to toggle currency
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center justify-center gap-2 transform transition duration-300 hover:scale-105 animate-fade-in cursor-pointer"
            >
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-foreground font-medium">{item.symbol}</span>
              <span
                className={`font-semibold animate-pulse ${
                  currency === "USD" ? "text-red-500" : "text-green-500"
                }`}
              >
                {currency === "USD"
                  ? `$${item.price_usd?.toFixed(2)}`
                  : `EGP ${item.price_egp?.toFixed(2)}`}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default PriceWidget;