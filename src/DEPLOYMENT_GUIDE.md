# Deployment Guide - Adding Custom Images

This guide explains how to add your custom images to the University Location Booking Website after deploying to GitHub.

## 📁 Project Structure

```
your-project/
├── public/
│   └── images/
│       ├── facilities/
│       │   ├── university-playground.jpg    ← Add your image here
│       │   ├── auditorium.jpg               ← Add your image here
│       │   ├── indoor-stadium.jpg           ← Add your image here
│       │   ├── mini-auditorium.jpg          ← Add your image here
│       │   └── student-center.jpg           ← Add your image here (NEW!)
│       └── hero/
│           └── hero-background.jpg          ← Add your hero image here
├── utils/
│   └── facilityImages.ts                    ← Image configuration
└── App.tsx
```

## 🚀 Step-by-Step Deployment

### 1. Deploy to GitHub

First, push your code to GitHub:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit your changes
git commit -m "Initial commit - University booking system"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

### 2. Clone Your Repository (on your local machine)

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Navigate to the project
cd YOUR_REPO_NAME
```

### 3. Add Your Custom Images

#### Option A: Using File Explorer / Finder
1. Navigate to your project folder
2. Go to `public/images/facilities/`
3. Add your 5 facility images with these **exact names**:
   - `university-playground.jpg`
   - `auditorium.jpg`
   - `indoor-stadium.jpg`
   - `mini-auditorium.jpg`
   - `student-center.jpg` ← **NEW FACILITY**

4. Go to `public/images/hero/`
5. Add your hero background image:
   - `hero-background.jpg`

#### Option B: Using Command Line
```bash
# Copy your images to the correct folders
cp /path/to/your/playground-photo.jpg public/images/facilities/university-playground.jpg
cp /path/to/your/auditorium-photo.jpg public/images/facilities/auditorium.jpg
cp /path/to/your/stadium-photo.jpg public/images/facilities/indoor-stadium.jpg
cp /path/to/your/mini-aud-photo.jpg public/images/facilities/mini-auditorium.jpg
cp /path/to/your/student-center-photo.jpg public/images/facilities/student-center.jpg
cp /path/to/your/hero-photo.jpg public/images/hero/hero-background.jpg
```

### 4. Commit and Push Your Images

```bash
# Add the new images
git add public/images/

# Commit the changes
git commit -m "Add custom facility and hero images"

# Push to GitHub
git push origin main
```

### 5. Verify Your Images

After pushing, your images will automatically be used by the website. The system has fallback URLs to Unsplash images, so if your custom images aren't found, it will display placeholder images.

## 📸 Image Requirements

### Facility Images
- **Format**: JPG or PNG (JPG recommended for smaller file size)
- **Dimensions**: 1920 x 1080 pixels (16:9 aspect ratio)
- **Max File Size**: 2MB per image
- **Quality**: High quality, well-lit photos

### Hero Background
- **Format**: JPG or PNG
- **Dimensions**: 2560 x 1440 pixels or larger
- **Max File Size**: 3MB
- **Quality**: High resolution for larger displays

## 🎨 Image Tips

1. **University Playground**: 
   - Outdoor sports field or playground
   - Show facilities like tracks, grass fields, or seating

2. **Auditorium**: 
   - Large theater-style seating
   - Stage, lighting, professional atmosphere

3. **Indoor Stadium**: 
   - Basketball court, gymnasium, or multipurpose sports facility
   - Indoor lighting, court markings

4. **Mini Auditorium**: 
   - Conference room, seminar hall, or small theater
   - Modern, professional setting

5. **Student Center** *(NEW - Capacity 1000)*: 
   - Large open space, lounge areas, or event hall
   - Students gathering, modern campus facilities
   - Multi-purpose area with tables, seating

6. **Hero Background**: 
   - Campus building, university landmark
   - Wide shot of campus with clear sky
   - Should work well with white text overlay

## 🔧 Advanced Configuration

If you want to use different file names or formats, edit `/utils/facilityImages.ts`:

```typescript
export const facilityImages = {
  'university-playground': '/images/facilities/YOUR_CUSTOM_NAME.png',
  'auditorium': '/images/facilities/YOUR_CUSTOM_NAME.png',
  // ... etc
};
```

## 🌐 Using External URLs

You can also use external image URLs instead of local files:

1. Upload your images to an image hosting service (Imgur, Cloudinary, etc.)
2. Edit `/utils/facilityImages.ts`
3. Replace the local paths with your URLs:

```typescript
export const facilityImages = {
  'student-center': 'https://your-image-host.com/student-center.jpg',
  // ... etc
};
```

## 📱 Testing

After adding images, test your website:

1. Check all 5 facility cards on the homepage
2. Verify the hero section background
3. Test on both desktop and mobile views
4. Ensure images load quickly

## 🆘 Troubleshooting

**Images not showing?**
- Check file names match exactly (case-sensitive)
- Verify images are in correct folders
- Check file formats (JPG/PNG only)
- Ensure images were committed and pushed to GitHub

**Images too large?**
- Compress images using TinyPNG or similar tools
- Resize to recommended dimensions
- Convert PNG to JPG for better compression

**Need to revert to default images?**
- Remove your custom images from `/public/images/`
- System will automatically use fallback Unsplash images

## 📋 Current Facilities

Your booking system now includes **5 facilities**:

1. **University Playground** - Capacity: 500
2. **Auditorium** - Capacity: 800
3. **Indoor Stadium** - Capacity: 300
4. **Mini Auditorium** - Capacity: 150
5. **Student Center** - Capacity: 1000 ✨ (NEW)

Total system capacity: **2,750 people**

---

**Need help?** Check the README.md in `/public/images/` for more details.
