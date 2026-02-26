import { GoogleGenAI } from '@google/genai';
import mime from 'mime';

// Initialize Gemini AI client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

/**
 * Generate text content using Gemini 2.5 Flash (fast and high quality)
 */
export async function generateText(
  prompt: string,
  options?: {
    useGoogleSearch?: boolean;
    thinkingBudget?: number; // -1 for unlimited, or specific token budget
  }
): Promise<string> {
  const tools = options?.useGoogleSearch
    ? [{ googleSearch: {} }]
    : [];

  const config: any = {
    tools,
  };

  // Add thinking budget if specified
  if (options?.thinkingBudget !== undefined) {
    config.thinkingConfig = {
      thinkingBudget: options.thinkingBudget,
    };
  }

  // Use Gemini 2.5 Flash for optimal speed and quality
  const model = 'gemini-2.5-flash';

  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: prompt,
        },
      ],
    },
  ];

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });

  let fullText = '';
  for await (const chunk of response) {
    if (chunk.text) {
      fullText += chunk.text;
    }
  }

  return fullText;
}

/**
 * Generate images using Gemini 3 Pro Image Preview
 */
export async function generateImage(
  prompt: string,
  options?: {
    imageSize?: '1K' | '2K' | '4K';
    aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
    outputFileName?: string;
  }
): Promise<{ imageUrl: string; base64Data: string; mimeType: string }> {
  const config: any = {
    imageConfig: {
      aspectRatio: options?.aspectRatio || '9:16',
      imageSize: options?.imageSize || '1K',
      personGeneration: 'ALLOW_ADULT',
    },
    responseModalities: ['IMAGE', 'TEXT'],
  };

  const model = 'gemini-3-pro-image-preview';
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: prompt,
        },
      ],
    },
  ];

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });

  let imageData: { data: string; mimeType: string } | null = null;

  for await (const chunk of response) {
    if (!chunk.candidates || !chunk.candidates[0]?.content?.parts) {
      continue;
    }

    const inlineData = chunk.candidates[0].content.parts[0]?.inlineData;
    if (inlineData) {
      imageData = {
        data: inlineData.data || '',
        mimeType: inlineData.mimeType || 'image/png',
      };
      break; // Get first image
    }
  }

  if (!imageData) {
    throw new Error('No image was generated');
  }

  // Convert to data URL for browser display
  const imageUrl = `data:${imageData.mimeType};base64,${imageData.data}`;

  return {
    imageUrl,
    base64Data: imageData.data,
    mimeType: imageData.mimeType,
  };
}

/**
 * Generate images with user photo input using Gemini 2.5 Flash Image (FASTER!)
 * This allows the AI to incorporate the user's photo into the generated image
 * Uses the faster Gemini 2.5 Flash Image model instead of 3 Pro Image Preview
 */
export async function generateImageWithPhoto(
  prompt: string,
  userPhotoBase64: string,
  options?: {
    imageSize?: '1K' | '2K' | '4K';
    aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
    photoMimeType?: string;
  }
): Promise<{ imageUrl: string; base64Data: string; mimeType: string }> {
  const config: any = {
    responseModalities: ['IMAGE', 'TEXT'],
    imageConfig: {
      aspectRatio: '9:16',
    },
  };

  const model = 'gemini-2.5-flash-image'; // Changed to faster Flash model

  // Extract base64 data without data URL prefix if present
  const base64Data = userPhotoBase64.includes('base64,')
    ? userPhotoBase64.split('base64,')[1]
    : userPhotoBase64;

  const contents = [
    {
      role: 'user',
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: options?.photoMimeType || 'image/jpeg',
          },
        },
        {
          text: prompt,
        },
      ],
    },
  ];

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });

  let imageData: { data: string; mimeType: string } | null = null;

  for await (const chunk of response) {
    if (!chunk.candidates || !chunk.candidates[0]?.content?.parts) {
      continue;
    }

    const inlineData = chunk.candidates[0].content.parts[0]?.inlineData;
    if (inlineData) {
      imageData = {
        data: inlineData.data || '',
        mimeType: inlineData.mimeType || 'image/png',
      };
      break; // Get first image
    }
  }

  if (!imageData) {
    throw new Error('No image was generated');
  }

  // Convert to data URL for browser display
  const imageUrl = `data:${imageData.mimeType};base64,${imageData.data}`;

  return {
    imageUrl,
    base64Data: imageData.data,
    mimeType: imageData.mimeType,
  };
}

/**
 * Generate multiple images in sequence
 */
export async function generateMultipleImages(
  prompts: string[],
  options?: {
    imageSize?: '1K' | '2K' | '4K';
    aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
  }
): Promise<Array<{ imageUrl: string; base64Data: string; mimeType: string }>> {
  const results = [];

  for (const prompt of prompts) {
    const result = await generateImage(prompt, options);
    results.push(result);
  }

  return results;
}

/**
 * Save binary image file (for server-side usage)
 */
export function saveBinaryFile(fileName: string, base64Data: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      // Server-side only
      const fs = require('fs');
      const buffer = Buffer.from(base64Data, 'base64');

      fs.writeFile(fileName, buffer, (err: Error | null) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    } else {
      reject(new Error('saveBinaryFile is only available on the server'));
    }
  });
}

/**
 * Generate text with image generation in one call
 * Useful when you need both text description and visual
 */
export async function generateTextAndImage(
  textPrompt: string,
  imagePrompt: string,
  options?: {
    thinkingBudget?: number;
    imageSize?: '1K' | '2K' | '4K';
    aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
    useGoogleSearch?: boolean;
  }
): Promise<{
  text: string;
  image: { imageUrl: string; base64Data: string; mimeType: string };
}> {
  const [text, image] = await Promise.all([
    generateText(textPrompt, {
      thinkingBudget: options?.thinkingBudget,
      useGoogleSearch: options?.useGoogleSearch,
    }),
    generateImage(imagePrompt, {
      imageSize: options?.imageSize,
      aspectRatio: options?.aspectRatio,
    }),
  ]);

  return { text, image };
}
