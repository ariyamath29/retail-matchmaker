
/// <reference types="jsr:@supabase/functions-js/edge-runtime" />

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const stripReasoningWrappers = (content: string) =>
  content.replace(/<think>[\s\S]*?<\/think>/g, "").replace(/```json/g, "").replace(/```/g, "").trim();

const parseJsonBody = async (req: Request): Promise<Record<string, unknown> | null> => {
  try {
    const parsed = await req.json();
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const body = await parseJsonBody(req);
  if (!body) {
    return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { productName, productDescription, brandMission } = body as {
    productName?: string;
    productDescription?: string;
    brandMission?: string;
  };

  if (!productName || !productDescription || !brandMission) {
    return new Response(
      JSON.stringify({ error: "Missing one of productName/productDescription/brandMission" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const apiKey = Deno.env.get("OPENROUTER_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing OpenRouter key" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const payload = {
    model: "tngtech/deepseek-r1t2-chimera:free",
    messages: [
      {
        role: "system",
        content:
          'You are a retail analyst. Respond ONLY with valid JSON of the form: {"demographic": {"summary": string, "needs": string[], "psychographics": string[]}, "valueProps": string[], "priceRange": {"min": number, "max": number, "rationale": string}, "recommendedStoreTypes": string[] }.',
      },
      {
        role: "user",
        content: `Brand name: ${productName}\nProduct: ${productDescription}\nMission: ${brandMission}`,
      },
    ],
    temperature: 0.3,
  };

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenRouter error:", errorText);
    return new Response(JSON.stringify({ error: "OpenRouter request failed", detail: errorText }), {
      status: response.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const json = await response.json();
  const rawContent = json.choices?.[0]?.message?.content ?? "";

  let content = "";
  if (typeof rawContent === "string") {
    content = rawContent;
  } else if (Array.isArray(rawContent)) {
    content = rawContent
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "text" in item && typeof item.text === "string") {
          return item.text;
        }
        return "";
      })
      .join("");
  }

  const cleaned = stripReasoningWrappers(content);

  try {
    const parsed = JSON.parse(cleaned);
    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to parse LLM JSON:", error, "content:", content);
    return new Response(JSON.stringify({ error: "LLM did not return valid JSON", raw: cleaned }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
