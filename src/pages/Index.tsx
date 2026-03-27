import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import DashboardSection from "@/components/DashboardSection";
import Footer from "@/components/Footer";
import PriceWidget from "@/components/PriceWidget";
const Index = () => {
  return (
    <div className="relative">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <PriceWidget />
      <DashboardSection />
      <Footer />
      
    </div>
  );
};

export default Index;
