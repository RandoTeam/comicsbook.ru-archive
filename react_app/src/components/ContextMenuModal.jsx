import React from 'react';
import { Icons } from '../utils/helpers';

export default function ContextMenuModal({
  post,
  dialogRef,
  onClose,
  onFullscreen,
  onCopyImage,
  onSaveToGallery,
  isFavorite = false,
  onToggleFavorite,
  onOpenFolderSelect,
  onCopyLink,
  onHidePost,
}) {
  if (!post) return null;

  const imageSrc =
    post.category === 'ВКонтакте' && post.image_url
      ? post.image_url
      : `upload/${post.filename}`;

  return (
    <dialog
      ref={dialogRef}
      className="context-menu-dialog"
      onClick={(e) => {
        if (e.target === dialogRef.current) {
          onClose();
        }
      }}
    >
      <div className="context-menu-container">
        <div className="context-menu-preview">
          <img src={imageSrc} alt={post.title || ''} />
        </div>
        <div className="context-menu-options">
          <button
            className="context-option"
            onClick={() => {
              onFullscreen(post);
              onClose();
            }}
          >
            <Icons.Fullscreen className="option-icon" /> На весь экран
          </button>

          <button
            className="context-option"
            onClick={() => {
              onCopyImage(post);
              onClose();
            }}
          >
            <Icons.Copy className="option-icon" /> Скопировать
          </button>

          <button
            className="context-option"
            onClick={() => {
              onSaveToGallery(post);
              onClose();
            }}
          >
            <Icons.Download className="option-icon" /> Сохранить в галерею
          </button>

          <button
            className="context-option"
            onClick={() => {
              onToggleFavorite(post.id);
              onClose();
            }}
          >
            {isFavorite ? (
              <Icons.StarFilled className="option-icon" style={{ color: '#f7a823' }} />
            ) : (
              <Icons.StarOutline className="option-icon" />
            )}
            {isFavorite ? 'В избранном' : 'В избранное'}
          </button>

          <button
            className="context-option"
            onClick={() => {
              onOpenFolderSelect(post);
              onClose();
            }}
          >
            <Icons.FolderAdd className="option-icon" /> Добавить в папку...
          </button>

          <button
            className="context-option"
            onClick={() => {
              onCopyLink(post);
              onClose();
            }}
          >
            <Icons.Share className="option-icon" /> Поделиться ссылкой
          </button>

          <button
            className="context-option danger"
            onClick={() => {
              onHidePost(post.id);
              onClose();
            }}
          >
            <Icons.Hide className="option-icon" /> Скрыть этот мем
          </button>
        </div>
      </div>
    </dialog>
  );
}
