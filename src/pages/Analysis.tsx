import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Target, DollarSign, TrendingUp, Store, Loader2, AlertOctagon } from "lucide-react";
import { generateProductMarketFitInsights, type ProductMarketFitInsights } from "@/lib/llm";

const Analysis = () => {
  const navigate = useNavigate();
  const [surveyData, setSurveyData] = useState<any>(null);
  const [analysis, setAnalysis] = useState<ProductMarketFitInsights | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem("surveyData");
    if (!data) {
      navigate("/");
      return;
    }
    setSurveyData(JSON.parse(data));
  }, [navigate]);

  const requestInsights = useCallback(async () => {
    if (!surveyData) return;
    setStatus("loading");
    setError(null);
    try {
      const insights = await generateProductMarketFitInsights({
        productName: surveyData.businessName,
        productDescription: surveyData.productDescription,
        brandMission: surveyData.brandMission,
      });
      setAnalysis(insights);
      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unable to generate AI insights.");
    }
  }, [surveyData]);

  useEffect(() => {
    if (surveyData) {
      void requestInsights();
    }
  }, [surveyData, requestInsights]);

  const handleContinue = () => {
    navigate("/matching");
  };

  const demographicNeeds = analysis?.demographic?.needs?.length
    ? analysis.demographic.needs
    : [
        status === "loading"
          ? "Analyzing your responses to identify priority shopper needs..."
          : "Focus on clarity and proof points in your survey to unlock deeper insights.",
      ];

  const valueProps = analysis?.valueProps?.length
    ? analysis.valueProps
    : [
        status === "loading"
          ? "Capturing the strongest value props for your buyers..."
          : "Add more detail about your differentiation to improve AI guidance.",
      ];

  const priceRange = useMemo(() => {
    if (analysis?.priceRange) {
      return analysis.priceRange;
    }
    return {
      min: 10,
      max: 20,
      rationale:
        status === "loading"
          ? "Crunching category benchmarks..."
          : "Using a default premium range until AI analysis succeeds.",
    };
  }, [analysis, status]);

  const recommendedStores = analysis?.recommendedStoreTypes?.length
    ? analysis.recommendedStoreTypes
    : [
        status === "loading"
          ? "Identifying the best channel fits..."
          : "Describe your ideal stockists for more tailored recommendations.",
      ];

  if (!surveyData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background flex items-center justify-center px-4">
        <Card className="max-w-lg w-full p-8 text-center space-y-4 border-border bg-card shadow-md">
          <h2 className="text-2xl font-bold text-foreground">We need your survey answers first</h2>
          <p className="text-muted-foreground">
            Start with the brand survey so we can analyze your product market fit.
          </p>
          <Button size="lg" onClick={() => navigate("/")}>
            Go to Survey
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      <div className="container max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Your Product Market Fit Analysis
          </h1>
          <p className="text-lg text-muted-foreground">
            Based on your brand profile, here's what we discovered
          </p>

          {status !== "success" && (
            <p className="mt-3 text-sm text-muted-foreground flex items-center justify-center gap-2">
              {status === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating AI insights from your survey...
                </>
              ) : status === "error" ? (
                <>
                  <AlertOctagon className="h-4 w-4 text-destructive" />
                  {error ?? "We couldn't load AI insights. Showing fallback guidance."}
                  <Button variant="outline" size="sm" className="ml-2" onClick={requestInsights}>
                    Try again
                  </Button>
                </>
              ) : null}
            </p>
          )}
        </div>

        <div className="space-y-6 mb-8">
          {/* Demographics Card */}
          <Card className="p-8 border-border bg-card shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-xl bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Your Target Demographic
                </h2>
                <p className="text-lg text-muted-foreground">
                  {analysis?.demographic?.summary ??
                    (status === "loading"
                      ? "Pinpointing the best-fit shopper cohort..."
                      : "Health-conscious shoppers exploring better-for-you goods.")}
                </p>
              </div>
            </div>
            <div className="ml-16 space-y-3">
              <p className="font-semibold text-foreground">Their Key Needs:</p>
              <ul className="space-y-2">
                {demographicNeeds.map((need, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span className="text-foreground">{need}</span>
                  </li>
                ))}
              </ul>
              {analysis?.demographic?.psychographics?.length ? (
                <div className="pt-4">
                  <p className="font-semibold text-foreground mb-2">Psychographic signals:</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis?.demographic?.psychographics?.map((signal) => (
                      <span key={signal} className="text-sm px-3 py-1 bg-secondary/60 rounded-full text-muted-foreground">
                        {signal}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </Card>

          {/* Value Proposition Card */}
          <Card className="p-8 border-border bg-card shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-xl bg-accent/10">
                <Target className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Your Value Proposition
                </h2>
                <p className="text-muted-foreground">
                  How your brand meets their needs
                </p>
              </div>
            </div>
            <div className="ml-16 space-y-3">
              <ul className="space-y-3">
                {valueProps.map((point, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                    <TrendingUp className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          {/* Price Range Card */}
          <Card className="p-8 border-border bg-gradient-to-br from-card to-secondary/20 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-xl bg-success/10">
                <DollarSign className="w-6 h-6 text-success" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Recommended Price Range
                </h2>
                <div className="flex items-baseline gap-2 mt-3">
                  <span className="text-4xl font-bold text-success">
                    ${priceRange.min} - ${priceRange.max}
                  </span>
                  <span className="text-muted-foreground">per unit</span>
                </div>
              </div>
            </div>
            <div className="ml-16">
              <p className="text-foreground leading-relaxed">
                {priceRange.rationale}
              </p>
            </div>
          </Card>

          {/* Recommended Store Types */}
          <Card className="p-8 border-border bg-card shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-xl bg-secondary/60">
                <Store className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Ideal Store Archetypes</h2>
                <p className="text-muted-foreground">
                  Use these retailer profiles as a starting point for outreach.
                </p>
              </div>
            </div>
            <div className="ml-16 grid gap-3">
              {recommendedStores.map((storeType, index) => (
                <div
                  key={`${storeType}-${index}`}
                  className="p-4 rounded-xl border border-border/60 bg-secondary/40 text-foreground"
                >
                  {storeType}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary to-primary-light rounded-2xl p-8 text-center shadow-lg">
          <h3 className="text-2xl font-bold text-primary-foreground mb-3">
            Ready to Find Your Perfect Matches?
          </h3>
          <p className="text-primary-foreground/90 mb-6 text-lg">
            We'll now match you with retail stores that align with your product market fit
          </p>
          <Button
            onClick={handleContinue}
            size="lg"
            variant="secondary"
            className="h-14 px-12 text-lg font-semibold"
          >
            Find My Matches
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
