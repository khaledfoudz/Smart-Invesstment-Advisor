import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Download, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import api from "@/lib/axios";
import { getRecommendation } from "@/api";

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState<string>("");
  const [mlRecommendation, setMlRecommendation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mlLoading, setMlLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const questionnaireData = location.state?.questionnaireData;
    const modelInput        = location.state?.modelInput;

    if (!questionnaireData) {
      toast({
        title: "Error",
        description: "No questionnaire data found. Please complete the questionnaire first.",
        variant: "destructive",
      });
      navigate("/questionnaire");
      return;
    }

    /* ✅ Existing LLM recommendations
    const generateRecommendations = async () => {
      try {
        const res = await api.post("/api/generate-recommendations", { questionnaireData });
        setRecommendations(res.data.recommendations);
      } catch (error: any) {
        console.error("Error generating recommendations:", error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to generate recommendations",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };*/

    // ✅ New XGBoost model prediction
    const fetchMLRecommendation = async () => {
      if (!modelInput) {
        setMlLoading(false);
        return;
      }
      try {
        const data = await getRecommendation(modelInput);
        setMlRecommendation(data.recommendation);
      } catch (error: any) {
        console.error("ML prediction error:", error);
        setMlRecommendation(null);
      } finally {
        setMlLoading(false);
      }
    };

    // generateRecommendations();
    fetchMLRecommendation();
  }, [location.state, navigate, toast]);

/*  const handleDownload = () => {
    const blob = new Blob([mlRecommendation], { type: "text/markdown" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "investment-recommendations.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded", description: "Your recommendations have been saved" });
  };*/

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        {/* ✅ XGBoost Model Prediction Card */}
       {/* <Card className="mb-6 border-primary/40">
          <CardHeader>
            <CardTitle className="text-xl">AI Model Prediction</CardTitle>
            <CardDescription>Based on your financial profile — XGBoost model</CardDescription>
          </CardHeader>
          <CardContent>
            {mlLoading ? (
              <Skeleton className="h-10 w-48" />
            ) : mlRecommendation ? (
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground">Recommended investment type:</span>
                <span className="text-2xl font-bold text-primary">{mlRecommendation}</span>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Model prediction unavailable.</p>
            )}
          </CardContent>
        </Card>
        */}

        {/* ✅ Existing LLM Recommendations Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl flex items-center gap-2">
                  <Sparkles className="h-8 w-8 text-primary" />
                  Your Personalized Investment Recommendations
                </CardTitle>
                <CardDescription className="mt-2">
                  AI-powered analysis based on your investment profile
                </CardDescription>
              </div>
             {/* {!mlLoading && mlRecommendation && (
                <Button onClick={handleDownload} variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              )}*/} 
            </div>
          </CardHeader>
          <CardContent>
            {mlLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-32 w-full mt-6" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : (
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <ReactMarkdown>{mlRecommendation}</ReactMarkdown>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex gap-4">
          <Button onClick={() => navigate("/")}>Go to Dashboard</Button>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;