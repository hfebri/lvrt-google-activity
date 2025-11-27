"use server";

import { generateText } from "@/lib/gemini";
import type { SocialSharingText } from "@/lib/socialSharingTypes";

/**
 * Generate social media sharing text for Activity 1 (Eid Greeting Letter)
 */
export async function generateLetterSharingText(
  letterContent: string,
  tone: string
): Promise<SocialSharingText> {
  try {
    const prompt = `
      Create engaging social media sharing content for an Eid greeting letter.

      Letter content: "${letterContent}"
      Tone: ${tone}

      Generate:
      1. A compelling caption (20-30 words in Bahasa Indonesia) that makes people want to create their own
      2. 5-7 relevant hashtags (mix of trending and specific)
      3. A clear call-to-action encouraging others to create their own greeting

      Output JSON format (respond with ONLY valid JSON):
      {
        "caption": "string",
        "hashtags": ["string", "string", ...],
        "callToAction": "string"
      }
    `;

    const text = await generateText(prompt);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      return {
        caption: data.caption || "Selamat Hari Raya Idul Fitri!",
        hashtags: data.hashtags || ["#LebaranMubarak", "#EidMubarak"],
        callToAction: data.callToAction || "Buat ucapan Lebaran-mu sendiri!",
      };
    }

    // Fallback
    return {
      caption: "Ucapan Lebaran spesial yang dibuat dengan AI! 🌙✨",
      hashtags: ["#LebaranMubarak", "#EidMubarak", "#Ramadan2024", "#AIGreeting"],
      callToAction: "Buat ucapan Lebaran-mu sendiri di Ramadhan Interactive Hub!",
    };
  } catch (error) {
    console.error("Error generating sharing text:", error);
    // Return fallback
    return {
      caption: "Ucapan Lebaran spesial yang dibuat dengan AI! 🌙✨",
      hashtags: ["#LebaranMubarak", "#EidMubarak", "#Ramadan2024"],
      callToAction: "Buat ucapan Lebaran-mu sendiri!",
    };
  }
}

/**
 * Generate social media sharing text for Activity 2 (Brand Poster)
 */
export async function generatePosterSharingText(
  brandName: string,
  tagline: string,
  industry: string
): Promise<SocialSharingText> {
  try {
    const prompt = `
      Create engaging social media sharing content for an AI-generated brand advertisement poster.

      Brand: ${brandName}
      Tagline: "${tagline}"
      Industry: ${industry}

      Generate:
      1. A fun, engaging caption (20-30 words in Bahasa Indonesia) about becoming a brand ambassador
      2. 5-7 relevant hashtags (include industry-specific and Ramadan-related)
      3. A call-to-action encouraging others to create their own brand poster

      Output JSON format (respond with ONLY valid JSON):
      {
        "caption": "string",
        "hashtags": ["string", "string", ...],
        "callToAction": "string"
      }
    `;

    const text = await generateText(prompt);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      return {
        caption: data.caption || `Jadi brand ambassador ${brandName}! 🎉`,
        hashtags: data.hashtags || ["#BrandAmbassador", "#RamadanMarketing"],
        callToAction: data.callToAction || "Buat poster brand-mu sendiri!",
      };
    }

    // Fallback
    return {
      caption: `Lihat aku jadi brand ambassador ${brandName}! 🌟`,
      hashtags: [
        "#BrandAmbassador",
        "#AIGenerated",
        `#${industry}`,
        "#RamadanMarketing",
        "#Lebaran2024",
      ],
      callToAction: "Buat poster iklan-mu sendiri di Ramadhan Interactive Hub!",
    };
  } catch (error) {
    console.error("Error generating sharing text:", error);
    // Return fallback
    return {
      caption: `Jadi brand ambassador ${brandName} untuk Ramadan! 🌙`,
      hashtags: ["#BrandAmbassador", "#AIGenerated", "#Lebaran2024"],
      callToAction: "Buat poster brand-mu sendiri!",
    };
  }
}

