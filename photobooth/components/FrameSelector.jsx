/**
 * FrameSelector.jsx
 * Displays a grid of available frames from /public/frames/.
 * On click, calls onSelect(frameSrc).
 */

import styles from './FrameSelector.module.css';

// Frame list is passed as prop (built from getStaticProps / fs scan)
export default function FrameSelector({ frames, selectedFrame, onSelect }) {
  return (
    <div className={styles.wrapper}>
      <p className={styles.hint}>Chọn khung ảnh và kéo xuống cùng để xem kết quả</p>

      {/* "No frame" option */}
      <div className={styles.grid}>
        <button
          className={`${styles.frameCard} ${!selectedFrame ? styles.active : ''}`}
          onClick={() => onSelect(null)}
        >
          <div className={styles.noFrameThumb}>
            <span>None</span>
          </div>
          <span className={styles.frameLabel}>Không dùng</span>
        </button>

        {frames.map((src) => {
          const name = src.split('/').pop().replace('.png', '').replace('frame', 'Frame ');
          return (
            <button
              key={src}
              className={`${styles.frameCard} ${selectedFrame === src ? styles.active : ''}`}
              onClick={() => onSelect(src)}
            >
              <div className={styles.thumb}>
                <img src={src} alt={name} className={styles.thumbImg} />
              </div>
              <span className={styles.frameLabel}>{name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
