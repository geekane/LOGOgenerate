import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import dedent from 'dedent';

let ratelimit: Ratelimit | undefined;

export async function POST(req: Request) {
  const json = await req.json();
    const data = z
      .object({
        userAPIKey: z.string().optional(),
        companyName: z.string(),
        selectedStyle: z.string(),
        selectedPrimaryColor: z.string(),
        selectedBackgroundColor: z.string(),
        additionalInfo: z.string().optional(),
      })
      .parse(json);

    // Add rate limiting if Upstash API keys are set & no BYOK, otherwise skip
    if (process.env.UPSTASH_REDIS_REST_URL && !data.userAPIKey) {
      ratelimit = new Ratelimit({
        redis: Redis.fromEnv(),
        // Allow 3 requests per 2 months on prod
        limiter: Ratelimit.fixedWindow(3, "60 d"),
        analytics: true,
        prefix: "logocreator",
      });
    }

  const apiKey = data.userAPIKey || process.env.SILICONFLOW_API_KEY;
  const headers = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  if (!apiKey) {
    return new Response("Missing Siliconflow API Key", {
      status: 401,
      headers: { "Content-Type": "text/plain" },
    });
  }


  if (ratelimit) {
    const identifier = "anonymous";
    const { success, remaining } = await ratelimit.limit(identifier);

    if (!success) {
      return new Response(
        "You've used up all your free credits. Please wait or try again later.",
        {
          status: 429,
          headers: { "Content-Type": "text/plain" },
        },
      );
    }
  }

      const flashyStyle =
        "Flashy, attention grabbing, bold, futuristic, and eye-catching. Use vibrant neon colors with metallic, shiny, and glossy accents.";

    const techStyle =
        "highly detailed, sharp focus, cinematic, photorealistic, Minimalist, clean, sleek, neutral color pallete with subtle accents, clean lines, shadows, and flat.";

    const modernStyle =
        "modern, forward-thinking, flat design, geometric shapes, clean lines, natural colors with subtle accents, use strategic negative space to create visual interest.";

    const playfulStyle =
        "playful, lighthearted, bright bold colors, rounded shapes, lively.";

    const abstractStyle =
        "abstract, artistic, creative, unique shapes, patterns, and textures to create a visually interesting and wild logo.";

    const minimalStyle =
        "minimal, simple, timeless, versatile, single color logo, use negative space, flat design with minimal details, Light, soft, and subtle.";

      const styleLookup: Record<string, string> = {
        Flashy: flashyStyle,
        Tech: techStyle,
        Modern: modernStyle,
        Playful: playfulStyle,
        Abstract: abstractStyle,
        Minimal: minimalStyle,
      };

    const prompt = dedent`A single logo, high-quality, award-winning professional design, made for both digital and print media, only contains a few vector shapes, ${styleLookup[data.selectedStyle]}

      Primary color is ${data.selectedPrimaryColor.toLowerCase()} and background color is ${data.selectedBackgroundColor.toLowerCase()}. The company name is ${data.companyName}, make sure to include the company name in the logo. ${data.additionalInfo ? `Additional info: ${data.additionalInfo}` : ""}`;

      interface SiliconFlowPayload {
        model: string;
        prompt: string;
        image_size: string;
        batch_size: number;
        num_inference_steps: number;
        guidance_scale: number;
      }

        const payload: SiliconFlowPayload = {
            model: "black-forest-labs/FLUX.1-schnell",
            prompt,
            image_size: "1024x1024",
            batch_size: 1,
            num_inference_steps: 20,
            guidance_scale: 7.5,
          };
      

    try {
      const response = await fetch(
        "https://api.siliconflow.cn/v1/images/generations",
        {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        }
      );

       if (!response.ok) {
             const errorText = await response.text()
            const message = `Siliconflow API Error - Status: ${response.status}, Text: ${errorText}`
              return new Response(message, {
                status: response.status,
                headers: { "Content-Type": "text/plain" },
              });
            }


       const json = await response.json() as any;
       return Response.json(
            { url: json.images[0].url, }, { status: 200 }
        );
     } catch (error) {
        return new Response(
            `Failed to call SiliconFlow API, ${error}`,
            {
              status: 500,
              headers: { "Content-Type": "text/plain" },
            },
        );
     }
  }

export const runtime = "edge";
