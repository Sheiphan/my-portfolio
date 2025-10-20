# Images Directory

This directory contains all images used in the portfolio website.

## Structure

```
images/
├── projects/          # Project-specific images
│   ├── chatbot.png
│   ├── computer-vision.png
│   └── sentiment-analysis.png
└── placeholders/      # Placeholder images
    └── project-placeholder.svg
```

## Adding New Project Images

1. Add your image to the `projects/` directory
2. Reference it in your project markdown frontmatter:

```yaml
---
title: "Your Project"
image: "/images/projects/your-image.png"
---
```

## Image Optimization

All images are automatically optimized by Next.js Image component:
- Automatic format conversion (WebP, AVIF)
- Responsive image sizing
- Lazy loading
- Blur placeholder generation

## Recommended Image Specifications

- **Format**: PNG, JPG, or WebP
- **Dimensions**: 1200x630px (optimal for social sharing)
- **File size**: < 500KB (will be optimized automatically)
- **Alt text**: Always provide descriptive alt text for accessibility

## Using Images in Components

```tsx
import Image from 'next/image';

<Image
  src="/images/projects/your-image.png"
  alt="Descriptive alt text"
  width={1200}
  height={630}
  // or use fill for responsive containers
/>
```
