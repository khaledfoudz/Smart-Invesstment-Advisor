import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import DashboardSection from "@/components/DashboardSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="relative">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <DashboardSection />
      <Footer />
    </div>
  );
};

export default Index;
