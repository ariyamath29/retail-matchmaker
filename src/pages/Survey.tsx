import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { createSellerProfile } from "@/lib/matchmaking";
import { Globe, Instagram, Loader2 } from "lucide-react";

const Survey = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: "",
    productDescription: "",
    brandMission: "",
    website: "",
    instagram: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const sellerId = await createSellerProfile(formData);
      sessionStorage.setItem("surveyData", JSON.stringify(formData));
      sessionStorage.setItem("sellerId", sellerId);
      toast({
        title: "Brand profile saved",
        description: "We stored your answers in Supabase and will use them to find matches.",
      });
      navigate("/analysis");
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "We couldn't save your profile",
        description:
          error instanceof Error ? error.message : "Please check your internet connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      <div className="container max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Find Your Perfect Retail Match
          </h1>
          <p className="text-lg text-muted-foreground">
            Let's start by learning about your brand and products
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Business Name */}
            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-base font-semibold">
                Business Name *
              </Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) =>
                  setFormData({ ...formData, businessName: e.target.value })
                }
                placeholder="e.g., Green Earth Snacks"
                required
                className="h-12 text-base"
              />
            </div>

            {/* Product Description */}
            <div className="space-y-2">
              <Label htmlFor="productDescription" className="text-base font-semibold">
                Product Description *
              </Label>
              <Textarea
                id="productDescription"
                value={formData.productDescription}
                onChange={(e) =>
                  setFormData({ ...formData, productDescription: e.target.value })
                }
                placeholder="Describe your products, ingredients, packaging, and what makes them unique..."
                required
                className="min-h-32 text-base resize-none"
              />
            </div>

            {/* Brand Mission */}
            <div className="space-y-2">
              <Label htmlFor="brandMission" className="text-base font-semibold">
                Brand Mission & Values *
              </Label>
              <Textarea
                id="brandMission"
                value={formData.brandMission}
                onChange={(e) =>
                  setFormData({ ...formData, brandMission: e.target.value })
                }
                placeholder="What's your brand's story? What values drive your business?"
                required
                className="min-h-32 text-base resize-none"
              />
            </div>

            {/* Optional Imports */}
            <div className="border-t border-border pt-8 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Optional: Import Your Digital Presence
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Help us understand your brand better by importing your website or Instagram
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-base flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Website URL
                    </Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) =>
                        setFormData({ ...formData, website: e.target.value })
                      }
                      placeholder="https://yourbrand.com"
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="text-base flex items-center gap-2">
                      <Instagram className="w-4 h-4" />
                      Instagram Handle
                    </Label>
                    <Input
                      id="instagram"
                      value={formData.instagram}
                      onChange={(e) =>
                        setFormData({ ...formData, instagram: e.target.value })
                      }
                      placeholder="@yourbrand"
                      className="h-12 text-base"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary-light hover:opacity-90 transition-opacity"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving your profile...
                </>
              ) : (
                "Continue to Analysis"
              )}
            </Button>
          </form>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Your information is secure and will only be used to find your best retail matches
        </p>
      </div>
    </div>
  );
};

export default Survey;
