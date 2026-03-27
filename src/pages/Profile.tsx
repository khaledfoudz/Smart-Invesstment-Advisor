import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Pencil, Check, X } from 'lucide-react';

const RISK_CONFIG = {
  conservative: { label: 'Conservative', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  balanced:     { label: 'Moderate',     color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  aggressive:   { label: 'Aggressive',   color: 'text-red-400',   bg: 'bg-red-500/10 border-red-500/20'   },
};

const HORIZON_LABELS: Record<string, string> = {
  short_term:  'Short-term (0–2 years)',
  medium_term: 'Medium-term (2–5 years)',
  long_term:   'Long-term (5+ years)',
};

const OBJECTIVE_LABELS: Record<string, string> = {
  wealth_growth:   'Wealth Growth',
  regular_income:  'Regular Income',
  specific_goal:   'Specific Goal',
};

const RISK_COLORS: Record<string, string> = {
  Low:    '#1D9E75',
  Medium: '#534AB7',
  High:   '#993C1D',
};

export default function Profile() {
  const { profile, loading, error, updateName } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setNameInput(profile.name);
  }, [profile]);

  const handleSave = async () => {
    if (!nameInput.trim()) return;
    setSaving(true);
    try {
      await updateName(nameInput.trim());
      // sync localStorage so Navbar shows updated name
      const stored = localStorage.getItem('user');
      if (stored) {
        const u = JSON.parse(stored);
        localStorage.setItem('user', JSON.stringify({ ...u, name: nameInput.trim() }));
      }
      toast({ title: 'Profile updated', description: 'Your name has been saved.' });
      setEditing(false);
    } catch {
      toast({ title: 'Error', description: 'Could not save changes.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const initials = profile?.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '??';

  const fmt = (n: number | null) =>
    n != null ? `EGP ${Number(n).toLocaleString()}` : '—';

  if (!loading && error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center text-destructive">{error}</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto max-w-4xl px-4 pt-28 pb-12 space-y-6">

        {/* ── Header card ── */}
        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardContent className="flex items-center gap-5 pt-6">
            {loading ? (
              <Skeleton className="w-16 h-16 rounded-full" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-xl flex-shrink-0">
                {initials}
              </div>
            )}

            <div className="flex-1 min-w-0">
              {loading ? (
                <Skeleton className="h-6 w-48 mb-2" />
              ) : editing ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={nameInput || ''}
                    onChange={e => setNameInput(e.target.value)}
                    className="h-9 max-w-xs"
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 text-green-500" />}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(false); setNameInput(profile!.name); }}>
                    <X className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-foreground">{profile?.name}</h1>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing(true)}>
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              )}
              {loading ? (
                <Skeleton className="h-4 w-64 mt-1" />
              ) : (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {profile?.email}
                  {profile?.questionnaire_completed_at
                    ? ' · Questionnaire completed'
                    : ' · Questionnaire pending'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Personal info */}
          <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium text-muted-foreground tracking-widest uppercase">
                Personal information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-5 w-full" />)
              ) : (
                <>
                  <Row label="Email" value={profile?.email ?? '—'} />
                  <Row label="Age" value={profile?.age ? `${profile.age} years old` : '—'} />
                  <Row label="Occupation" value={profile?.occupation ?? '—'} />
                  <Row label="Location" value={profile?.location ?? '—'} />
                </>
              )}
            </CardContent>
          </Card>

          {/* Financial profile */}
          <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium text-muted-foreground tracking-widest uppercase">
                Financial profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-5 w-full" />)
              ) : (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Risk tolerance</span>
                    {profile?.risk_tolerance ? (
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${RISK_CONFIG[profile.risk_tolerance].bg} ${RISK_CONFIG[profile.risk_tolerance].color}`}>
                        {RISK_CONFIG[profile.risk_tolerance].label}
                      </span>
                    ) : <span className="text-foreground text-sm">—</span>}
                  </div>
                  <Row label="Investment horizon" value={profile?.investment_horizon ? HORIZON_LABELS[profile.investment_horizon] ?? profile.investment_horizon : '—'} />
                  <Row label="Investment objective" value={profile?.investment_objective ? OBJECTIVE_LABELS[profile.investment_objective] ?? profile.investment_objective : '—'} />
                  <Row label="Monthly income" value={fmt(profile?.monthly_income ?? null)} />
                  <Row label="Current savings" value={fmt(profile?.current_savings ?? null)} />
                  <Row label="Monthly expenses" value={fmt(profile?.monthly_expenses ?? null)} />
                </>
              )}
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {profile?.questionnaire_completed_at
                    ? `Updated ${new Date(profile.questionnaire_completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                    : 'Not completed yet'}
                </span>
                <button
                  onClick={() => navigate('/questionnaire')}
                  className="text-xs text-primary hover:underline"
                >
                  {profile?.questionnaire_completed_at ? 'Retake questionnaire' : 'Start questionnaire'}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Allocation card */}
        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground tracking-widest uppercase">
              Recommended allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}
              </div>
            ) : !profile?.recommendations?.length ? (
              <p className="text-sm text-muted-foreground">
                No recommendations yet — complete the questionnaire to generate your portfolio.
              </p>
            ) : (
              <div className="space-y-3">
                {(() => {
                  const total = profile.recommendations.reduce((s, r) => s + Number(r.confidencescore), 0);
                  return profile.recommendations.map(rec => {
                    const pct = Math.round((Number(rec.confidencescore) / total) * 100);
                    return (
                      <div key={rec.investmentname} className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-48 shrink-0 truncate">{rec.investmentname}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-muted">
                          <div
                            className="h-1.5 rounded-full transition-all"
                            style={{ width: `${pct}%`, background: RISK_COLORS[rec.investmentrisk] ?? '#888' }}
                          />
                        </div>
                        <span className="text-sm font-medium text-foreground w-10 text-right">{pct}%</span>
                        <span className="text-xs text-muted-foreground w-16 text-right">{rec.expectedreturn}% exp.</span>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </CardContent>
        </Card>

      </main>
      <Footer />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
}