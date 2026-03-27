import { useState, useEffect } from 'react';
import api from '@/lib/axios';

export interface Recommendation {
  investmentname: string;
  investmentrisk: string;
  investment_capital: number;
  investment_horizon: string;
  expectedreturn: number;
  confidencescore: number;
  resultsdate: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  answersid: number | null;
  age: number | null;
  occupation: string | null;
  location: string | null;
  monthly_income: number | null;
  current_savings: number | null;
  monthly_expenses: number | null;
  existing_investments: string | null;
  investment_objective: string | null;
  investment_goal_description: string | null;
  investment_horizon: string | null;
  risk_tolerance: 'conservative' | 'balanced' | 'aggressive' | null;
  risk_reaction: string | null;
  questionnaire_completed_at: string | null;
  recommendations: Recommendation[];
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/api/user/profile');
      setProfile(res.data);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const updateName = async (name: string) => {
    await api.put('/api/user/profile', { name });
    await fetchProfile();
  };

  useEffect(() => { fetchProfile(); }, []);

  return { profile, loading, error, updateName, refetch: fetchProfile };
}