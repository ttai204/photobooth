/**
 * PreviewCanvas.jsx
 * Renders a live canvas preview compositing 4 photos in a vertical strip
 * with the selected frame overlaid. Provides a Download button.
 *
 * Strip layout:
 *  - Width: STRIP_W
 *  - Each photo: STRIP_W × PHOTO_H (4:3 ratio adjusted)
 *  - Bottom label area: LABEL_H
 *  - Frame PNG: overlaid at full strip size
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import styles from './PreviewCanvas.module.css';

// Strip dimensions (portrait)
const STRIP_W  = 400;
const PHOTO_H  = 300;
const GAP      = 8;
const PADDING  = 16;
const LABEL_H  = 60;
const STRIP_H  = PADDING + (PHOTO_H + GAP) * 4 - GAP + PADDING + LABEL_H;

export default function PreviewCanvas({ photos, frameSrc }) {
  const canvasRef  = useRef(null);
  const [loading, setLoading] = useState(false);

  // ─── Draw the composite strip ─────────────────────────────────────────────
  const draw = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width  = STRIP_W;
    canvas.height = STRIP_H;

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.roundRect(0, 0, STRIP_W, STRIP_H, 20);
    ctx.fill();

    // Helper: load image → HTMLImageElement
    const loadImg = (src) => new Promise((res, rej) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload  = () => res(img);
      img.onerror = () => rej(new Error(`Failed: ${src}`));
      img.src = src;
    });

    // Draw each photo slot
    for (let i = 0; i < 4; i++) {
      const y = PADDING + i * (PHOTO_H + GAP);
      const x = PADDING;
      const w = STRIP_W - PADDING * 2;
      const h = PHOTO_H;

      ctx.save();
      // Rounded clip
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 8);
      ctx.clip();

      if (photos[i]) {
        try {
          const img = await loadImg(photos[i]);
          // Cover-fit
          const srcAR = img.width / img.height;
          const dstAR = w / h;
          let sx, sy, sw, sh;
          if (srcAR > dstAR) {
            sh = img.height; sw = sh * dstAR;
            sx = (img.width - sw) / 2; sy = 0;
          } else {
            sw = img.width; sh = sw / dstAR;
            sx = 0; sy = (img.height - sh) / 2;
          }
          ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
        } catch {
          ctx.fillStyle = '#ffe4ea';
          ctx.fillRect(x, y, w, h);
        }
      } else {
        // Empty slot placeholder
        ctx.fillStyle = '#ffe4ea';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#ffb6c1';
        ctx.font = 'bold 48px Nunito, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(i + 1), x + w / 2, y + h / 2);
      }
      ctx.restore();
    }

    // Bottom label
    const labelY = STRIP_H - LABEL_H;
    ctx.fillStyle = '#ffb6c1';
    ctx.beginPath();
    ctx.roundRect(0, labelY, STRIP_W, LABEL_H, [0, 0, 20, 20]);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = 'bold 22px Pacifico, cursive';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PinkBooth', STRIP_W / 2, labelY + LABEL_H / 2);

    // Overlay frame (if selected)
    if (frameSrc) {
      try {
        const frameImg = await loadImg(frameSrc);
        ctx.drawImage(frameImg, 0, 0, STRIP_W, STRIP_H);
      } catch {
        console.warn('Frame load failed:', frameSrc);
      }
    }
  }, [photos, frameSrc]);

  useEffect(() => { draw(); }, [draw]);

  // ─── Download ─────────────────────────────────────────────────────────────
  const handleDownload = async () => {
    setLoading(true);
    await draw();
    const canvas = canvasRef.current;
    const url  = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href     = url;
    link.download = `pinkbooth-${Date.now()}.png`;
    link.click();
    setLoading(false);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.canvasWrap}>
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>

      <button
        className={`btn btn-primary ${styles.downloadBtn}`}
        onClick={handleDownload}
        disabled={loading}
      >
        {loading ? (
          <>
            <div className={styles.spinner} />
            Generating...
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download Photo Strip
          </>
        )}
      </button>
    </div>
  );
}
