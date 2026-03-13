import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from './index.module.css';

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>PinkBooth - Online Photobooth</title>
        <meta name="description" content="Cute online photobooth with filters and frames" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {/* Background decoration */}
        <div className={styles.bgDecor}>
          <div className={styles.blob1} />
          <div className={styles.blob2} />
          <div className={styles.blob3} />
        </div>

        <div className={styles.hero}>
          {/* Logo */}
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="12" fill="#ff8fab"/>
                <circle cx="20" cy="18" r="8" stroke="white" strokeWidth="2.5" fill="none"/>
                <circle cx="20" cy="18" r="4" fill="white" opacity="0.6"/>
                <rect x="8" y="28" width="24" height="4" rx="2" fill="white" opacity="0.4"/>
                <rect x="14" y="8" width="4" height="3" rx="1.5" fill="white"/>
              </svg>
            </div>
            <span className={styles.logoText}>PinkBooth</span>
          </div>

          {/* Headline */}
          <h1 className={styles.title}>
            Your Cute
            <br />
            <span className={styles.titleAccent}>Photo Booth</span>
          </h1>
          <p className={styles.subtitle}>
            Capture memories with filters, frames, and photo strips
            <br />
            — all in your browser, no app needed.
          </p>

          {/* CTA */}
          <button
            className={`btn btn-primary ${styles.ctaBtn}`}
            onClick={() => router.push('/camera')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            Start Shooting
          </button>

          {/* Feature pills */}
          <div className={styles.features}>
            {['6 Filters', '4-Photo Strip', 'Custom Frames', 'Instant Download'].map(f => (
              <span key={f} className={styles.pill}>{f}</span>
            ))}
          </div>
        </div>

        {/* Preview mockup */}
        <div className={styles.mockup}>
          <div className={styles.strip}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={styles.stripSlot}>
                <div className={styles.stripGradient} style={{
                  background: `linear-gradient(135deg, hsl(${i * 40 + 300}, 80%, 85%), hsl(${i * 40 + 320}, 70%, 80%))`
                }} />
              </div>
            ))}
            <div className={styles.stripLabel}>PinkBooth</div>
          </div>
        </div>
      </main>
    </>
  );
}
