import { supabase } from "./supabase";

/**
 * Upload an image to Supabase Storage
 * @param bucket - The storage bucket name
 * @param folder - The folder within the bucket (e.g., 'greetings', 'posters')
 * @param imageData - Base64 image data or URL
 * @param filename - Optional filename (will generate if not provided)
 * @returns Public URL of the uploaded image
 */
export async function uploadImageToStorage(
  bucket: string,
  folder: string,
  imageData: string,
  filename?: string
): Promise<string> {
  try {
    // Generate filename if not provided
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 11);
    const file = filename || `${folder}-${timestamp}-${randomId}.jpg`;
    const filePath = `${folder}/${file}`;

    // Convert base64 or fetch URL to blob
    let blob: Blob;

    if (imageData.startsWith('data:')) {
      // Handle base64 data
      const base64Response = await fetch(imageData);
      blob = await base64Response.blob();
    } else if (imageData.startsWith('http')) {
      // Handle URL
      const response = await fetch(imageData);
      blob = await response.blob();
    } else {
      throw new Error('Invalid image data format');
    }

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * Delete an image from Supabase Storage
 * @param bucket - The storage bucket name
 * @param filePath - The file path within the bucket
 */
export async function deleteImageFromStorage(
  bucket: string,
  filePath: string
): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}
