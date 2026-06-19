import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import api from "@/lib/axios";

const questionnaireSchema = z.object({
  age: z.coerce.number({ invalid_type_error: "Age is required" }).min(18, "Must be at least 18").max(100),
  occupation: z.string().min(2, "Occupation is required"),
  location: z.string().optional(),
  monthly_income: z.coerce.number({ invalid_type_error: "Income is required" }).min(0),
  current_savings: z.coerce.number({ invalid_type_error: "Savings are required" }).min(0),
  monthly_expenses: z.coerce.number({ invalid_type_error: "Expenses are required" }).min(0),
  investment_amount: z.coerce.number({ invalid_type_error: "Investment amount is required" }).min(0),
  existing_investments: z.string().optional(),
  investment_objective: z.enum(["wealth_growth", "regular_income", "specific_goal"], {
    errorMap: () => ({ message: "Please select an objective" }),
  }),
  investment_goal_description: z.string().optional(),
  investment_horizon: z.enum(["short_term", "medium_term", "long_term"], {
    errorMap: () => ({ message: "Please select a horizon" }),
  }),
  risk_tolerance: z.enum(["conservative", "balanced", "aggressive"], {
    errorMap: () => ({ message: "Please select your risk tolerance" }),
  }),
  risk_reaction: z.enum(["sell_all", "sell_some", "hold", "buy_more"], {
    errorMap: () => ({ message: "Please select your reaction" }),
  }),
});

type QuestionnaireFormData = z.infer<typeof questionnaireSchema>;

const stepFields: Record<number, (keyof QuestionnaireFormData)[]> = {
  1: ["age", "occupation", "location"],
  2: ["monthly_income", "current_savings", "monthly_expenses", "investment_amount", "existing_investments"],
  3: ["investment_objective", "investment_goal_description", "investment_horizon"],
  4: ["risk_tolerance", "risk_reaction"],
};

const Questionnaire = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  // Only show step errors after user explicitly tried to proceed
  const [showErrors, setShowErrors] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const occupationRef = useRef<HTMLInputElement>(null);
  const locationRef   = useRef<HTMLInputElement>(null);
  const savingsRef    = useRef<HTMLInputElement>(null);
  const expensesRef   = useRef<HTMLInputElement>(null);
  const investAmtRef  = useRef<HTMLInputElement>(null);
  const goalDescRef   = useRef<HTMLInputElement>(null);

  const form = useForm<QuestionnaireFormData>({
    resolver: zodResolver(questionnaireSchema),
    defaultValues: {
      age: undefined,
      occupation: "",
      location: "",
      monthly_income: undefined,
      current_savings: undefined,
      monthly_expenses: undefined,
      investment_amount: undefined,
      existing_investments: "",
      investment_objective: undefined,
      investment_goal_description: "",
      investment_horizon: undefined,
      risk_tolerance: undefined,
      risk_reaction: undefined,
    },
  });

  // Reset error visibility and clear errors every time step changes
  useEffect(() => {
    setShowErrors(false);
    form.clearErrors();
  }, [step, form]);

  const nextStep = async () => {
    setShowErrors(true);
    const isValid = await form.trigger(stepFields[step]);
    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => setStep((prev) => prev - 1);

  const handleFieldEnter = async (
    e: React.KeyboardEvent,
    fieldName: keyof QuestionnaireFormData,
    nextRef?: React.RefObject<HTMLInputElement>,
    isLastFieldInStep?: boolean
  ) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const isValid = await form.trigger(fieldName);
    if (!isValid) return;
    if (nextRef?.current) nextRef.current.focus();
    else if (isLastFieldInStep) await nextStep();
  };

  const onSubmit = async (data: QuestionnaireFormData) => {
    setLoading(true);
    try {
      const token   = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      const user    = userStr ? JSON.parse(userStr) : null;

      if (!token || !user?.id) {
        toast({ title: "Authentication Error", description: "Please log in to continue", variant: "destructive" });
        navigate("/auth");
        return;
      }

      await api.post("/api/questionnaire", {
        age: data.age,
        occupation: data.occupation,
        location: data.location || null,
        monthly_income: data.monthly_income,
        current_savings: data.current_savings,
        monthly_expenses: data.monthly_expenses,
        investment_amount: data.investment_amount,
        existing_investments: data.existing_investments || null,
        investment_objective: data.investment_objective,
        investment_goal_description: data.investment_goal_description || null,
        investment_horizon: data.investment_horizon,
        risk_tolerance: data.risk_tolerance,
        risk_reaction: data.risk_reaction,
      });

      const riskMap: Record<string, string> = { conservative: "Low", balanced: "Medium", aggressive: "High" };
      const horizonMap: Record<string, string> = { short_term: "Short", medium_term: "Medium", long_term: "Long" };

      const modelInput = {
        age: data.age,
        salary: data.monthly_income,
        savings: data.current_savings,
        investment_value: data.investment_amount,
        risk_tolerance: riskMap[data.risk_tolerance],
        investment_horizon: horizonMap[data.investment_horizon],
      };

      toast({ title: "Success!", description: "Generating your personalized investment recommendations..." });
      navigate("/recommendations", { state: { questionnaireData: data, modelInput } });
    } catch (error: unknown) {
      let errorMessage = "Something went wrong";
      if (axios.isAxiosError(error)) errorMessage = error.response?.data?.message || error.message;
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Investment Profile Questionnaire</CardTitle>
            <CardDescription>Step {step} of 4 — Help us understand your investment needs</CardDescription>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {/* ── STEP 1 ── */}
                {step === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Personal Information</h3>

                    <FormField control={form.control} name="age" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age *</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Enter your age" {...field} value={field.value ?? ""}
                            onKeyDown={(e) => handleFieldEnter(e, "age", occupationRef)} />
                        </FormControl>
                        {showErrors && <FormMessage />}
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="occupation" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Occupation *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Software Engineer" {...field} ref={occupationRef}
                            onKeyDown={(e) => handleFieldEnter(e, "occupation", locationRef)} />
                        </FormControl>
                        {showErrors && <FormMessage />}
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="location" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Cairo, Egypt" {...field} ref={locationRef}
                            onKeyDown={(e) => handleFieldEnter(e, "location", undefined, true)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                )}

                {/* ── STEP 2 ── */}
                {step === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Financial Information</h3>

                    <FormField control={form.control} name="monthly_income" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Income (EGP) *</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g. 15000" {...field} value={field.value ?? ""}
                            onKeyDown={(e) => handleFieldEnter(e, "monthly_income", savingsRef)} />
                        </FormControl>
                        {showErrors && <FormMessage />}
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="current_savings" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Savings (EGP) *</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g. 50000" {...field} value={field.value ?? ""}
                            ref={savingsRef} onKeyDown={(e) => handleFieldEnter(e, "current_savings", expensesRef)} />
                        </FormControl>
                        {showErrors && <FormMessage />}
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="monthly_expenses" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Expenses (EGP) *</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g. 8000" {...field} value={field.value ?? ""}
                            ref={expensesRef} onKeyDown={(e) => handleFieldEnter(e, "monthly_expenses", investAmtRef)} />
                        </FormControl>
                        {showErrors && <FormMessage />}
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="investment_amount" render={({ field }) => (
                      <FormItem>
                        <FormLabel>How much would you like to invest? (EGP) *</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g. 20000" {...field} value={field.value ?? ""}
                            ref={investAmtRef} onKeyDown={(e) => handleFieldEnter(e, "investment_amount", undefined, true)} />
                        </FormControl>
                        {showErrors && <FormMessage />}
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="existing_investments" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Existing Investments</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe any current investments (stocks, real estate, gold, etc.)"
                            className="resize-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                )}

                {/* ── STEP 3 ── */}
                {step === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Investment Goals</h3>

                    <FormField control={form.control} name="investment_objective" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Investment Objective *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select your objective" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="wealth_growth">Wealth Growth — grow my money over time</SelectItem>
                            <SelectItem value="regular_income">Regular Income — generate steady cash flow</SelectItem>
                            <SelectItem value="specific_goal">Specific Goal — save toward a defined target</SelectItem>
                          </SelectContent>
                        </Select>
                        {showErrors && <FormMessage />}
                      </FormItem>
                    )} />

                    {form.watch("investment_objective") === "specific_goal" && (
                      <FormField control={form.control} name="investment_goal_description" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Describe Your Goal</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Save for a house down payment" {...field} ref={goalDescRef} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}

                    <FormField control={form.control} name="investment_horizon" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Investment Horizon *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select a time horizon" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="short_term">Short Term — less than 2 years</SelectItem>
                            <SelectItem value="medium_term">Medium Term — 2 to 5 years</SelectItem>
                            <SelectItem value="long_term">Long Term — 5+ years</SelectItem>
                          </SelectContent>
                        </Select>
                        {showErrors && <FormMessage />}
                      </FormItem>
                    )} />
                  </div>
                )}

                {/* ── STEP 4 ── */}
                {step === 4 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Risk Profile</h3>

                    <FormField control={form.control} name="risk_tolerance" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Risk Tolerance *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select your risk tolerance" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="conservative">Conservative — I prefer safety over high returns</SelectItem>
                            <SelectItem value="balanced">Balanced — I'm comfortable with moderate risk</SelectItem>
                            <SelectItem value="aggressive">Aggressive — I chase higher returns, accepting higher risk</SelectItem>
                          </SelectContent>
                        </Select>
                        {showErrors && <FormMessage />}
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="risk_reaction" render={({ field }) => (
                      <FormItem>
                        <FormLabel>If your portfolio dropped 20% in a month, you would… *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>

                            <SelectTrigger><SelectValue placeholder="Select your reaction" /></SelectTrigger>

                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sell_all">Sell everything — cut losses and get out</SelectItem>
                            <SelectItem value="sell_some">Sell some — reduce exposure but stay partially in</SelectItem>
                            <SelectItem value="hold">Hold — stay put and wait for recovery</SelectItem>
                            <SelectItem value="buy_more">Buy more — it's a discount, increase the position</SelectItem>
                          </SelectContent>
                        </Select>
                        {showErrors && <FormMessage />}
                      </FormItem>
                    )} />
                  </div>
                )}

                {/* ── Navigation ── */}
                <div className="flex justify-between pt-6">
                  {step > 1 && (
                    <Button type="button" variant="outline" onClick={prevStep}>Previous</Button>
                  )}
                  {step < 4 ? (
                    <Button type="button" onClick={nextStep} className="ml-auto">Next</Button>
                  ) : (
                    <Button type="submit" disabled={loading} className="ml-auto"
                      onClick={() => setShowErrors(true)}>
                      {loading ? "Submitting..." : "Submit"}
                    </Button>
                  )}
                </div>

              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Questionnaire;