import React, { useState } from 'react';
import { Icons } from '../utils/helpers';

export default function SettingsView({
  theme,
  setTheme,
  fontSize,
  setFontSize,
  viewMode,
  setViewMode,
  smoothAnimations,
  setSmoothAnimations,
  hideMissingImages,
  setHideMissingImages,
  totalPostsCount,
  paginationEnabled,
  setPaginationEnabled,
  pageSize,
  setPageSize,
  ratingFilter,
  setRatingFilter,
  isMusicPlaying,
  toggleMusic,
  currentTrackIndex,
  tracks,
  selectTrack,
  playNextTrack,
  playPrevTrack,
  volume,
  setVolume,
  isMuted,
  toggleMute,
  onClearCache,
}) {
  const [showTracklist, setShowTracklist] = useState(false);

  return (
    <div className="settings-view" style={{ paddingBottom: '40px' }}>
      {/* 1. Music & Retro Audio Section */}
      <div className="settings-section-title">Музыка и Ретро-Звук</div>
      <div className="settings-section">
        <div className="setting-row">
          <div>
            <div style={{ fontWeight: '600' }}>Фоновая ретро-музыка</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {isMusicPlaying
                ? `Сейчас играет: ${tracks[currentTrackIndex]?.title || 'Трек'}`
                : 'Воспроизведение приостановлено'}
            </div>
          </div>
          <button
            type="button"
            onClick={toggleMusic}
            style={{
              background: isMusicPlaying ? 'var(--tab-active)' : 'var(--badge-bg)',
              color: isMusicPlaying ? '#ffffff' : 'var(--text-color)',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
          >
            {isMusicPlaying ? <Icons.Pause /> : <Icons.Play />}
            <span>{isMusicPlaying ? 'Пауза' : 'Включить'}</span>
          </button>
        </div>

        {/* Volume Slider */}
        <div className="setting-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={toggleMute}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: isMuted ? 'var(--text-secondary)' : 'var(--tab-active)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0,
                }}
                aria-label="Переключить без звука"
              >
                {isMuted || volume === 0 ? <Icons.VolumeMute /> : <Icons.VolumeUp />}
              </button>
              <span>Громкость воспроизведения</span>
            </div>
            <span style={{ fontWeight: 'bold', color: 'var(--badge-text)' }}>
              {isMuted ? 'Выкл' : `${Math.round(volume * 100)}%`}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            style={{ accentColor: 'var(--tab-active)', cursor: 'pointer' }}
          />
        </div>

        {/* Track Navigation */}
        <div className="setting-row">
          <span>Сменить трек</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={playPrevTrack}
              style={{
                background: 'var(--badge-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '6px 10px',
                cursor: 'pointer',
                color: 'var(--text-color)',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Предыдущий трек"
            >
              <Icons.SkipPrev />
            </button>
            <button
              type="button"
              onClick={() => setShowTracklist((prev) => !prev)}
              style={{
                background: 'var(--badge-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                color: 'var(--text-color)',
              }}
            >
              Плейлист ({tracks.length}) {showTracklist ? '▲' : '▼'}
            </button>
            <button
              type="button"
              onClick={playNextTrack}
              style={{
                background: 'var(--badge-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '6px 10px',
                cursor: 'pointer',
                color: 'var(--text-color)',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Следующий трек"
            >
              <Icons.SkipNext />
            </button>
          </div>
        </div>

        {/* Expanded Tracklist Selector */}
        {showTracklist && (
          <div
            style={{
              padding: '8px 14px 12px 14px',
              background: 'var(--badge-bg)',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            {tracks.map((track, idx) => (
              <div
                key={track.id || idx}
                onClick={() => selectTrack(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: idx === currentTrackIndex ? 'var(--card-bg)' : 'transparent',
                  border: idx === currentTrackIndex ? '1px solid var(--tab-active)' : '1px solid transparent',
                  fontWeight: idx === currentTrackIndex ? '600' : 'normal',
                  color: idx === currentTrackIndex ? 'var(--tab-active)' : 'var(--text-color)',
                  transition: 'background 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', opacity: 0.6 }}>{idx + 1}.</span>
                  <span style={{ fontSize: '13px' }}>{track.title}</span>
                </div>
                {idx === currentTrackIndex && isMusicPlaying && (
                  <span style={{ fontSize: '11px', color: 'var(--tab-active)', fontWeight: 'bold' }}>
                    Играет ▶
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Appearance & Animations */}
      <div className="settings-section-title">Оформление и Анимации</div>
      <div className="settings-section">
        <div className="setting-row">
          <span>Тема оформления</span>
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="light">Светлая</option>
            <option value="dark">Тёмная</option>
            <option value="oled">Черная (OLED)</option>
          </select>
        </div>

        <div className="setting-row">
          <span>Размер шрифта</span>
          <select value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
            <option value="small">Мелкий</option>
            <option value="medium">Средний</option>
            <option value="large">Крупный</option>
          </select>
        </div>

        <div className="setting-row">
          <span>Вид ленты</span>
          <select value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
            <option value="cards">Карточки (Полный)</option>
            <option value="compact">Компактный (Список)</option>
          </select>
        </div>

        <div className="setting-row">
          <div>
            <div>Плавные анимации интерфейса</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Плавные переходы карточек, модальных окон и плеера
            </div>
          </div>
          <input
            type="checkbox"
            checked={smoothAnimations}
            onChange={(e) => setSmoothAnimations(e.target.checked)}
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* 3. Offline & Media Codecs */}
      <div className="settings-section-title">Оффлайн и Медиа</div>
      <div className="settings-section">
        <div className="setting-row">
          <div>
            <div>Скрывать посты без картинок</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Не показывать в ленте элементы, где отсутствует оригинал
            </div>
          </div>
          <input
            type="checkbox"
            checked={hideMissingImages}
            onChange={(e) => setHideMissingImages(e.target.checked)}
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          />
        </div>

        <div className="setting-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span>Статус базы данных</span>
            <span style={{ fontWeight: 'bold', color: '#27ae60' }}>● Оффлайн готов</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            Архив содержит {totalPostsCount > 0 ? `${totalPostsCount} комиксов` : '24,000+ постов'} и полностью
            функционирует без интернета.
          </div>
          <div
            style={{
              display: 'flex',
              gap: '6px',
              flexWrap: 'wrap',
              marginTop: '10px',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: '12px',
                background: 'var(--badge-bg)',
                border: '1px solid var(--border-color)',
              }}
            >
              Поддержка WebP
            </span>
            <span
              style={{
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: '12px',
                background: 'var(--badge-bg)',
                border: '1px solid var(--border-color)',
              }}
            >
              Поддержка AVIF
            </span>
            <span
              style={{
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: '12px',
                background: 'var(--badge-bg)',
                border: '1px solid var(--border-color)',
              }}
            >
              PNG / JPEG / GIF
            </span>
          </div>
        </div>
      </div>

      {/* 4. Reading & Navigation */}
      <div className="settings-section-title">Режим чтения и Навигация</div>
      <div className="settings-section">
        <div className="setting-row">
          <div>
            <div>Постраничная навигация</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Перелистывание страниц вместо бесконечного скролла
            </div>
          </div>
          <input
            type="checkbox"
            checked={paginationEnabled}
            onChange={(e) => setPaginationEnabled(e.target.checked)}
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          />
        </div>

        {paginationEnabled && (
          <div className="setting-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Постов на страницу:</span>
              <span style={{ fontWeight: 'bold', color: 'var(--badge-text)' }}>{pageSize}</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={pageSize}
              onChange={(e) => {
                const steps = [5, 10, 20, 30, 40, 50];
                const val = parseInt(e.target.value, 10);
                const closest = steps.reduce((prev, curr) =>
                  Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev
                );
                setPageSize(closest);
              }}
              style={{ accentColor: 'var(--tab-active)', cursor: 'pointer' }}
            />
          </div>
        )}

        <div className="setting-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Минимальный рейтинг:</span>
            <span style={{ fontWeight: 'bold', color: 'var(--badge-text)' }}>
              {ratingFilter === -999999 ? 'Все посты' : `от ${ratingFilter}`}
            </span>
          </div>
          <input
            type="range"
            min="-500"
            max="5000"
            step="50"
            value={ratingFilter === -999999 ? -500 : ratingFilter}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setRatingFilter(val <= -500 ? -999999 : val);
            }}
            style={{ accentColor: 'var(--tab-active)', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* 5. Local Data & Cache */}
      <div className="settings-section-title">Локальные данные и Кэш</div>
      <div className="settings-section">
        <div
          className="setting-row"
          style={{ cursor: 'pointer', color: '#ff3347' }}
          onClick={() => onClearCache('history')}
        >
          <span>Очистить историю просмотров</span>
          <Icons.Trash />
        </div>
        <div
          className="setting-row"
          style={{ cursor: 'pointer', color: '#ff3347' }}
          onClick={() => onClearCache('favorites')}
        >
          <span>Очистить избранное и папки</span>
          <Icons.Trash />
        </div>
        <div
          className="setting-row"
          style={{ cursor: 'pointer', color: '#ff3347' }}
          onClick={() => onClearCache('likes')}
        >
          <span>Сбросить пользовательские оценки</span>
          <Icons.Trash />
        </div>
      </div>

      {/* 6. About App Info */}
      <div className="settings-section-title">О приложении</div>
      <div className="settings-section" style={{ padding: '14px', fontSize: '13px', lineHeight: '1.6' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontWeight: 'bold', fontSize: '15px' }}>Comicsbook.ru Архив</span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '10px',
              background: 'var(--badge-bg)',
              color: 'var(--badge-text)',
              fontSize: '11px',
              fontWeight: 'bold',
            }}
          >
            v1.0.6
          </span>
        </div>
        <div style={{ color: 'var(--text-secondary)' }}>
          Офлайн-клиент и интерактивный музей легендарного сайта комиксов и мемов эпохи 2011–2015 годов.
        </div>
        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-color)', fontSize: '12px', color: 'var(--text-secondary)' }}>
          Автор: <strong>RandoTeam</strong> • Лицензия: <strong>MIT</strong>
        </div>
      </div>
    </div>
  );
}
