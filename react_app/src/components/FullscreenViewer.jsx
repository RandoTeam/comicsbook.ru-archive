import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Icons, getPostImageUrl } from '../utils/helpers';

export default function FullscreenViewer({
  post,
  onClose,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
  isFavorite = false,
  onToggleFavorite,
  onSaveToGallery,
  onShare,
}) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const lastTouchDistanceRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const lastTapRef = useRef(0);

  // Reset scale and position on post change
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [post?.id]);

  // Handle double tap to zoom toggle
  const handleDoubleTap = useCallback((e) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (scale > 1) {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      } else {
        setScale(2.5);
      }
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  }, [scale]);

  // Touch start: record single touch or pinch distance
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastTouchDistanceRef.current = dist;
    } else if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
      if (scale > 1) {
        setIsDragging(true);
        dragStartRef.current = {
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y,
        };
      }
    }
  };

  // Touch move: pinch zoom or drag or swipe
  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && lastTouchDistanceRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = dist / lastTouchDistanceRef.current;
      setScale((prev) => {
        const next = Math.min(Math.max(prev * delta, 1), 4);
        if (next === 1) {
          setPosition({ x: 0, y: 0 });
        }
        return next;
      });
      lastTouchDistanceRef.current = dist;
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      setPosition({
        x: e.touches[0].clientX - dragStartRef.current.x,
        y: e.touches[0].clientY - dragStartRef.current.y,
      });
    }
  };

  // Touch end: reset pinch or evaluate swipe
  const handleTouchEnd = (e) => {
    if (e.touches.length < 2) {
      lastTouchDistanceRef.current = null;
    }
    if (e.touches.length === 0) {
      setIsDragging(false);

      // Check horizontal swipe if not zoomed in
      if (scale <= 1.05) {
        const touch = e.changedTouches[0];
        if (touch) {
          const deltaX = touch.clientX - touchStartRef.current.x;
          const deltaY = touch.clientY - touchStartRef.current.y;
          const duration = Date.now() - touchStartRef.current.time;

          if (Math.abs(deltaX) > 60 && Math.abs(deltaY) < 50 && duration < 350) {
            if (deltaX < 0 && hasNext && onNext) {
              onNext();
            } else if (deltaX > 0 && hasPrev && onPrev) {
              onPrev();
            }
          }
        }
      }
    }
  };

  if (!post) return null;

  return (
    <div
      className="fullscreen-overlay"
      ref={containerRef}
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'none', userSelect: 'none' }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)',
          zIndex: 102,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ color: '#fff', fontSize: '15px', fontWeight: 'bold', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
          {post.title ? post.title : `#${post.id}`}
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {scale > 1 && (
            <button
              onClick={() => {
                setScale(1);
                setPosition({ x: 0, y: 0 });
              }}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '16px',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              100%
            </button>
          )}
          <button
            className="fullscreen-close"
            style={{ position: 'static' }}
            onClick={onClose}
            aria-label="Закрыть просмотр"
          >
            ×
          </button>
        </div>
      </div>

      {/* Main Image with Pan & Zoom Transform */}
      <img
        className="fullscreen-img"
        src={getPostImageUrl(post)}
        alt={post.title || ''}
        onClick={handleDoubleTap}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          cursor: scale > 1 ? 'grab' : 'zoom-in',
          transition: isDragging ? 'none' : 'transform 0.15s ease-out',
        }}
      />

      {/* Prev / Next navigation arrow controls */}
      {hasPrev && onPrev && scale <= 1.05 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(0,0,0,0.4)',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 101,
          }}
          aria-label="Предыдущий комикс"
        >
          ‹
        </button>
      )}

      {hasNext && onNext && scale <= 1.05 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(0,0,0,0.4)',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 101,
          }}
          aria-label="Следующий комикс"
        >
          ›
        </button>
      )}

      {/* Bottom Bar: Action buttons */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
          alignItems: 'center',
          padding: '16px 20px',
          paddingBottom: 'env(safe-area-inset-bottom, 20px)',
          background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
          zIndex: 102,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {onToggleFavorite && (
          <button
            onClick={() => onToggleFavorite(post.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: isFavorite ? '#f7a823' : '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
            }}
          >
            {isFavorite ? <Icons.StarFilled /> : <Icons.StarOutline />}
            <span>{isFavorite ? 'В избранном' : 'В избранное'}</span>
          </button>
        )}

        {onSaveToGallery && (
          <button
            onClick={() => onSaveToGallery(post)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
            }}
          >
            <Icons.Download />
            <span>Сохранить</span>
          </button>
        )}

        {onShare && (
          <button
            onClick={() => onShare(post)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
            }}
          >
            <Icons.Share />
            <span>Поделиться</span>
          </button>
        )}
      </div>
    </div>
  );
}
