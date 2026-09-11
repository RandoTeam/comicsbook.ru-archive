import React, { useState } from 'react';
import { Icons } from '../utils/helpers';

export default function MiniAudioPlayer({
  isPlaying,
  currentTrack,
  currentTrackIndex,
  totalTracks,
  volume,
  isMuted,
  onTogglePlay,
  onPrevTrack,
  onNextTrack,
  onVolumeChange,
  onToggleMute,
  onClose,
}) {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  return (
    <aside
      className="mini-audio-player"
      aria-label="Музыкальный плеер"
      style={{
        position: 'fixed',
        bottom: '68px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 24px)',
        maxWidth: '560px',
        zIndex: 900,
        background: 'var(--card-bg)',
        borderRadius: '16px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
        border: '1px solid var(--border-color)',
        padding: '10px 14px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
        {/* Animated Equalizer Bars */}
        <div
          className={`equalizer-bars ${isPlaying ? 'playing' : 'paused'}`}
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '3px',
            height: '18px',
            width: '18px',
            flexShrink: 0,
          }}
          title={isPlaying ? 'Воспроизведение' : 'На паузе'}
        >
          <span className="eq-bar eq-bar-1" />
          <span className="eq-bar eq-bar-2" />
          <span className="eq-bar eq-bar-3" />
          <span className="eq-bar eq-bar-4" />
        </div>

        {/* Track Title and Index */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--text-color)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {currentTrack ? currentTrack.title : 'Фоновая музыка'}
          </div>
          <div
            style={{
              fontSize: '11px',
              color: 'var(--text-secondary)',
              marginTop: '1px',
            }}
          >
            Ретро-плейлист • {currentTrackIndex + 1} из {totalTracks}
          </div>
        </div>

        {/* Playback Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <button
            type="button"
            className="player-btn"
            onClick={onPrevTrack}
            aria-label="Предыдущий трек"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-color)',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '50%',
            }}
          >
            <Icons.SkipPrev />
          </button>

          <button
            type="button"
            className="player-btn primary-play-btn"
            onClick={onTogglePlay}
            aria-label={isPlaying ? 'Пауза' : 'Воспроизвести'}
            style={{
              background: 'var(--tab-active)',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
              transition: 'transform 0.15s ease, background-color 0.2s',
            }}
          >
            {isPlaying ? <Icons.Pause /> : <Icons.Play />}
          </button>

          <button
            type="button"
            className="player-btn"
            onClick={onNextTrack}
            aria-label="Следующий трек"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-color)',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '50%',
            }}
          >
            <Icons.SkipNext />
          </button>

          <button
            type="button"
            className="player-btn"
            onClick={() => setShowVolumeSlider((v) => !v)}
            aria-label="Громкость"
            style={{
              background: showVolumeSlider ? 'var(--badge-bg)' : 'transparent',
              border: 'none',
              color: isMuted ? 'var(--text-secondary)' : 'var(--tab-active)',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '50%',
            }}
          >
            {isMuted || volume === 0 ? <Icons.VolumeMute /> : <Icons.VolumeUp />}
          </button>

          <button
            type="button"
            className="player-btn"
            onClick={onClose}
            aria-label="Закрыть панель плеера"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '50%',
              marginLeft: '2px',
            }}
          >
            <Icons.Close />
          </button>
        </div>
      </div>

      {/* Expandable Volume Slider Row */}
      {showVolumeSlider && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '6px 4px 2px 4px',
            borderTop: '1px solid var(--border-color)',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <button
            type="button"
            onClick={onToggleMute}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              padding: '2px',
            }}
            aria-label="Отключить звук"
          >
            {isMuted ? <Icons.VolumeMute /> : <Icons.VolumeUp />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--tab-active)', cursor: 'pointer' }}
            aria-label="Регулировка громкости"
          />
          <span
            style={{
              fontSize: '11px',
              fontWeight: 'bold',
              color: 'var(--text-secondary)',
              minWidth: '34px',
              textAlign: 'right',
            }}
          >
            {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
          </span>
        </div>
      )}
    </aside>
  );
}
