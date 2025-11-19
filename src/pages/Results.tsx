import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  MapPin,
  Truck,
  Clock,
  TrendingUp,
  ExternalLink,
  Instagram,
} from "lucide-react";

const Results = () => {
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

  // Mock match data - in production this would come from the database
  const matches = [
    {
      id: 1,
      name: "Green Valley Market",
      image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop",
      neighborhood: "Brooklyn, NY",
      niche: "Organic & Health-Focused",
      demographics: "Health-conscious millennials, families",
      matchScore: 95,
      email: "contact@greenvalleymarket.com",
      phone: "(555) 123-4567",
      distributionChannel: "Direct delivery",
      leadTime: "2-3 weeks",
      similarProducts: [
        { name: "Organic Trail Mix", price: "$12.99" },
        { name: "Vegan Protein Bars", price: "$9.99" },
        { name: "Superfood Granola", price: "$14.99" },
      ],
    },
    {
      id: 2,
      name: "Urban Harvest Co-op",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
      neighborhood: "Portland, OR",
      niche: "Sustainable & Local",
      demographics: "Eco-conscious consumers, young professionals",
      matchScore: 92,
      email: "hello@urbanharvest.coop",
      phone: "(555) 234-5678",
      distributionChannel: "Regional distributor",
      leadTime: "3-4 weeks",
      similarProducts: [
        { name: "Artisan Energy Bites", price: "$11.50" },
        { name: "Kombucha Snacks", price: "$10.99" },
        { name: "Raw Nut Butter", price: "$13.99" },
      ],
    },
    {
      id: 3,
      name: "Wellness Corner",
      image: "https://images.unsplash.com/photo-1555529902-5261145633bf?w=400&h=300&fit=crop",
      neighborhood: "San Francisco, CA",
      niche: "Premium Health Foods",
      demographics: "Affluent health enthusiasts, fitness community",
      matchScore: 89,
      email: "info@wellnesscorner.com",
      phone: "(555) 345-6789",
      distributionChannel: "Direct delivery",
      leadTime: "2 weeks",
      similarProducts: [
        { name: "Keto Snack Mix", price: "$15.99" },
        { name: "Probiotic Treats", price: "$12.50" },
        { name: "Plant Protein Bars", price: "$13.99" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      <div className="container max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-success text-success-foreground">
            {matches.length} Perfect Matches Found
          </Badge>
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Your Retail Store Matches
          </h1>
          <p className="text-lg text-muted-foreground">
            Stores that align perfectly with your product market fit
          </p>
        </div>

        {/* Match Cards */}
        <div className="space-y-8">
          {matches.map((match) => (
            <Card
              key={match.id}
              className="overflow-hidden border-border bg-card shadow-md hover:shadow-xl transition-all"
            >
              <div className="grid md:grid-cols-[300px,1fr] gap-0">
                {/* Store Image */}
                <div className="relative h-64 md:h-auto overflow-hidden">
                  <img
                    src={match.image}
                    alt={match.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-success text-success-foreground shadow-lg text-base px-3 py-1">
                      {match.matchScore}% Match
                    </Badge>
                  </div>
                </div>

                {/* Store Details */}
                <div className="p-6 md:p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-2">
                        {match.name}
                      </h2>
                      <Badge variant="secondary" className="text-sm">
                        {match.niche}
                      </Badge>
                    </div>
                  </div>

                  {/* Store Niche */}
                  <div className="mb-4 p-4 bg-secondary/50 rounded-lg border border-border">
                    <p className="text-sm font-semibold text-foreground mb-1">
                      Store Niche:
                    </p>
                    <p className="text-foreground italic">{match.niche}</p>
                  </div>

                  {/* Demographics */}
                  <div className="mb-6 p-4 bg-secondary/50 rounded-lg">
                    <p className="text-sm font-semibold text-foreground mb-1">
                      Store Demographics:
                    </p>
                    <p className="text-foreground">{match.demographics}</p>
                  </div>

                  {/* Similar Products */}
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Similar Products in Store:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {match.similarProducts.map((product, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-secondary/50 rounded-lg border border-border"
                        >
                          <p className="text-sm font-medium text-foreground">
                            {product.name}
                          </p>
                          <p className="text-primary font-semibold">{product.price}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact & Details Grid */}
                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{match.neighborhood}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Truck className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{match.distributionChannel}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">Lead time: {match.leadTime}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      className="bg-primary hover:bg-primary-dark"
                      onClick={() => (window.location.href = `mailto:${match.email}`)}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      {match.email}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => (window.location.href = `tel:${match.phone}`)}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      {match.phone}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/")}
            className="font-semibold"
          >
            Start New Search
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Results;
