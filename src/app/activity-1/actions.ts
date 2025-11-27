"use server";

import { generateText } from "@/lib/gemini";
import { generateLetterSharingText } from "@/lib/socialSharing";

export async function generateLetter(data: any) {
  try {
    console.log('\n🚀 [Activity 1] Starting letter generation...');
    console.time('⏱️  Letter Generation');

    // Combined prompt: Generate both letter AND image prompt in one call
    const combinedPrompt = `
      Task: Create an Eid al-Fitr greeting letter AND an image prompt.

      Context:
      - Relationship: ${data.relationship}
      - Recipient Name: ${data.name}
      - Tone: ${data.tone}
      - Key Message: ${data.keyMessage}
      - Additional Context: ${data.additionalContext || "None"}
      - Font Style: Use elegant serif font (like Crimson Text, Libre Baskerville, or Cormorant Garamond style) that feels warm, personal, and sophisticated - NOT generic Times New Roman

      Generate TWO things in JSON format:
      {
        "letter": "A heartfelt Eid greeting in Bahasa Indonesia (40-60 words max). Write it in an elegant, poetic style with beautiful Indonesian phrasing.",
        "imagePrompt": "A beautiful Ramadan background with elegant Islamic calligraphy style, ornate patterns, warm golden colors, mosque silhouettes, crescent moon. Include decorative borders with traditional Islamic geometric patterns. (max 40 words)"
      }

      Return ONLY valid JSON, no markdown, no explanations.
    `;

    console.log('📝 Generating letter + image prompt with Gemini 2.5 Flash...');
    const startGeneration = Date.now();
    const response = await generateText(combinedPrompt);
    const generationTime = ((Date.now() - startGeneration) / 1000).toFixed(2);
    console.log(`✅ Generated in ${generationTime}s`);

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response");
    }

    const { letter, imagePrompt } = JSON.parse(jsonMatch[0]);
    console.log(`📝 Letter: ${letter.substring(0, 50)}...`);
    console.log(`🎨 Image prompt: ${imagePrompt.substring(0, 80)}...`);

    console.timeEnd('⏱️  Letter Generation');
    console.log('✨ Letter generation complete!\n');

    return { letter, prompt: imagePrompt, sharingText: undefined };
  } catch (error) {
    console.error("❌ Error generating letter:", error);
    throw new Error("Failed to generate letter");
  }
}

export async function generateImage(prompt: string) {
  try {
    console.log('\n🖼️  [Activity 1] Starting image generation...');
    console.time('⏱️  Image Generation');

    // Import the Gemini image generation utility
    const { generateImage: geminiGenerateImage } = await import("@/lib/gemini");

    // Enhance the prompt for better letter background
    const enhancedPrompt = `${prompt}

    Additional requirements:
    - Center area should be clear/subtle for text overlay
    - Beautiful Ramadan/Eid theme
    - No text or watermarks in the image
    - High quality, vibrant colors with Islamic patterns`;

    console.log('🎨 Using Gemini Image Preview (1K quality, 9:16 aspect ratio)...');
    console.log(`📝 Enhanced prompt: ${enhancedPrompt.substring(0, 80)}...`);

    const startTime = Date.now();

    // Use Gemini 3 Pro Image Preview (Nano Banana) for image generation
    const result = await geminiGenerateImage(enhancedPrompt, {
      imageSize: '1K', // 1K for faster generation, can be '2K' or '4K' for higher quality
      aspectRatio: '9:16', // Portrait mode for letter background
    });

    const imageTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Image generated in ${imageTime}s`);
    console.log(`📊 Image size: ${(result.base64Data.length / 1024).toFixed(2)} KB (base64)`);
    console.timeEnd('⏱️  Image Generation');
    console.log('✨ Image generation complete!\n');

    // Return the data URL for direct display in the browser
    return result.imageUrl;
  } catch (error) {
    console.error("❌ Error generating image:", error);
    throw new Error("Failed to generate image");
  }
}
