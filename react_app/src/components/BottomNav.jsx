import React from 'react';
import { Icons } from '../utils/helpers';

export default function BottomNav({ activeTab, selectedPost, onTabChange }) {
  return (
    <nav className="bottom-nav">
      <div
        className={`nav-tab ${activeTab === 'feed' && !selectedPost ? 'active' : ''}`}
        onClick={() => onTabChange('feed')}
      >
        <Icons.Feed />
        <span>Лента</span>
      </div>
      <div
        className={`nav-tab ${activeTab === 'categories' ? 'active' : ''}`}
        onClick={() => onTabChange('categories')}
      >
        <Icons.Categories />
        <span>Категории</span>
      </div>
      <div
        className={`nav-tab ${activeTab === 'search' ? 'active' : ''}`}
        onClick={() => onTabChange('search')}
      >
        <Icons.Search />
        <span>Поиск</span>
      </div>
      <div
        className={`nav-tab ${activeTab === 'random' ? 'active' : ''}`}
        onClick={() => onTabChange('random')}
      >
        <Icons.Random />
        <span>Случайный</span>
      </div>
      <div
        className={`nav-tab ${activeTab === 'favorites' ? 'active' : ''}`}
        onClick={() => onTabChange('favorites')}
      >
        <Icons.Favorites />
        <span>Избранное</span>
      </div>
      <div
        className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
        onClick={() => onTabChange('settings')}
      >
        <Icons.Settings />
        <span>Меню</span>
      </div>
    </nav>
  );
}
