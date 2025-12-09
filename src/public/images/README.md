# Custom Facility Images

This directory contains custom images for the University Location Booking Website.

## Image Requirements

### Facility Images
- **Format**: JPG or PNG
- **Recommended Size**: 1920x1080 pixels (16:9 ratio)
- **File Size**: Keep under 2MB for optimal loading

### Hero Background Image
- **Format**: JPG or PNG
- **Recommended Size**: 2560x1440 pixels or larger
- **File Size**: Keep under 3MB

## File Structure

```
/public/images/
├── facilities/
│   ├── university-playground.jpg
│   ├── auditorium.jpg
│   ├── indoor-stadium.jpg
│   ├── mini-auditorium.jpg
│   └── student-center.jpg
└── hero/
    └── hero-background.jpg
```

## How to Add Your Custom Images

### After deploying to GitHub:

1. **Clone your repository**
   ```bash
   git clone <your-repo-url>
   cd <your-repo-name>
   ```

2. **Add your images to the correct folders**
   - Place facility images in `/public/images/facilities/`
   - Place hero background in `/public/images/hero/`

3. **Use the exact filenames listed above** or update the paths in:
   - `/utils/facilityImages.ts` for facility images
   - `/components/Home.tsx` for hero background

4. **Commit and push your changes**
   ```bash
   git add public/images/
   git commit -m "Add custom facility images"
   git push origin main
   ```

## Image Credits

Replace the placeholder images with your own photos of:
- University Playground / Sports Field
- Main Auditorium
- Indoor Stadium / Gymnasium
- Mini Auditorium / Conference Room
- Student Center
- Campus hero background image

## Tips

- Use high-quality photos taken during daylight for best results
- Ensure images are properly licensed for use
- Consider compressing images using tools like TinyPNG before uploading
- Test the website after adding images to ensure they load correctly
