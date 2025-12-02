# Supabase Storage Setup Guide

This guide will help you set up the Supabase Storage bucket for storing generated images from Activities 1 and 2.

## Prerequisites

- A Supabase account with an existing project
- Your Supabase project URL and anon key already configured in `.env.local`

## Steps to Create Storage Bucket

### 1. Access Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project (the one you're using for this app)

### 2. Create the Storage Bucket

1. Click on **Storage** in the left sidebar
2. Click **New bucket**
3. Configure the bucket:
   - **Name**: `ramadan-activities`
   - **Public bucket**: ✅ **Enable** (check this box)
   - **File size limit**: 50 MB (optional, recommended)
   - **Allowed MIME types**: Leave empty or add: `image/jpeg, image/png, image/webp`

4. Click **Create bucket**

### 3. Set Up Storage Policies (Important!)

To allow public read access and authenticated/anonymous write access:

1. Click on your newly created `ramadan-activities` bucket
2. Go to **Policies** tab
3. Click **New policy**

#### Policy 1: Public Read Access
- **Policy name**: `Public read access`
- **Allowed operation**: `SELECT`
- **Target roles**: `public`
- **Policy definition**:
  ```sql
  true
  ```
  OR use the template: **"Enable read access for all users"**

#### Policy 2: Public Upload Access
- **Policy name**: `Public upload access`
- **Allowed operation**: `INSERT`
- **Target roles**: `public`, `anon`, `authenticated`
- **Policy definition**:
  ```sql
  true
  ```
  OR use the template: **"Enable insert for all users"**

### 4. Verify Bucket Structure

After images are generated, your bucket will have this structure:

```
ramadan-activities/
├── greetings/
│   ├── greetings-1733158400000-abc123def.jpg
│   ├── greetings-1733158500000-xyz789ghi.jpg
│   └── ...
└── posters/
    ├── brand-name-poster.jpg
    ├── another-brand-poster.jpg
    └── ...
```

## Testing the Setup

1. **Build and run your app**:
   ```bash
   npm run dev
   ```

2. **Test Activity 1** (Greeting Letter):
   - Go to `/activity-1`
   - Complete the form and generate a greeting
   - Check the browser console for upload logs
   - Verify the QR code works and contains a short Supabase URL

3. **Test Activity 2** (Brand Star):
   - Go to `/activity-2`
   - Select an industry and take/upload a photo
   - Generate the poster
   - Check the browser console for upload logs
   - Verify the QR code works and contains a short Supabase URL

4. **Verify in Supabase Dashboard**:
   - Go to Storage → `ramadan-activities`
   - You should see folders `greetings/` and `posters/` with uploaded images
   - Click on an image to verify it's accessible

## Troubleshooting

### Error: "Bucket not found"
- Make sure the bucket name is exactly `ramadan-activities`
- Check that the bucket was created successfully in the dashboard

### Error: "Permission denied" or "Row level security"
- Verify that you've set up the storage policies correctly
- Make sure both read and insert policies are enabled for `public` role

### QR Code shows "Data too long" error
- This means the image wasn't uploaded to Supabase successfully
- The app falls back to base64, which is too long for QR codes
- Check the console logs for upload errors
- Verify your Supabase credentials in `.env.local`

### Images not displaying
- Check the browser console for CORS errors
- Verify the bucket is set to **Public**
- Make sure the public read policy is active

## Environment Variables

Make sure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Storage Management

### Viewing Files
- Go to Supabase Dashboard → Storage → `ramadan-activities`
- Browse through `greetings/` and `posters/` folders

### Deleting Old Files
You can set up automatic deletion using Supabase Edge Functions or manually delete old files:

1. Go to the bucket in the dashboard
2. Select files you want to delete
3. Click the trash icon

### Storage Limits
- Free tier: 1 GB storage
- Pro tier: 100 GB storage
- Each generated image is approximately 200-500 KB

## How It Works

1. **Image Generation**:
   - Activity 1: Gemini generates a greeting card background
   - Activity 2: Gemini generates a poster with user's photo

2. **Upload to Storage**:
   - Image is converted from base64 to blob
   - Uploaded to `ramadan-activities/greetings/` or `ramadan-activities/posters/`
   - Unique filename generated with timestamp and random ID

3. **Public URL**:
   - Supabase returns a short public URL
   - Example: `https://your-project.supabase.co/storage/v1/object/public/ramadan-activities/greetings/image.jpg`

4. **QR Code**:
   - QR code encodes the short Supabase URL (not base64)
   - Users can scan to download the image directly

## Benefits

✅ **Short URLs**: Perfect for QR codes (no "Data too long" errors)
✅ **CDN-backed**: Fast image delivery worldwide
✅ **Organized**: Separate folders for greetings and posters
✅ **Scalable**: Handles unlimited uploads (within plan limits)
✅ **Shareable**: Direct image URLs that work everywhere
✅ **Fallback**: App falls back to base64 if upload fails

---

**Need help?** Check the Supabase Storage documentation: https://supabase.com/docs/guides/storage
