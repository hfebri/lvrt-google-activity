"use server";

import { generateText } from "@/lib/gemini";

export async function generatePoster(industry: string, imageBase64: string) {
  console.log('\n🚀 [Activity 2] Starting poster generation...');
  console.time('⏱️  Total Poster Generation');

  // 1. Generate Concept & Brand Name using Gemini 3 Pro
  let brandName = "Leverate";
  let tagline = "Elevate Your Brand";
  let concept = "A modern, sleek advertisement.";

  try {
    console.log(`📋 Industry selected: ${industry}`);
    console.log('💡 Generating brand concept with Gemini 2.5 Flash...');
    console.time('⏱️  Brand Concept Generation');

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

    const startBrandTime = Date.now();
    // Use Gemini 2.5 Flash for fast, high-quality brand concepts
    const text = await generateText(prompt);
    const brandTime = ((Date.now() - startBrandTime) / 1000).toFixed(2);

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      brandName = data.brandName;
      tagline = data.tagline;
      concept = data.concept;

      console.log(`✅ Brand concept generated in ${brandTime}s`);
      console.log(`   📛 Brand: ${brandName}`);
      console.log(`   💬 Tagline: ${tagline}`);
      console.log(`   🎨 Concept: ${concept.substring(0, 60)}...`);
      console.timeEnd('⏱️  Brand Concept Generation');
    }
  } catch (e) {
    console.error("❌ Gemini generation failed", e);
    throw new Error("Failed to generate brand concept");
  }

  // 2. Generate Poster Image using Gemini Image Generation WITH USER PHOTO
  try {
    console.log('\n🖼️  Generating poster image with user photo...');
    console.time('⏱️  Poster Image Generation');

    const { generateImageWithPhoto } = await import("@/lib/gemini");
    const { uploadImageToStorage } = await import("@/lib/storage");

    // Create detailed prompt for the poster WITH embedded text
    const imagePrompt = `Create a professional advertisement poster for a Ramadan/Eid campaign.

    BRAND NAME: "${brandName}"
    TAGLINE: "${tagline}"
    Concept: ${concept}
    Industry: ${industry}
    Theme: Ramadan/Eid celebration

    CRITICAL REQUIREMENTS - CHARACTER CONSISTENCY:
    - The provided photo shows ONE PERSON - this is the ONLY person who should be the main subject
    - KEEP THE EXACT SAME PERSON from the provided photo as the SOLE main subject/model
    - PRESERVE their facial features, face shape, skin tone, and overall appearance EXACTLY
    - DO NOT change their face, eyes, nose, mouth, or any facial characteristics
    - The person should be CLEARLY RECOGNIZABLE as the same individual from the input photo
    - DO NOT add other people's faces in the foreground or as main subjects
    - Any background people should be minimal, blurred, or silhouettes only
    - Only enhance the background, setting, and surrounding elements
    - Keep their natural appearance - do not alter their identity

    TEXT REQUIREMENTS - VERY IMPORTANT:
    - MUST include the brand name "${brandName}" prominently in the poster
    - MUST include the tagline "${tagline}" below or near the brand name
    - Place the text at the BOTTOM THIRD of the poster in an elegant panel/overlay
    - Use modern, professional typography (sans-serif for brand, elegant serif for tagline)
    - Text should be clearly readable with good contrast
    - Add a semi-transparent gradient overlay behind the text for readability
    - Text color should be white/gold to match Ramadan theme
    - The brand name should be LARGER and BOLDER than the tagline
    - Center-align the text for professional look

    Visual requirements:
    - Feature the ONE person from the provided photo prominently as the sole brand ambassador
    - Modern, professional advertising style with commercial aesthetic
    - Vibrant Islamic/Ramadan visual elements (crescent moon, lanterns, mosque silhouettes)
    - Clean composition with decorative borders and patterns
    - Warm, festive color palette (gold, green, deep blue)
    - Industry-appropriate setting and mood for ${industry}
    - High quality, magazine-worthy advertisement
    - The person should be in the UPPER 2/3 of the poster
    - Bottom 1/3 reserved for brand name and tagline text overlay
    - Professional studio lighting and composition
    - Add subtle Ramadan decorative patterns (geometric shapes, lanterns, crescents)
    - Portrait orientation (9:16 aspect ratio)
    - Focus should be on the ONE person from the input photo with the brand text clearly visible at bottom`;

    console.log('⚡ Using Gemini 2.5 Flash Image (MUCH FASTER than 3 Pro!)...');
    console.log(`📝 Prompt: ${imagePrompt.substring(0, 100)}...`);
    console.log(`📸 User photo size: ${(imageBase64.length / 1024).toFixed(2)} KB`);
    console.log('⏱️  Expected time: 15-40 seconds (Flash model is optimized for speed)');

    const startImageTime = Date.now();
    // Generate the poster using Gemini 2.5 Flash Image WITH user photo (MUCH FASTER!)
    const result = await generateImageWithPhoto(imagePrompt, imageBase64, {
      imageSize: '1K', // Not used by Flash model, but kept for compatibility
      aspectRatio: '9:16', // Not used by Flash model, but kept for compatibility
      photoMimeType: 'image/jpeg',
    });
    const imageTime = ((Date.now() - startImageTime) / 1000).toFixed(2);

    console.log(`✅ Poster image generated in ${imageTime}s`);
    console.log(`📊 Output image size: ${(result.base64Data.length / 1024).toFixed(2)} KB (base64)`);
    console.timeEnd('⏱️  Poster Image Generation');

    // Upload to Supabase Storage
    console.log('☁️  Uploading to Supabase Storage...');
    const uploadStartTime = Date.now();

    try {
      const publicUrl = await uploadImageToStorage(
        'ramadan-activities', // bucket name
        'posters', // folder
        result.imageUrl, // base64 data URL
        `${brandName.replace(/\s+/g, '-').toLowerCase()}-poster.jpg` // filename
      );

      const uploadTime = ((Date.now() - uploadStartTime) / 1000).toFixed(2);
      console.log(`✅ Uploaded in ${uploadTime}s`);
      console.log(`🔗 Public URL: ${publicUrl}`);
      console.timeEnd('⏱️  Total Poster Generation');
      console.log('✨ Poster generation complete!\n');

      return {
        posterUrl: publicUrl,
        brandName,
        tagline,
        sharingText: undefined,
      };
    } catch (uploadError) {
      console.warn('⚠️  Upload to storage failed, falling back to base64:', uploadError);
      console.timeEnd('⏱️  Total Poster Generation');
      console.log('✨ Poster generation complete (with fallback)!\n');

      // Fallback to base64 if upload fails
      return {
        posterUrl: result.imageUrl,
        brandName,
        tagline,
        sharingText: undefined,
      };
    }
  } catch (error) {
    console.error("❌ Error generating poster:", error);
    throw new Error("Failed to generate poster image");
  }
}
