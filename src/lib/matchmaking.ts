import { getSupabaseClient } from "./supabase";

export type SellerProfilePayload = {
  businessName: string;
  productDescription: string;
  brandMission: string;
  website?: string;
  instagram?: string;
};

export type StoreMatch = {
  id: string;
  name: string;
  imageUrl?: string | null;
  neighborhood?: string | null;
  address?: string | null;
  niche?: string | null;
  matchScore: number;
  distributionChannel?: string | null;
  leadTime?: string | null;
  email?: string | null;
  phone?: string | null;
  instagram?: string | null;
  url?: string | null;
  reasons: string[];
  fallback: boolean;
  createdAt?: string | null;
};

export type MatchResponse = {
  matches: StoreMatch[];
  source: "matches" | "stores";
};

type StoreRow = {
  id: string;
  name: string;
  image_url?: string | null;
  address?: string | null;
  neighborhood?: string | null;
  niche_text?: string | null;
  distribution_channel?: string | null;
  lead_time?: string | null;
  email?: string | null;
  phone?: string | null;
  url?: string | null;
  ig?: string | null;
};

type SellerRow = {
  id: string;
  name: string;
  product?: string | null;
  story?: string | null;
};

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "your",
  "from",
  "their",
  "brand",
  "values",
  "mission",
  "product",
  "products",
  "retail",
  "store",
  "stores",
  "cpg",
  "into",
  "are",
  "our",
  "you",
  "we",
]);

const KEYWORD_GROUPS: Array<{
  id: string;
  keywords: string[];
  reason: string;
  weight: number;
}> = [
  {
    id: "sustainability",
    keywords: ["sustainable", "sustainability", "eco", "earth", "organic", "clean", "recycled", "vegan", "green"],
    reason: "Both prioritize sustainable and eco-friendly goods.",
    weight: 14,
  },
  {
    id: "wellness",
    keywords: ["wellness", "health", "beauty", "selfcare", "skincare", "spa", "relaxation"],
    reason: "Focus on wellness and self-care mirrors this store's shoppers.",
    weight: 12,
  },
  {
    id: "food",
    keywords: ["gourmet", "food", "snack", "kitchen", "culinary", "beverage", "drink"],
    reason: "The store curates culinary and pantry-driven assortments that complement your product.",
    weight: 12,
  },
  {
    id: "lifestyle",
    keywords: ["lifestyle", "home", "decor", "design", "modern", "minimal"],
    reason: "Lifestyle positioning aligns with the store's merchandising point of view.",
    weight: 10,
  },
  {
    id: "family",
    keywords: ["family", "kids", "baby", "parent", "mom", "dad", "child"],
    reason: "Family-friendly messaging resonates with this retailer's demographic.",
    weight: 10,
  },
  {
    id: "community",
    keywords: ["local", "community", "neighborhood", "artisan", "craft", "indie"],
    reason: "Community-first language matches the store's mission to highlight local makers.",
    weight: 8,
  },
  {
    id: "premium",
    keywords: ["premium", "luxury", "elevated", "boutique", "modern"],
    reason: "Premium positioning fits the store's upscale shopper base.",
    weight: 8,
  },
];

const DISTRIBUTION_TAGS: Record<string, string[]> = {
  online: ["online", "direct-to-consumer", "ecommerce", "digital", "d2c", "subscription"],
  boutique: ["boutique", "independent", "curated", "concept", "shop"],
  grocery: ["grocery", "market", "supermarket", "food hall"],
  wellness: ["spa", "wellness", "apothecary", "beauty"],
};

const FALLBACK_REASONS = [
  "Store was recently updated from your Supabase dataset.",
  "Carries adjacent products and has capacity for new makers.",
];

const clampScore = (score: number) => Math.max(1, Math.min(100, Math.round(score)));

const sanitizeInstagram = (handle?: string | null) => {
  if (!handle) return null;
  if (handle.startsWith("http")) return handle;
  return `https://instagram.com/${handle.replace(/^@/, "")}`;
};

const tokenize = (text?: string | null) => {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token && token.length > 2 && !STOP_WORDS.has(token));
};

const toKeywordSet = (parts: Array<string | undefined | null>) => {
  const tokens = parts.flatMap((part) => tokenize(part));
  return new Set(tokens);
};

const detectDistributionTag = (text?: string | null) => {
  if (!text) return null;
  const normalized = text.toLowerCase();
  return Object.entries(DISTRIBUTION_TAGS).find(([, keywords]) =>
    keywords.some((keyword) => normalized.includes(keyword)),
  )?.[0];
};

const buildReasonsFromGroups = (sellerTokens: Set<string>, storeTokens: Set<string>) => {
  const matchedReasons: string[] = [];
  let weightBoost = 0;

  KEYWORD_GROUPS.forEach((group) => {
    const sellerHas = group.keywords.some((keyword) => sellerTokens.has(keyword));
    const storeHas = group.keywords.some((keyword) => storeTokens.has(keyword));

    if (sellerHas && storeHas) {
      weightBoost += group.weight;
      matchedReasons.push(group.reason);
    }
  });

  return { weightBoost, matchedReasons };
};

const createSimilarityScore = ({
  sellerTokens,
  storeTokens,
  store,
  sellerDistributionTags,
}: {
  sellerTokens: Set<string>;
  storeTokens: Set<string>;
  store: StoreRow;
  sellerDistributionTags: string[];
}) => {
  const overlapTokens = [...sellerTokens].filter((token) => storeTokens.has(token));
  const baseSimilarity = overlapTokens.length / Math.max(4, sellerTokens.size || 1);
  let score = 30 + baseSimilarity * 45;

  const { weightBoost, matchedReasons } = buildReasonsFromGroups(sellerTokens, storeTokens);
  score += weightBoost;

  const storeDistributionTag = detectDistributionTag(store.distribution_channel);
  if (storeDistributionTag && sellerDistributionTags.includes(storeDistributionTag)) {
    score += 8;
    matchedReasons.push("Distribution preferences align with this retailer's channel strengths.");
  }

  if (store.niche_text) {
    matchedReasons.push(`Retailer niche: ${store.niche_text}.`);
    score += 5;
  }

  if (store.neighborhood) {
    matchedReasons.push(`Popular with ${store.neighborhood} shoppers looking for emerging brands.`);
  }

  if (overlapTokens.length > 0) {
    matchedReasons.push(`Shared focus on ${overlapTokens.slice(0, 2).join(" & ")}.`);
  }

  return {
    score: clampScore(score),
    reasons: Array.from(new Set(matchedReasons)).slice(0, 4),
  };
};

const parseReasons = (reasons: unknown): string[] => {
  if (!reasons) return [];

  if (Array.isArray(reasons)) {
    return reasons
      .map((reason) => {
        if (typeof reason === "string") return reason;
        if (reason && typeof reason === "object") {
          const candidate =
            (reason as Record<string, unknown>).reason ??
            (reason as Record<string, unknown>).message ??
            Object.values(reason as Record<string, unknown>)[0];
          if (typeof candidate === "string") return candidate;
        }
        return null;
      })
      .filter((value): value is string => Boolean(value));
  }

  if (typeof reasons === "object") {
    return Object.values(reasons as Record<string, unknown>)
      .map((value) => (typeof value === "string" ? value : null))
      .filter((value): value is string => Boolean(value));
  }

  if (typeof reasons === "string") {
    return [reasons];
  }

  return [];
};

const toStoreMatch = (
  store: StoreRow,
  score: number,
  reasons: string[],
  fallback: boolean,
  createdAt?: string | null,
): StoreMatch => ({
  id: store.id,
  name: store.name,
  imageUrl: store.image_url,
  neighborhood: store.neighborhood ?? undefined,
  address: store.address ?? undefined,
  niche: store.niche_text ?? undefined,
  matchScore: clampScore(score),
  distributionChannel: store.distribution_channel ?? undefined,
  leadTime: store.lead_time ?? undefined,
  email: store.email ?? undefined,
  phone: store.phone ?? undefined,
  instagram: sanitizeInstagram(store.ig),
  url: store.url ?? undefined,
  reasons: reasons.length ? reasons : fallback ? [...FALLBACK_REASONS] : [],
  fallback,
  createdAt,
});

export const createSellerProfile = async (payload: SellerProfilePayload) => {
  const supabase = getSupabaseClient();

  const urls = [payload.website, sanitizeInstagram(payload.instagram)]
    .filter((value): value is string => Boolean(value?.trim()));

  const { data, error } = await supabase
    .from("sellers")
    .insert({
      name: payload.businessName.trim(),
      product: payload.productDescription.trim(),
      story: payload.brandMission.trim(),
      urls: urls.length ? urls : undefined,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to save your brand profile right now.");
  }

  return data.id as string;
};

export const fetchMatches = async ({
  sellerId,
  limit = 6,
}: {
  sellerId?: string | null;
  limit?: number;
}): Promise<MatchResponse> => {
  const supabase = getSupabaseClient();

  if (!sellerId) {
    const matches = await fetchFeaturedStores(limit);
    return { source: "stores", matches };
  }

  const { data, error } = await supabase
    .from("matches")
    .select(
      `
    score,
    reasons_json,
    created_at,
    stores:store_id (
      id,
      name,
      image_url,
      address,
      neighborhood,
      niche_text,
      distribution_channel,
      lead_time,
      email,
      phone,
      url,
      ig
    )
  `,
    )
    .eq("seller_id", sellerId)
    .order("score", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message ?? "Unable to load matches from Supabase.");
  }

  const normalized =
    data
      ?.filter((match): match is typeof match & { stores: StoreRow } => Boolean(match.stores))
      .map((match) =>
        toStoreMatch(match.stores, Number(match.score ?? 0), parseReasons(match.reasons_json), false, match.created_at),
      ) ?? [];

  if (normalized.length === 0) {
    const generated = sellerId ? await generateAlgorithmicMatches(supabase, sellerId, limit) : [];
    if (generated.length > 0) {
      return { source: "matches", matches: generated };
    }

    const fallback = await fetchFeaturedStores(limit);
    return { source: "stores", matches: fallback };
  }

  return { source: "matches", matches: normalized };
};

const generateAlgorithmicMatches = async (
  supabase: ReturnType<typeof getSupabaseClient>,
  sellerId: string,
  limit: number,
): Promise<StoreMatch[]> => {
  const [sellerResult, storesResult] = await Promise.all([
    supabase.from("sellers").select("id,name,product,story").eq("id", sellerId).single(),
    supabase
      .from("stores")
      .select(
        `
        id,
        name,
        image_url,
        address,
        neighborhood,
        niche_text,
        distribution_channel,
        lead_time,
        email,
        phone,
        url,
        ig
      `,
      )
      .order("last_crawl_at", { ascending: false })
      .limit(limit * 4),
  ]);

  if (sellerResult.error || !sellerResult.data) {
    return [];
  }

  if (storesResult.error) {
    throw new Error(storesResult.error.message ?? "Unable to load stores for matching.");
  }

  const seller = sellerResult.data as SellerRow;
  const sellerTextBlob = [seller.name, seller.product, seller.story].filter(Boolean).join(" ").toLowerCase();
  const sellerTokens = toKeywordSet([sellerTextBlob]);
  if (sellerTokens.size === 0) {
    return [];
  }

  const sellerDistributionTags = Object.entries(DISTRIBUTION_TAGS)
    .filter(([, keywords]) => keywords.some((keyword) => sellerTextBlob.includes(keyword)))
    .map(([tag]) => tag);

  const matches =
    storesResult.data
      ?.map((store) => {
        const storeTokens = toKeywordSet([store.niche_text, store.distribution_channel, store.neighborhood]);
        const { score, reasons } = createSimilarityScore({
          sellerTokens,
          storeTokens,
          store,
          sellerDistributionTags,
        });

        return { store, score, reasons };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ store, score, reasons }) =>
        toStoreMatch(store, score, reasons.length ? reasons : ["Strong overlap with your niche."], false, null),
      ) ?? [];

  return matches;
};

const fetchFeaturedStores = async (limit = 6): Promise<StoreMatch[]> => {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("stores")
    .select(
      `
      id,
      name,
      image_url,
      address,
      neighborhood,
      niche_text,
      distribution_channel,
      lead_time,
      email,
      phone,
      url,
      ig
    `,
    )
    .order("last_crawl_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message ?? "Unable to load stores from Supabase.");
  }

  return (
    data?.map((store, index) =>
      toStoreMatch(store, 85 - index * 3, [], true, null),
    ) ?? []
  );
};
