/**
 * pages/camera.jsx
 * Camera capture screen.
 * After 4 photos are captured, stores them in sessionStorage and
 * navigates to /frames for frame selection.
 */

import { useRouter } from 'next/router';
import Head from 'next/head';
import Camera from '../components/Camera';
import styles from './camera.module.css';

export default function CameraPage() {
  const router = useRouter();

  // Called by Camera component when 4 photos are ready
  const handlePhotosComplete = (photos) => {
    // Persist to sessionStorage so frames page can read them
    sessionStorage.setItem('pb_photos', JSON.stringify(photos));
    router.push('/frames');
  };

  return (
    <>
      <Head>
        <title>Mì Studio – Camera</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.page}>
        {/* Header */}
        <header className={styles.header}>
          <button className={`btn btn-ghost ${styles.back}`} onClick={() => router.push('/')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Home
          </button>
          <h1 className={styles.title}>
            <span className={styles.titlePink}>Capture</span> your moments
          </h1>
          <div className={styles.spacer} />
        </header>

        <main className={styles.main}>
          <Camera onPhotosComplete={handlePhotosComplete} />
        </main>
      </div>
    </>
  );
}
