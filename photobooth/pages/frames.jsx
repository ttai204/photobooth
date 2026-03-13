/**
 * pages/frames.jsx
 * Frame selection page.
 * Reads photos from sessionStorage, shows frame grid + live canvas preview.
 * getStaticProps scans /public/frames for PNG files to build the frame list.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import path from 'path';
import fs from 'fs';
import FrameSelector from '../components/FrameSelector';
import PreviewCanvas from '../components/PreviewCanvas';
import styles from './frames.module.css';

export default function FramesPage({ frames }) {
  const router = useRouter();
  const [photos,        setPhotos]        = useState([]);
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [loaded,        setLoaded]        = useState(false);

  // Load photos from sessionStorage
  useEffect(() => {
    const raw = sessionStorage.getItem('pb_photos');
    if (raw) {
      try { setPhotos(JSON.parse(raw)); } catch {}
    }
    setLoaded(true);
  }, []);

  // If no photos → send back to camera
  useEffect(() => {
    if (loaded && photos.length === 0) router.replace('/camera');
  }, [loaded, photos, router]);

  const handleRetake = () => {
    sessionStorage.removeItem('pb_photos');
    router.push('/camera');
  };

  if (!loaded || photos.length === 0) return null;

  return (
    <>
      <Head>
        <title>Mì Studio – Choose Frame</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.page}>
        {/* Header */}
        <header className={styles.header}>
          <button className={`btn btn-ghost ${styles.back}`} onClick={handleRetake}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Retake
          </button>
          <h1 className={styles.title}>
            <span className={styles.titlePink}>Choose</span> your frame
          </h1>
          <div className={styles.spacer} />
        </header>

        <main className={styles.main}>
          {/* Left: frame selector */}
          <section className={`card ${styles.selectorCard}`}>
            <FrameSelector
              frames={frames}
              selectedFrame={selectedFrame}
              onSelect={setSelectedFrame}
            />
          </section>

          {/* Right: preview + download */}
          <section className={`card ${styles.previewCard}`}>
            <h2 className={styles.previewTitle}>Preview</h2>
            <PreviewCanvas photos={photos} frameSrc={selectedFrame} />
          </section>
        </main>
      </div>
    </>
  );
}

// ─── Scan /public/frames at build time ───────────────────────────────────────
export async function getStaticProps() {
  const framesDir = path.join(process.cwd(), 'public', 'frames');
  let frames = [];
  try {
    frames = fs
      .readdirSync(framesDir)
      .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
      .sort()
      .map(f => `/frames/${f}`);
  } catch {
    // folder may not exist in dev
  }
  return { props: { frames } };
}
