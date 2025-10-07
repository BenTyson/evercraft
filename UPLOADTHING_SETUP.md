# Uploadthing Setup

This document explains how to set up Uploadthing for image uploads in Evercraft.

## What is Uploadthing?

Uploadthing is a file upload service designed specifically for Next.js applications. It provides:
- Easy-to-use file upload components
- CDN-backed storage
- Automatic image optimization
- Free tier with generous limits

## Setup Instructions

### 1. Create an Uploadthing Account

1. Go to https://uploadthing.com
2. Sign up for a free account (you can sign in with GitHub)
3. Create a new app

### 2. Get Your API Keys

1. In the Uploadthing dashboard, go to your app settings
2. Copy your API keys:
   - **App ID** - starts with `app_`
   - **Secret** - starts with `sk_`

### 3. Add Environment Variables

Add these to your `.env` file:

```env
# Uploadthing
UPLOADTHING_SECRET=sk_your_secret_key_here
UPLOADTHING_APP_ID=app_your_app_id_here
```

### 4. Restart Your Dev Server

After adding the environment variables, restart your development server:

```bash
npm run dev
```

## Features Implemented

✅ Product image upload (up to 4 images per product)
✅ Drag-and-drop file upload
✅ Image preview before upload
✅ Primary image designation (first image)
✅ Image removal
✅ Max file size: 4MB per image
✅ Supported formats: JPG, PNG, WebP, GIF

## Usage

### For Sellers

1. Go to **Seller Dashboard** → **Products** → **Add Product**
2. Scroll to the **Product Images** section
3. Click **Upload Images** to select files or drag and drop
4. Upload up to 4 images
5. The first image will automatically be the primary image
6. Remove images by clicking the X button

### Image Guidelines

- **Recommended size:** 1200x1200 pixels
- **Aspect ratio:** Square (1:1) works best
- **Format:** JPG or PNG
- **Max file size:** 4MB per image
- **Max images:** 4 per product

## Free Tier Limits

Uploadthing's free tier includes:
- 2GB storage
- 2GB bandwidth per month
- File size limit: 16MB per file

This is more than enough for an MVP. For production, you may need to upgrade based on traffic.

## Alternative Options

If you don't want to set up Uploadthing immediately:
- Products can still be created without images
- You can add placeholder images for testing
- Images are optional in the product form

## Troubleshooting

### "Unauthorized" Error
- Make sure you've added both `UPLOADTHING_SECRET` and `UPLOADTHING_APP_ID` to `.env`
- Restart your dev server after adding environment variables
- Check that your secret key starts with `sk_` and app ID starts with `app_`

### Upload Fails
- Check file size (max 4MB)
- Ensure file is a valid image format
- Check your Uploadthing dashboard for quota limits

### Images Not Showing
- Images are stored on Uploadthing's CDN
- URLs are permanent and don't expire
- Check browser console for any CORS errors

## Next Steps for Production

- [ ] Configure custom domain for image URLs
- [ ] Set up image transformations (resize, crop)
- [ ] Add automatic image optimization
- [ ] Monitor storage and bandwidth usage
- [ ] Consider upgrading to paid plan if needed
