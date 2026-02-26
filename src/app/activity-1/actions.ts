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
        "letter": "A heartfelt Eid greeting in Bahasa Indonesia (maximum 3 short sentences). Write it in an elegant, poetic style with beautiful Indonesian phrasing. Keep it concise and impactful.",
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
    console.log(`🎨 Image prompt: ${imagePrompt}`);

    console.timeEnd('⏱️  Letter Generation');
    console.log('✨ Letter generation complete!\n');

    return { letter, prompt: imagePrompt, sharingText: undefined };
  } catch (error) {
    console.error("❌ Error generating letter:", error);
    throw new Error("Failed to generate letter");
  }
}

export async function generateImage(prompt: string, letter: string) {
  try {
    console.log('\n🖼️  [Activity 1] Starting image generation...');
    console.time('⏱️  Image Generation');

    // Import the Gemini image generation utility
    const { generateImage: geminiGenerateImage } = await import("@/lib/gemini");
    const { uploadImageToStorage } = await import("@/lib/storage");

    // Enhance the prompt to include the letter text IN the image
    const enhancedPrompt = `Create a beautiful Ramadan/Eid greeting card image with the following letter text embedded directly in the center:

"${letter}"

Design requirements:
- The letter text MUST be clearly visible and readable in the center of the image
- Use elegant serif typography (like Crimson Text, Libre Baskerville, or Cormorant Garamond style) - NOT generic Times New Roman
- Place the text in a decorative card/frame in the center
- Beautiful Ramadan/Eid background with Islamic patterns, crescent moon, mosque silhouettes
- Warm golden colors, ornate borders, traditional Islamic geometric patterns
- The text should be in a white/light panel with elegant framing
- High quality, sophisticated design suitable for sharing
- Portrait orientation (9:16 aspect ratio)
- The letter text is the main focus of the card`;

    console.log('🎨 Using Gemini Image Preview (1K quality, 9:16 aspect ratio)...');
    console.log(`📝 Enhanced prompt: ${enhancedPrompt}...`);

    const startTime = Date.now();

    // Use Gemini 3 Pro Image Preview with retry logic for intermittent failures
    const MAX_RETRIES = 3;
    let result;
    let lastError;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`🎯 Attempt ${attempt}/${MAX_RETRIES}...`);
        result = await geminiGenerateImage(enhancedPrompt, {
          imageSize: '1K',
          aspectRatio: '9:16',
        });
        break; // Success, exit retry loop
      } catch (retryError) {
        lastError = retryError;
        console.warn(`⚠️  Attempt ${attempt} failed:`, retryError instanceof Error ? retryError.message : retryError);
        if (attempt < MAX_RETRIES) {
          console.log(`⏳ Retrying in 1 second...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    if (!result) {
      throw lastError || new Error('Image generation failed after all retries');
    }

    const imageTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Image generated in ${imageTime}s`);
    console.log(`📊 Image size: ${(result.base64Data.length / 1024).toFixed(2)} KB (base64)`);

    // Upload to Supabase Storage
    console.log('☁️  Uploading to Supabase Storage...');
    const uploadStartTime = Date.now();

    try {
      const publicUrl = await uploadImageToStorage(
        'ramadan-activities', // bucket name
        'greetings', // folder
        result.imageUrl // base64 data URL
      );

      const uploadTime = ((Date.now() - uploadStartTime) / 1000).toFixed(2);
      console.log(`✅ Uploaded in ${uploadTime}s`);
      console.log(`🔗 Public URL: ${publicUrl}`);
      console.timeEnd('⏱️  Image Generation');
      console.log('✨ Image generation complete!\n');

      // Return the public URL from Supabase Storage
      return publicUrl;
    } catch (uploadError) {
      console.warn('⚠️  Upload to storage failed, falling back to base64:', uploadError);
      console.timeEnd('⏱️  Image Generation');

      // Fallback to base64 if upload fails
      return result.imageUrl;
    }
  } catch (error) {
    console.error("❌ Error generating image:", error);
    throw new Error("Failed to generate image");
  }
}
