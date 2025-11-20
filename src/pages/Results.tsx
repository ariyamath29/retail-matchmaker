import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchMatches, type StoreMatch } from "@/lib/matchmaking";
import type { LucideIcon } from "lucide-react";
import {
  Mail,
  Phone,
  MapPin,
  Truck,
  Clock,
  TrendingUp,
  ExternalLink,
  Instagram,
  Loader2,
} from "lucide-react";

const Results = () => {
  const navigate = useNavigate();
  const [surveyData, setSurveyData] = useState<any>(null);
  const [sellerId, setSellerId] = useState<string | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem("surveyData");
    if (!data) {
      navigate("/");
      return;
    }
    setSurveyData(JSON.parse(data));
    setSellerId(sessionStorage.getItem("sellerId"));
  }, [navigate]);

  const matchesQuery = useQuery({
    queryKey: ["matches", sellerId],
    queryFn: () => fetchMatches({ sellerId, limit: 6 }),
    enabled: Boolean(surveyData),
    staleTime: 1000 * 60,
  });

  if (!surveyData) return null;

  const matches = matchesQuery.data?.matches ?? [];
  const dataSource = matchesQuery.data?.source ?? "stores";

  const handleNewSearch = () => {
    sessionStorage.removeItem("surveyData");
    sessionStorage.removeItem("sellerId");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-success text-success-foreground">
            {matches.length}{" "}
            {dataSource === "matches" ? "Personalized Matches" : "Featured Stores"}
          </Badge>
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Your Retail Store Matches
          </h1>
          <p className="text-lg text-muted-foreground">
            Stores that align with your product market fit from Supabase
          </p>
          {dataSource === "stores" && !matchesQuery.isLoading && (
            <p className="text-sm text-muted-foreground mt-3">
              We could not find existing match scores for this seller, so here are the
              most recently updated stores from your database.
            </p>
          )}
        </div>

        <div>
          {matchesQuery.isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
              <Loader2 className="w-10 h-10 animate-spin" />
              <p>Fetching stores from Supabase...</p>
            </div>
          ) : matchesQuery.isError ? (
            <Card className="p-8 text-center space-y-4">
              <p className="text-lg font-semibold text-destructive">
                {matchesQuery.error instanceof Error
                  ? matchesQuery.error.message
                  : "We couldn't load your matches."}
              </p>
              <Button onClick={() => matchesQuery.refetch()}>Try again</Button>
            </Card>
          ) : matches.length === 0 ? (
            <Card className="p-8 text-center space-y-2">
              <p className="text-lg font-semibold text-foreground">
                No stores available just yet
              </p>
              <p className="text-muted-foreground">
                Add stores to Supabase or try again later to see fresh matches.
              </p>
            </Card>
          ) : (
            <div className="space-y-8">
              {matches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <Button variant="outline" size="lg" onClick={handleNewSearch} className="font-semibold">
            Start New Search
          </Button>
        </div>
      </div>
    </div>
  );
};

const MatchCard = ({ match }: { match: StoreMatch }) => {
  const locationLabel = match.address ?? match.neighborhood ?? "Location coming soon";
  const distributionLabel = match.distributionChannel ?? "Distribution to be confirmed";
  const leadTimeLabel = match.leadTime ? `Lead time: ${match.leadTime}` : "Lead time to be confirmed";
  const imageSrc = match.imageUrl || "/placeholder.svg";

  return (
    <Card className="overflow-hidden border-border bg-card shadow-md hover:shadow-xl transition-all">
      <div className="grid md:grid-cols-[300px,1fr] gap-0">
        <div className="relative h-64 md:h-auto overflow-hidden">
          <img src={imageSrc} alt={match.name} className="w-full h-full object-cover" />
          <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
            <Badge className="bg-success text-success-foreground shadow-lg text-base px-3 py-1">
              {match.matchScore}% Match
            </Badge>
            {match.fallback && (
              <Badge variant="outline" className="text-xs bg-background/80 text-foreground">
                Featured
              </Badge>
            )}
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">{match.name}</h2>
              <Badge variant="secondary" className="text-sm">
                {match.niche ?? "General Market"}
              </Badge>
              {match.neighborhood && (
                <p className="text-sm text-muted-foreground mt-1">{match.neighborhood}</p>
              )}
            </div>
          </div>

          <div className="mb-4 p-4 bg-secondary/50 rounded-lg border border-border">
            <p className="text-sm font-semibold text-foreground mb-1">Store Focus</p>
            <p className="text-foreground italic">
              {match.niche ?? "This retailer curates emerging brands and specialty goods."}
            </p>
          </div>

          <div className="mb-6">
            <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Why this store is a fit:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {match.reasons.length > 0 ? (
                match.reasons.map((reason, idx) => (
                  <div
                    key={`${match.id}-reason-${idx}`}
                    className="p-3 bg-secondary/50 rounded-lg border border-border text-sm text-foreground"
                  >
                    {reason}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  We don't have insight notes for this store yet, but it frequently stocks
                  adjacent categories.
                </p>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <DetailRow icon={MapPin} label={locationLabel} />
            <DetailRow icon={Truck} label={distributionLabel} />
            <DetailRow icon={Clock} label={leadTimeLabel} />
          </div>

          <div className="flex flex-wrap gap-3">
            {match.email && (
              <Button
                className="bg-primary hover:bg-primary-dark"
                onClick={() => (window.location.href = `mailto:${match.email}`)}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
            )}
            {match.phone && (
              <Button variant="outline" onClick={() => (window.location.href = `tel:${match.phone}`)}>
                <Phone className="w-4 h-4 mr-2" />
                Call
              </Button>
            )}
            {match.url && (
              <Button
                variant="outline"
                onClick={() => window.open(match.url as string, "_blank", "noopener,noreferrer")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Website
              </Button>
            )}
            {match.instagram && (
              <Button
                variant="outline"
                onClick={() => window.open(match.instagram as string, "_blank", "noopener,noreferrer")}
              >
                <Instagram className="w-4 h-4 mr-2" />
                Instagram
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

const DetailRow = ({ icon: Icon, label }: { icon: LucideIcon; label: string }) => (
  <div className="flex items-center gap-3 text-sm">
    <Icon className="w-4 h-4 text-muted-foreground" />
    <span className="text-foreground">{label}</span>
  </div>
);

export default Results;
