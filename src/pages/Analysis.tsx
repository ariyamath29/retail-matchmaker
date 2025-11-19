import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Target, DollarSign, TrendingUp } from "lucide-react";

const Analysis = () => {
  const navigate = useNavigate();
  const [surveyData, setSurveyData] = useState<any>(null);

  useEffect(() => {
    const data = sessionStorage.getItem("surveyData");
    if (!data) {
      navigate("/");
      return;
    }
    setSurveyData(JSON.parse(data));
  }, [navigate]);

  if (!surveyData) return null;

  const handleContinue = () => {
    navigate("/matching");
  };

  // Mock analysis data - in production this would come from AI
  const analysis = {
    demographic: {
      title: "Your Target Demographic",
      description: "Health-conscious millennials and Gen Z consumers (ages 25-40)",
      needs: [
        "Seeking sustainable, eco-friendly products",
        "Prioritize organic and natural ingredients",
        "Value transparency in sourcing and production",
        "Willing to pay premium for quality and values alignment"
      ]
    },
    valueProposition: {
      title: "Your Value Proposition",
      points: [
        "Organic, locally-sourced ingredients that appeal to health-conscious consumers",
        "Sustainable packaging addresses environmental concerns",
        "Authentic brand story creates emotional connection",
        "Quality products justify premium positioning"
      ]
    },
    priceRange: {
      title: "Recommended Price Range",
      min: 8,
      max: 15,
      rationale: "Based on similar organic snack brands in boutique retail spaces, your products should be positioned in the $8-15 range to maintain perceived quality while remaining competitive."
    }
  };

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
                  {analysis.demographic.title}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {analysis.demographic.description}
                </p>
              </div>
            </div>
            <div className="ml-16 space-y-3">
              <p className="font-semibold text-foreground">Their Key Needs:</p>
              <ul className="space-y-2">
                {analysis.demographic.needs.map((need, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span className="text-foreground">{need}</span>
                  </li>
                ))}
              </ul>
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
                  {analysis.valueProposition.title}
                </h2>
                <p className="text-muted-foreground">
                  How your brand meets their needs
                </p>
              </div>
            </div>
            <div className="ml-16 space-y-3">
              <ul className="space-y-3">
                {analysis.valueProposition.points.map((point, index) => (
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
                  {analysis.priceRange.title}
                </h2>
                <div className="flex items-baseline gap-2 mt-3">
                  <span className="text-4xl font-bold text-success">
                    ${analysis.priceRange.min} - ${analysis.priceRange.max}
                  </span>
                  <span className="text-muted-foreground">per unit</span>
                </div>
              </div>
            </div>
            <div className="ml-16">
              <p className="text-foreground leading-relaxed">
                {analysis.priceRange.rationale}
              </p>
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
