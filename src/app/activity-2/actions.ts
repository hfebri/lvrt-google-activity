"use server";

import { generateText } from "@/lib/gemini";
import { generatePosterSharingText } from "@/lib/socialSharing";

export async function generatePoster(industry: string, imageBase64: string) {
  // 1. Generate Concept & Brand Name using Gemini 3 Pro
  let brandName = "Leverate";
  let tagline = "Elevate Your Brand";
  let concept = "A modern, sleek advertisement.";

  try {
    const prompt = `
      Create a fictional brand name, tagline, and visual concept for a Ramadan advertisement in the ${industry} industry.

      Industry Context:
      - FNB: Family gathering, eating brand's food
      - Logistics: Mudik to kampung halaman
      - Telco: Connecting with family
      - Fashion: Eid outfit celebration
      - Banking: Financial readiness for Eid
      - Travel: Journey home for Ramadan

      Output JSON format (respond with ONLY valid JSON, no markdown or explanations):
      {
        "brandName": "string",
        "tagline": "string",
        "concept": "string description of the visual"
      }
    `;

    // Use Gemini 2.5 Flash for fast, high-quality brand concepts
    const text = await generateText(prompt);

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      brandName = data.brandName;
      tagline = data.tagline;
      concept = data.concept;
    }
  } catch (e) {
    console.error("Gemini generation failed", e);
    throw new Error("Failed to generate brand concept");
  }

  // 2. Generate Poster Image using Gemini Image Generation
  try {
    const { generateImage } = await import("@/lib/gemini");

    // Create detailed prompt for the poster
    const imagePrompt = `Professional advertisement poster for ${brandName}.

    Tagline: "${tagline}"
    Concept: ${concept}
    Industry: ${industry}
    Theme: Ramadan/Eid celebration

    Visual requirements:
    - 9:16 portrait aspect ratio (poster format)
    - Feature the person from the provided context as brand ambassador
    - Modern, professional advertising style
    - Vibrant Islamic/Ramadan visual elements
    - Clean composition with space for brand text overlay
    - High quality, commercial advertisement aesthetic
    - Warm, festive color palette
    - Industry-appropriate setting and mood`;

    // Generate the poster using Gemini 3 Pro Image Preview
    const result = await generateImage(imagePrompt, {
      imageSize: '2K', // Higher quality for poster
    });

    // Generate social sharing text
    const sharingText = await generatePosterSharingText(brandName, tagline, industry);

    return {
      posterUrl: result.imageUrl,
      brandName,
      tagline,
      sharingText,
    };
  } catch (error) {
    console.error("Error generating poster:", error);
    throw new Error("Failed to generate poster image");
  }
}
