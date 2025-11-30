import { getSupabaseClient } from "./supabase";

const EDGE_FUNCTION_NAME = "pmf-insights";

export type ProductMarketFitInsights = {
  demographic: {
    summary: string;
    needs: string[];
    psychographics: string[];
  };
  valueProps: string[];
  priceRange: {
    min: number;
    max: number;
    rationale: string;
  };
  recommendedStoreTypes: string[];
};

type SellerInput = {
  productName: string;
  productDescription: string;
  brandMission: string;
};

const normalizeArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item.trim();
        return null;
      })
      .filter((item): item is string => Boolean(item));
  }
  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }
  return [];
};

const parseNumber = (value: unknown, fallback: number) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const mapResponseToInsights = (raw: any): ProductMarketFitInsights => {
  return {
    demographic: {
      summary: raw?.demographic?.summary ?? "Emerging shoppers looking for differentiated CPG brands.",
      needs: normalizeArray(raw?.demographic?.needs),
      psychographics: normalizeArray(raw?.demographic?.psychographics),
    },
    valueProps: normalizeArray(raw?.valueProps),
    priceRange: {
      min: parseNumber(raw?.priceRange?.min, 10),
      max: parseNumber(raw?.priceRange?.max, 20),
      rationale:
        raw?.priceRange?.rationale ??
        "Benchmarking against similar premium CPG products sold through specialty retail.",
    },
    recommendedStoreTypes: normalizeArray(raw?.recommendedStoreTypes),
  };
};

export const generateProductMarketFitInsights = async (
  input: SellerInput,
): Promise<ProductMarketFitInsights> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke(EDGE_FUNCTION_NAME, {
    body: input,
  });

  if (error) {
    throw new Error(error.message ?? "Unable to generate AI insights right now.");
  }

  if (!data) {
    throw new Error("Supabase function returned no data. Please try again.");
  }

  try {
    return mapResponseToInsights(data);
  } catch (err) {
    console.error("Unable to map pmf insights response", err, data);
    throw new Error("Received an unexpected response while generating insights.");
  }
};
