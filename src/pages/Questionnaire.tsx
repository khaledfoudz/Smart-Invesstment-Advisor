import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import api from "@/lib/axios"; 

const questionnaireSchema = z.object({
  age: z.coerce.number().min(18, "Must be at least 18 years old").max(100),
  occupation: z.string().min(2, "Occupation is required"),
  location: z.string().optional(),
  monthly_income: z.coerce.number().min(0, "Income must be positive"),
  current_savings: z.coerce.number().min(0, "Savings must be positive"),
  monthly_expenses: z.coerce.number().min(0, "Expenses must be positive"),
  existing_investments: z.string().optional(),
  investment_objective: z.enum(["wealth_growth", "regular_income", "specific_goal"]),
  investment_goal_description: z.string().optional(),
  investment_horizon: z.enum(["short_term", "medium_term", "long_term"]),
  risk_tolerance: z.enum(["conservative", "balanced", "aggressive"]),
  risk_reaction: z.string().min(1, "Please select a risk reaction"),
});

type QuestionnaireFormData = z.infer<typeof questionnaireSchema>;

const Questionnaire = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<QuestionnaireFormData>({
    resolver: zodResolver(questionnaireSchema),
    defaultValues: {
      occupation: "",
      location: "",
      existing_investments: "",
      investment_objective: "wealth_growth",
      investment_goal_description: "",
      investment_horizon: "medium_term",
      risk_tolerance: "balanced",
      risk_reaction: "",
    },
  });

  const onSubmit = async (data: QuestionnaireFormData) => {
    setLoading(true);
    try {
      
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      if (!token || !user?.id) {
        toast({
          title: "Authentication Error",
          description: "Please log in to continue",
          variant: "destructive",
        });
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
        existing_investments: data.existing_investments || null,
        investment_objective: data.investment_objective,
        investment_goal_description: data.investment_goal_description || null,
        investment_horizon: data.investment_horizon,
        risk_tolerance: data.risk_tolerance,
        risk_reaction: data.risk_reaction,
      });

      toast({
        title: "Success!",
        description: "Generating your personalized investment recommendations...",
      });

      // Navigate to recommendations page with questionnaire data
      navigate("/recommendations", { state: { questionnaireData: data } });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    const fields = getFieldsForStep(step);
    const isValid = await form.trigger(fields);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const getFieldsForStep = (currentStep: number): (keyof QuestionnaireFormData)[] => {
    switch (currentStep) {
      case 1:
        return ["age", "occupation", "location"];
      case 2:
        return ["monthly_income", "current_savings", "monthly_expenses", "existing_investments"];
      case 3:
        return ["investment_objective", "investment_goal_description", "investment_horizon"];
      case 4:
        return ["risk_tolerance", "risk_reaction"];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Investment Profile Questionnaire</CardTitle>
            <CardDescription>
              Step {step} of 4 - Help us understand your investment needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {step === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Personal Information</h3>

                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age *</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Enter your age" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="occupation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Occupation / Employment Status *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Software Engineer, Self-employed" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="City, Country" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Financial Situation</h3>

                    <FormField
                      control={form.control}
                      name="monthly_income"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Income ($) *</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Enter monthly income" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="current_savings"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Savings ($) *</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Enter current savings" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="monthly_expenses"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Expenses ($) *</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Enter monthly expenses" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="existing_investments"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Existing Investments (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe any existing investments (stocks, bonds, real estate, etc.)"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Investment Goals</h3>

                    <FormField
                      control={form.control}
                      name="investment_objective"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Investment Objective *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your objective" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="wealth_growth">Wealth Growth / Capital Appreciation</SelectItem>
                              <SelectItem value="regular_income">Regular Income</SelectItem>
                              <SelectItem value="specific_goal">Saving for Specific Goal</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="investment_goal_description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Goal Description (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., House, Education, Retirement"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="investment_horizon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Investment Horizon *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select time horizon" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="short_term">Short-term (0-2 years)</SelectItem>
                              <SelectItem value="medium_term">Medium-term (2-5 years)</SelectItem>
                              <SelectItem value="long_term">Long-term (5+ years)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Risk Tolerance</h3>

                    <FormField
                      control={form.control}
                      name="risk_reaction"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>If your investment drops 10% in a month, how would you react? *</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="sell_immediately" id="sell" />
                                <Label htmlFor="sell">Sell immediately to avoid further losses</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="hold_and_monitor" id="hold" />
                                <Label htmlFor="hold">Hold and monitor closely</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="buy_more" id="buy" />
                                <Label htmlFor="buy">See it as an opportunity to buy more</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="risk_tolerance"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Which statement best describes you? *</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              
                              className="flex flex-col space-y-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="conservative" id="conservative" />
                                <Label htmlFor="conservative">I prefer low but safe returns</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="balanced" id="balanced" />
                                <Label htmlFor="balanced">I'm comfortable with moderate risk for higher returns</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="aggressive" id="aggressive" />
                                <Label htmlFor="aggressive">I'm willing to take high risks for maximum returns</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <div className="flex justify-between pt-6">
                  {step > 1 && (
                    <Button type="button" variant="outline" onClick={prevStep}>
                      Previous
                    </Button>
                  )}
                  {step < 4 ? (
                    <Button type="button" onClick={nextStep} className="ml-auto">
                      Next
                    </Button>
                  ) : (
                    <Button type="submit" disabled={loading} className="ml-auto">
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
