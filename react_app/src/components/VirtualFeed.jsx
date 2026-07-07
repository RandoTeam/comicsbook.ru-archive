import React from 'react';
import { Virtuoso } from 'react-virtuoso';
import PostCard from './PostCard';

export default function VirtualFeed({
  posts,
  viewMode,
  comments,
  favorites,
  likes,
  onSelectPost,
  onAddToHistory,
  onContextMenu,
  onSaveFavorite,
  onRate
}) {
  return (
    <Virtuoso
      useWindowScroll
      data={posts}
      itemContent={(index, post) => {
        const commentsCount = (comments[post.id] || []).length;
        const isFavorite = favorites.includes(post.id);
        const likesState = likes[post.id] || 0;
        const currentRating = (post.rating || 0) + likesState;

        return (
          <PostCard
            key={post.id}
            post={post}
            viewMode={viewMode}
            commentsCount={commentsCount}
            isFavorite={isFavorite}
            currentRating={currentRating}
            likesState={likesState}
            onSelectPost={onSelectPost}
            onAddToHistory={onAddToHistory}
            onContextMenu={onContextMenu}
            onSaveFavorite={onSaveFavorite}
            onRate={onRate}
          />
        );
      }}
      components={{
        Footer: () => (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Больше комиксов нет
          </div>
        )
      }}
    />
  );
}
