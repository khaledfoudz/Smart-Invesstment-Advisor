    import { useEffect, useState } from "react";
    import { useNavigate, useLocation } from "react-router-dom";
    import { useToast } from "@/hooks/use-toast";
    import { Button } from "@/components/ui/button";
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
    import { Skeleton } from "@/components/ui/skeleton";
    import { ArrowLeft, Download, Sparkles } from "lucide-react";
    import ReactMarkdown from "react-markdown";
    import api from "@/lib/axios"; 

    const Recommendations = () => {
    const [recommendations, setRecommendations] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();

    useEffect(() => {
        const generateRecommendations = async () => {
        try {
            // ✅ ناخد الداتا من الصفحة اللي قبلها
            const questionnaireData = location.state?.questionnaireData;

            if (!questionnaireData) {
            toast({
                title: "Error",
                description: "No questionnaire data found. Please complete the questionnaire first.",
                variant: "destructive",
            });
            navigate("/questionnaire");
            return;
            }

            // ✅ نكلم الباك ايند بدل supabase edge function
            const res = await api.post("/api/recommendations", {
            questionnaireData,
            });

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
        };

        generateRecommendations();
    }, [location.state, navigate, toast]);

    const handleDownload = () => {
        const blob = new Blob([recommendations], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'investment-recommendations.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
        title: "Downloaded",
        description: "Your recommendations have been saved",
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted py-12 px-4">
        <div className="max-w-4xl mx-auto">
            <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6"
            >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
            </Button>

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
                {!loading && recommendations && (
                    <Button onClick={handleDownload} variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                    </Button>
                )}
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
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
                    <ReactMarkdown>{recommendations}</ReactMarkdown>
                </div>
                )}
            </CardContent>
            </Card>

            <div className="mt-6 flex gap-4">
            <Button onClick={() => navigate("/questionnaire")} variant="outline">
                Retake Questionnaire
            </Button>
            <Button onClick={() => navigate("/")}>
                Go to Dashboard
            </Button>
            </div>
        </div>
        </div>
    );
    };

    export default Recommendations;
