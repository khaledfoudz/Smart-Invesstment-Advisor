import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, TrendingUp, Shield, AlertTriangle, Clock, Sparkles } from "lucide-react";
import api from "@/lib/axios";

interface Investment {
  investmentname: string;
  investmentrisk: string;
  investment_capital: number;
  investment_horizon: string;
  expectedreturn: number;
  confidencescore: number;
  resultsdate: string;
}

interface RecommendationResult {
  recommendation: string;
  dbRisk: string;
  dbHorizon: string;
  investments: Investment[];
}

// ── Risk config ──────────────────────────────────────────────────────────────
const RISK_CONFIG: Record<string, {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: typeof Shield;
  explanation: string;
}> = {
  Low: {
    label:       'Conservative',
    color:       'text-green-400',
    bg:          'bg-green-500/10',
    border:      'border-green-500/30',
    icon:        Shield,
    explanation: 'Your profile prioritises capital preservation. These investments have lower volatility and provide stable, predictable returns — ideal for protecting what you have while growing it steadily.',
  },
  Medium: {
    label:       'Moderate',
    color:       'text-amber-400',
    bg:          'bg-amber-500/10',
    border:      'border-amber-500/30',
    icon:        TrendingUp,
    explanation: 'Your balanced profile targets a healthy mix of growth and stability. These investments accept some market fluctuation in exchange for meaningfully higher long-term returns.',
  },
  High: {
    label:       'Aggressive',
    color:       'text-red-400',
    bg:          'bg-red-500/10',
    border:      'border-red-500/30',
    icon:        AlertTriangle,
    explanation: 'Your aggressive profile targets maximum growth. These investments carry higher short-term volatility but historically deliver the strongest long-term returns for investors who can weather market swings.',
  },
};

const RISK_BAR_COLOR: Record<string, string> = {
  Low:    '#1D9E75',
  Medium: '#534AB7',
  High:   '#993C1D',
};

const HORIZON_LABEL: Record<string, string> = {
  Short:  'Short-term (0–2 yrs)',
  Medium: 'Medium-term (2–5 yrs)',
  Long:   'Long-term (5+ yrs)',
};

// ── Why this recommendation ──────────────────────────────────────────────────
function buildSummary(recommendation: string, dbRisk: string, dbHorizon: string): string {
  const riskLabel  = RISK_CONFIG[dbRisk]?.label ?? dbRisk;
  const horizLabel = HORIZON_LABEL[dbHorizon] ?? dbHorizon;
  return `Based on your ${riskLabel.toLowerCase()} risk profile and ${horizLabel.toLowerCase()} investment horizon, our AI model recommends focusing on ${recommendation}. The investments below were selected because they align with both your comfort with risk and your time frame, giving you the best balance of growth potential and appropriate volatility for your situation.`;
}

// ── Component ────────────────────────────────────────────────────────────────
const Recommendations = () => {
  const [result, setResult]   = useState<RecommendationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate              = useNavigate();
  const location              = useLocation();
  const { toast }             = useToast();

  useEffect(() => {
    const modelInput       = location.state?.modelInput;
    const questionnaireData = location.state?.questionnaireData;

    if (!questionnaireData || !modelInput) {
      toast({
        title:       'Error',
        description: 'No questionnaire data found. Please complete the questionnaire first.',
        variant:     'destructive',
      });
      navigate('/questionnaire');
      return;
    }

    const generate = async () => {
      try {
        const res = await api.post('/api/recommendations/generate', { modelInput });
        setResult(res.data);
      } catch (err: any) {
        toast({
          title:       'Error',
          description: err.response?.data?.error || 'Failed to generate recommendations',
          variant:     'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    generate();
  }, [location.state, navigate, toast]);

  const totalScore  = result?.investments.reduce((s, r) => s + Number(r.confidencescore), 0) ?? 1;
  const riskCfg     = result ? RISK_CONFIG[result.dbRisk] ?? RISK_CONFIG['Medium'] : null;
  const RiskIcon    = riskCfg?.icon ?? Shield;
  const lastUpdated = result?.investments[0]?.resultsdate
    ? new Date(result.investments[0].resultsdate).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Back */}
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="h-7 w-7 text-primary" />
              Your Investment Recommendations
            </h1>
            <p className="text-muted-foreground mt-1">AI-powered analysis saved to your profile</p>
          </div>
          {lastUpdated && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-card/50 border border-primary/20 px-3 py-1.5 rounded-full">
              <Clock className="h-3.5 w-3.5" />
              Last updated {lastUpdated}
            </div>
          )}
        </div>

        {/* ── Risk explanation card ── */}
        {loading ? (
          <Skeleton className="h-28 w-full rounded-xl" />
        ) : riskCfg && (
          <Card className={`border ${riskCfg.border} ${riskCfg.bg}`}>
            <CardContent className="flex gap-4 pt-5 pb-5">
              <div className={`mt-0.5 ${riskCfg.color}`}>
                <RiskIcon className="h-6 w-6" />
              </div>
              <div>
                <p className={`font-semibold mb-1 ${riskCfg.color}`}>
                  {riskCfg.label} risk profile · {HORIZON_LABEL[result!.dbHorizon] ?? result!.dbHorizon}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {riskCfg.explanation}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Why these recommendations ── */}
        {loading ? (
          <Skeleton className="h-20 w-full rounded-xl" />
        ) : result && (
          <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground tracking-widest uppercase">
                Why these investments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground leading-relaxed">
                {buildSummary(result.recommendation, result.dbRisk, result.dbHorizon)}
              </p>
            </CardContent>
          </Card>
        )}

        {/* ── Allocation bar ── */}
        {loading ? (
          <Skeleton className="h-24 w-full rounded-xl" />
        ) : result && (
          <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium text-muted-foreground tracking-widest uppercase">
                Portfolio allocation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.investments.map(inv => {
                const pct = Math.round((Number(inv.confidencescore) / totalScore) * 100);
                return (
                  <div key={inv.investmentname} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-48 shrink-0 truncate">
                      {inv.investmentname}
                    </span>
                    <div className="flex-1 h-1.5 rounded-full bg-muted">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{
                          width:      `${pct}%`,
                          background: RISK_BAR_COLOR[inv.investmentrisk] ?? '#888',
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground w-10 text-right">{pct}%</span>
                    <span className="text-xs text-muted-foreground w-16 text-right">
                      {inv.expectedreturn}% exp.
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* ── Investment detail cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-44 w-full rounded-xl" />)
            : result?.investments.map(inv => {
                const riskStyle = RISK_CONFIG[inv.investmentrisk] ?? RISK_CONFIG['Medium'];
                const pct       = Math.round((Number(inv.confidencescore) / totalScore) * 100);
                return (
                  <Card key={inv.investmentname} className="border-primary/20 bg-card/50 backdrop-blur-sm hover:border-primary/40 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base leading-snug">{inv.investmentname}</CardTitle>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border shrink-0 ${riskStyle.bg} ${riskStyle.border} ${riskStyle.color}`}>
                          {riskStyle.label}
                        </span>
                      </div>
                      <CardDescription className="text-xs">
                        {HORIZON_LABEL[inv.investment_horizon] ?? inv.investment_horizon}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2.5">
                      <Row label="Expected return"    value={`${inv.expectedreturn}% / year`} green />
                      <Row label="Min capital"        value={`EGP ${Number(inv.investment_capital).toLocaleString()}`} />
                      <Row label="Allocation weight"  value={`${pct}%`} />
                    </CardContent>
                  </Card>
                );
              })
          }
        </div>

        {/* ── Actions ── */}
        <div className="flex gap-4 pt-2">
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
          <Button variant="outline" onClick={() => navigate('/profile')} className="border-primary/20">
            View Profile
          </Button>
        </div>

      </div>
    </div>
  );
};

function Row({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium ${green ? 'text-green-400' : 'text-foreground'}`}>{value}</span>
    </div>
  );
}

export default Recommendations;