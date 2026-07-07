import React from 'react';
import { Icons, getPostImageUrl, getCatGif, handleImageError } from '../utils/helpers';

export default function PostCard({
  post,
  viewMode,
  commentsCount,
  isFavorite,
  currentRating,
  likesState,
  onSelectPost,
  onAddToHistory,
  onContextMenu,
  onSaveFavorite,
  onRate
}) {
  if (viewMode === 'compact') {
    return (
      <div
        className="item-compact"
        onClick={() => {
          onSelectPost(post);
          onAddToHistory(post.id);
        }}
      >
        <div className="thumb">
          <img 
            src={getPostImageUrl(post)} 
            onError={(e) => handleImageError(e, post)} 
            alt="" 
            loading="lazy" 
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onContextMenu(post); }}
          />
        </div>
        <div className="info">
          <h3>{post.title || 'Без названия'}</h3>
          <div className="meta">
            {post.category} • 💬 {commentsCount}
          </div>
        </div>
        <div className="compact-rate">
          {currentRating > 0 ? `+${currentRating}` : currentRating}
        </div>
      </div>
    );
  }

  return (
    <div
      className="item"
      onClick={() => onAddToHistory(post.id)}
    >
      <header>
        <div className="ava">
          <img src={getCatGif(post.category)} alt="" />
        </div>
        <div className="text" onClick={() => { onSelectPost(post); onAddToHistory(post.id); }} style={{ cursor: 'pointer' }}>
          <h2>{post.category}</h2>
          <h3>{post.title || 'Без названия'}</h3>
          <div className="meta-info">
            Добавил: {post.author || 'Аноним'} •{' '}
            {post.date_str || 'Архив'}
          </div>
        </div>
      </header>

      <section>
        <img 
          src={getPostImageUrl(post)} 
          onError={(e) => handleImageError(e, post)} 
          alt="" 
          loading="lazy" 
          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onContextMenu(post); }}
        />
      </section>

      <footer>
        <div className="footer-btn-group">
          <div
            className="footer-btn"
            onClick={() => onSelectPost(post)}
          >
            <Icons.Comments />
            <span style={{ marginLeft: '4px' }}>Комментарии ({commentsCount})</span>
          </div>
          <div
            className={`footer-btn ${isFavorite ? 'active-saved' : ''}`}
            onClick={() => onSaveFavorite(post)}
          >
            {isFavorite ? <Icons.StarFilled /> : <Icons.StarOutline />}
            <span style={{ marginLeft: '4px' }}>{isFavorite ? 'В избранном' : 'Сохранить'}</span>
          </div>
        </div>
        <div className="rate-controls">
          <span
            className={`rate-btn ${likesState === -1 ? 'disliked' : ''}`}
            onClick={(e) => { e.stopPropagation(); onRate(post.id, 'dislike'); }}
          >
            <Icons.Dislike />
          </span>
          <p>{currentRating}</p>
          <span
            className={`rate-btn ${likesState === 1 ? 'liked' : ''}`}
            onClick={(e) => { e.stopPropagation(); onRate(post.id, 'like'); }}
          >
            <Icons.Like />
          </span>
        </div>
      </footer>
    </div>
  );
}
