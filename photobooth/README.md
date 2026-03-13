# PinkBooth 🌸

A cute online photobooth built with **Next.js** — capture 4 photos with filters, choose a frame, and download your photo strip!

## Features

- 📸 Live webcam preview via WebRTC
- 🎨 6 real-time filters: Normal, B&W, Vintage, Sepia, Bright, Cool
- 🖐 Manual mode (one shot at a time) and Auto mode (4 shots with 3s countdown)
- 🖼 Custom frame overlay — drop your own PNGs into `/public/frames/`
- 💾 Download as a PNG photo strip
- 📱 Responsive design (desktop + mobile)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Adding Your Own Frames

Drop any `.png` file into `/public/frames/`. The app auto-detects all frames at build time via `getStaticProps`.

**Frame design tips:**
- Use a **transparent PNG** with decorative borders/overlays
- Recommended size: **800 × 2400 px** (portrait strip ratio)
- The frame is drawn on top of the 4-photo strip, so keep inner areas transparent

## Project Structure

```
/pages
  index.jsx          ← Landing page
  camera.jsx         ← Webcam capture screen
  frames.jsx         ← Frame selection + preview + download

/components
  Camera.jsx         ← WebRTC + filter + capture logic
  Camera.module.css
  FrameSelector.jsx  ← Grid of frame thumbnails
  FrameSelector.module.css
  PreviewCanvas.jsx  ← Canvas compositing + download
  PreviewCanvas.module.css

/public/frames/      ← Drop frame PNGs here
/styles/globals.css  ← CSS variables + global styles
```

## Deploy to Vercel

1. Push to GitHub
2. Import repo at [vercel.com](https://vercel.com)
3. Framework preset: **Next.js** (auto-detected)
4. Click **Deploy** — done!

Or via CLI:
```bash
npm i -g vercel
vercel
```

## Tech Stack

- Next.js 14 (Pages Router)
- WebRTC `getUserMedia`
- HTML5 Canvas for compositing
- CSS Modules
- Google Fonts: Nunito + Pacifico
