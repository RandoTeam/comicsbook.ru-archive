import React from 'react';
import { Icons } from '../utils/helpers';

export default function FolderModal({
  // Create Folder Modal Props
  showCreateModal = false,
  newFolderName = '',
  setNewFolderName,
  onCreateFolder,
  onCloseCreate,

  // Save Post to Folder Modal Props
  saveToFolderPost = null,
  folders = [],
  isFavorite = false,
  onToggleFavorite,
  onAddToFolder,
  onCloseSelect,
}) {
  return (
    <>
      {/* Create New Folder Modal */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={onCloseCreate}
          style={{ zIndex: 3000 }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '20px' }}
          >
            <h3 style={{ margin: '0 0 16px 0', fontSize: '17px' }}>
              Создать новую папку
            </h3>
            <input
              type="text"
              placeholder="Название папки..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                boxSizing: 'border-box',
                background: 'var(--card-bg)',
                color: 'var(--text-color)',
                outline: 'none',
                marginBottom: '20px',
              }}
              autoFocus
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={onCloseCreate}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Отмена
              </button>
              <button
                onClick={onCreateFolder}
                style={{
                  background: 'var(--tab-active)',
                  border: 'none',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '18px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Создать
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Post to Folder Selection Modal */}
      {saveToFolderPost && (
        <div
          className="modal-overlay"
          onClick={onCloseSelect}
          style={{ zIndex: 3000 }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '20px', maxWidth: '400px' }}
          >
            <h3 style={{ margin: '0 0 16px 0', fontSize: '17px' }}>
              Добавить в избранное
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div
                onClick={() => {
                  onToggleFavorite(saveToFolderPost.id);
                  onCloseSelect();
                }}
                style={{
                  padding: '12px',
                  background: 'var(--badge-bg)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontWeight: '600' }}>Все избранное (без папки)</span>
                {isFavorite && <Icons.StarFilled style={{ color: '#f7a823' }} />}
              </div>

              {folders.map((f) => {
                const inFolder = f.postIds.includes(saveToFolderPost.id);
                return (
                  <div
                    key={f.id}
                    onClick={() => {
                      onAddToFolder(saveToFolderPost.id, f.id);
                      onCloseSelect();
                    }}
                    style={{
                      padding: '12px',
                      background: 'var(--badge-bg)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>Папка: {f.name}</span>
                    {inFolder && <Icons.StarFilled style={{ color: '#f7a823' }} />}
                  </div>
                );
              })}

              {isFavorite && (
                <button
                  onClick={() => {
                    onToggleFavorite(saveToFolderPost.id);
                    onCloseSelect();
                  }}
                  style={{
                    marginTop: '10px',
                    background: '#ff3347',
                    color: 'white',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '18px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  Удалить из избранного
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
