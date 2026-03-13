/**
 * Camera.jsx
 * WebRTC camera preview with filters, manual/auto capture modes.
 * Captures up to 4 photos and stores them in parent state.
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import styles from './Camera.module.css';

// Available CSS filters
export const FILTERS = [
  { id: 'normal',   label: 'Normal',    css: 'none' },
  { id: 'bw',       label: 'B & W',     css: 'grayscale(100%)' },
  { id: 'vintage',  label: 'Vintage',   css: 'sepia(60%) contrast(110%) brightness(105%)' },
  { id: 'sepia',    label: 'Sepia',     css: 'sepia(100%)' },
  { id: 'bright',   label: 'Bright',    css: 'brightness(130%) saturate(110%)' },
  { id: 'cool',     label: 'Cool',      css: 'hue-rotate(20deg) saturate(110%) brightness(105%)' },
];

const MAX_PHOTOS   = 4;
const AUTO_INTERVAL = 2800; // ms between shots in auto mode
const COUNTDOWN_SEC = 3;    // countdown before each shot

export default function Camera({ onPhotosComplete }) {
  const videoRef     = useRef(null);
  const canvasRef    = useRef(null);
  const streamRef    = useRef(null);
  const timerRef     = useRef(null);

  const [filter,      setFilter]    = useState(FILTERS[0]);
  const [mode,        setMode]      = useState('manual');   // 'manual' | 'auto'
  const [photos,      setPhotos]    = useState([]);         // captured dataURLs
  const [countdown,   setCountdown] = useState(null);       // null | number
  const [flash,       setFlash]     = useState(false);
  const [autoRunning, setAutoRunning] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [camReady,    setCamReady]  = useState(false);

  // ─── Start webcam ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => setCamReady(true);
        }
      } catch (err) {
        setCameraError('Camera access denied. Please allow camera permission and refresh.');
      }
    }
    startCamera();
    return () => {
      // Cleanup stream on unmount
      streamRef.current?.getTracks().forEach(t => t.stop());
      clearTimeout(timerRef.current);
    };
  }, []);

  // ─── Capture a single frame to canvas → dataURL ───────────────────────────
  const captureFrame = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;

    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');

    // Mirror (selfie) + apply filter
    ctx.filter = filter.css;
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();

    return canvas.toDataURL('image/jpeg', 0.92);
  }, [filter]);

  // ─── Flash animation + snap ───────────────────────────────────────────────
  const doSnap = useCallback((onDone) => {
    setFlash(true);
    setTimeout(() => setFlash(false), 500);
    const dataUrl = captureFrame();
    if (dataUrl) {
      setPhotos(prev => {
        const next = [...prev, dataUrl];
        onDone?.(next);
        return next;
      });
    }
  }, [captureFrame]);

  // ─── Manual capture ───────────────────────────────────────────────────────
  const handleManualCapture = useCallback(() => {
    if (photos.length >= MAX_PHOTOS) return;
    doSnap((next) => {
      if (next.length >= MAX_PHOTOS) {
        setTimeout(() => onPhotosComplete(next), 800);
      }
    });
  }, [photos.length, doSnap, onPhotosComplete]);

  // ─── Auto mode: countdown then shoot 4 times ─────────────────────────────
  const runAutoCapture = useCallback(() => {
    if (autoRunning) return;
    setAutoRunning(true);
    setPhotos([]);
    let shotCount = 0;

    const shootNext = () => {
      if (shotCount >= MAX_PHOTOS) {
        setAutoRunning(false);
        setCountdown(null);
        return;
      }
      // Countdown 3-2-1
      let c = COUNTDOWN_SEC;
      setCountdown(c);
      const tick = setInterval(() => {
        c--;
        if (c <= 0) {
          clearInterval(tick);
          setCountdown(null);
          // Actually snap
          const dataUrl = captureFrame();
          setFlash(true);
          setTimeout(() => setFlash(false), 500);
          if (dataUrl) {
            shotCount++;
            setPhotos(prev => {
              const next = [...prev, dataUrl];
              if (next.length >= MAX_PHOTOS) {
                setTimeout(() => {
                  setAutoRunning(false);
                  onPhotosComplete(next);
                }, 800);
              } else {
                // Schedule next shot
                timerRef.current = setTimeout(shootNext, 600);
              }
              return next;
            });
          }
        } else {
          setCountdown(c);
        }
      }, 1000);
    };

    shootNext();
  }, [autoRunning, captureFrame, onPhotosComplete]);

  // ─── UI ───────────────────────────────────────────────────────────────────
  return (
    <div className={styles.wrapper}>
      {/* Video preview area */}
      <div className={styles.previewArea}>
        <div
          className={styles.videoWrap}
          style={{ '--filter': filter.css }}
          data-snap={flash ? 'true' : undefined}
        >
          {cameraError ? (
            <div className={styles.errorBox}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ff8fab" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p>{cameraError}</p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={styles.video}
                style={{ filter: filter.css, transform: 'scaleX(-1)' }}
              />
              {!camReady && (
                <div className={styles.loadingOverlay}>
                  <div className={styles.spinner} />
                  <span>Starting camera...</span>
                </div>
              )}
            </>
          )}

          {/* Flash overlay */}
          {flash && <div className={styles.flash} />}

          {/* Countdown */}
          {countdown !== null && (
            <div className={styles.countdownOverlay}>
              <span key={countdown} className={styles.countdownNum}>{countdown}</span>
            </div>
          )}

          {/* Shot counter badge */}
          <div className={styles.shotBadge}>
            {photos.length} / {MAX_PHOTOS}
          </div>
        </div>

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      {/* Controls panel */}
      <div className={styles.controls}>
        {/* Filter selector */}
        <div className={styles.section}>
          <label className={styles.sectionLabel}>Filter</label>
          <div className={styles.filterRow}>
            {FILTERS.map(f => (
              <button
                key={f.id}
                className={`${styles.filterBtn} ${filter.id === f.id ? styles.filterActive : ''}`}
                onClick={() => setFilter(f)}
                title={f.label}
              >
                <div className={styles.filterSwatch} style={{ filter: f.css }} />
                <span>{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mode toggle */}
        <div className={styles.section}>
          <label className={styles.sectionLabel}>Mode</label>
          <div className={styles.modeToggle}>
            <button
              className={`${styles.modeBtn} ${mode === 'manual' ? styles.modeActive : ''}`}
              onClick={() => { setMode('manual'); setAutoRunning(false); }}
              disabled={autoRunning}
            >
              Manual
            </button>
            <button
              className={`${styles.modeBtn} ${mode === 'auto' ? styles.modeActive : ''}`}
              onClick={() => setMode('auto')}
              disabled={autoRunning}
            >
              Auto (4 shots)
            </button>
          </div>
        </div>

        {/* Capture button */}
        <div className={styles.captureArea}>
          {mode === 'manual' ? (
            <button
              className={styles.captureBtn}
              onClick={handleManualCapture}
              disabled={photos.length >= MAX_PHOTOS || !camReady}
              title="Take photo"
            >
              <div className={styles.captureInner} />
            </button>
          ) : (
            <button
              className={`btn btn-primary ${styles.autoBtn}`}
              onClick={runAutoCapture}
              disabled={autoRunning || !camReady}
            >
              {autoRunning ? (
                <>
                  <div className={styles.btnSpinner} />
                  Capturing...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                  Start Auto Shoot
                </>
              )}
            </button>
          )}
        </div>

        {/* Reset */}
        {photos.length > 0 && !autoRunning && (
          <button
            className={`btn btn-ghost ${styles.resetBtn}`}
            onClick={() => setPhotos([])}
          >
            Clear photos
          </button>
        )}
      </div>

      {/* Thumbnail strip */}
      {photos.length > 0 && (
        <div className={styles.strip}>
          <label className={styles.sectionLabel}>Captured</label>
          <div className={styles.thumbRow}>
            {Array.from({ length: MAX_PHOTOS }).map((_, i) => (
              <div key={i} className={styles.thumbSlot}>
                {photos[i] ? (
                  <img src={photos[i]} alt={`Shot ${i + 1}`} className={styles.thumb} />
                ) : (
                  <div className={styles.thumbEmpty}>{i + 1}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
