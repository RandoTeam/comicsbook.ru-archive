import React, { useState, useEffect, useRef } from 'react';
import Toast from './components/Toast';

// Mono SVG Icons
const Icons = {
  Music: (props) => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" {...props}>
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
    </svg>
  ),
  Feed: (props) => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" {...props}>
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z"/>
    </svg>
  ),
  Categories: (props) => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" {...props}>
      <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
    </svg>
  ),
  Favorites: (props) => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" {...props}>
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>
  ),
  History: (props) => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" {...props}>
      <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.53.85-1.07-3.63-2.16V8h-1.5z"/>
    </svg>
  ),
  Settings: (props) => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" {...props}>
      <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
    </svg>
  ),
  Search: (props) => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" {...props}>
      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
    </svg>
  ),
  Random: (props) => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" {...props}>
      <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
    </svg>
  ),
  Comments: (props) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ display: 'inline-block', verticalAlign: 'middle' }} {...props}>
      <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
    </svg>
  ),
  Like: (props) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...props}>
      <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h7.82c.74 0 1.37-.45 1.63-1.09l3.01-7.02c.08-.2.12-.42.12-.66V10z"/>
    </svg>
  ),
  Dislike: (props) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...props}>
      <path d="M19 15h4V3h-4v12zm-4-12H7.18c-.74 0-1.37.45-1.63 1.09L2.54 11.11c-.08.2-.12.42-.12.66V13c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L11.17 23l6.58-6.59c.37-.36.59-.86.59-1.41V5c0-1.1-.9-2-2-2z"/>
    </svg>
  ),
  ArrowLeft: (props) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" {...props}>
      <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
    </svg>
  ),
  ArrowRight: (props) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" {...props}>
      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
    </svg>
  ),
  ArrowUp: (props) => (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" {...props}>
      <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/>
    </svg>
  ),
  FolderAdd: (props) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" {...props}>
      <path d="M20 6h-8l-2-2H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-1 8h-3v3h-2v-3h-3v-2h3V9h2v3h3v2z"/>
    </svg>
  ),
  StarOutline: (props) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  ),
  StarFilled: (props) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...props}>
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>
  ),
  Trash: (props) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...props}>
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
    </svg>
  )
};

// Ava mappings based on category names
const getCatGif = (cat) => {
  let gif = '28.gif';
  if (cat === 'FFFUUUuuu') gif = '2.gif';
  else if (cat === 'Trollface') gif = '1.gif';
  else if (cat === 'Poker Face') gif = '5.gif';
  else if (cat === 'LOL') gif = '4.gif';
  else if (cat === 'Me Gusta') gif = '7.gif';
  else if (cat === 'Okay') gif = '26.gif';
  else if (cat === 'Genius') gif = '61.gif';
  else if (cat === 'Forever Alone') gif = '25.gif';
  else if (cat === 'Yao Ming') gif = '19.gif';
  return `img/cats/${gif}`;
};

const handleImageError = (e, post) => {
  if (!post || !post.image_url) return;
  if (e.target.dataset.fallback) return;
  e.target.dataset.fallback = 'true';
  const isFullUrl = post.image_url.startsWith('http://') || post.image_url.startsWith('https://');
  const originalUrl = isFullUrl ? post.image_url : `http://comicsbook.ru${post.image_url}`;
  const waybackUrl = `https://web.archive.org/web/${post.timestamp}im_/${originalUrl}`;
  e.target.src = waybackUrl;
};

export default function App() {
  // DB state
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);

  // App UI state
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef(null);
  const playlist = ['audio/space1.mp3', 'audio/space2.mp3', 'audio/space3.mp3'];
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [showExitToast, setShowExitToast] = useState(false);
  const backPressTime = useRef(0);
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('activeTab') || 'feed');
  const [activeSort, setActiveSort] = useState(() => localStorage.getItem('activeSort') || 'best');
  const [activeCategory, setActiveCategory] = useState(() => {
    const saved = localStorage.getItem('activeCategory');
    return saved && saved !== 'null' ? saved : null;
  });
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedPost, setSelectedPost] = useState(() => {
    const saved = localStorage.getItem('selectedPost');
    return saved && saved !== 'null' ? JSON.parse(saved) : null;
  });
  const [displayCount, setDisplayCount] = useState(10);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTopBtn, setShowScrollTopBtn] = useState(false);

  // Auto-hiding header state
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Local storage persisted state
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('history');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return parsed.map(item => typeof item === 'object' && item.id ? item : { id: item, ts: Date.now() });
    } catch (e) {
      return [];
    }
  });
  const [likes, setLikes] = useState(() => {
    const saved = localStorage.getItem('likes');
    return saved ? JSON.parse(saved) : {};
  });
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'light';
  });
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('fontSize');
    return saved || 'medium';
  });
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem('viewMode');
    return saved || 'cards';
  });
  const [ratingFilter, setRatingFilter] = useState(() => {
    const saved = localStorage.getItem('ratingFilter');
    return saved ? parseInt(saved, 10) : -999999;
  });
  const [hideMissingImages, setHideMissingImages] = useState(() => {
    const saved = localStorage.getItem('hideMissingImages');
    return saved ? JSON.parse(saved) : true;
  });

  // NEW: Pagination states
  const [paginationEnabled, setPaginationEnabled] = useState(() => {
    const saved = localStorage.getItem('paginationEnabled');
    return saved ? JSON.parse(saved) : false;
  });
  const [pageSize, setPageSize] = useState(() => {
    const saved = localStorage.getItem('pageSize');
    return saved ? parseInt(saved, 10) : 20;
  });
  const [currentPage, setCurrentPage] = useState(1);

  // NEW: Favorites folders state
  // Folders structure: { id, name, postIds: [] }
  const [folders, setFolders] = useState(() => {
    const saved = localStorage.getItem('folders');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeFolderId, setActiveFolderId] = useState('all'); // 'all' or specific folder ID
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [saveToFolderPost, setSaveToFolderPost] = useState(null); // Post currently being added to a folder

  // Track comments expansion per post
  const [expandedComments, setExpandedComments] = useState({});

  // Restore scroll positions & display counts per tab
  const scrollPositions = useRef(
    JSON.parse(localStorage.getItem('scrollPositions')) || {}
  );
  const displayCounts = useRef(
    JSON.parse(localStorage.getItem('displayCounts')) || {}
  );


  // Hardware back button listener for Cordova
  useEffect(() => {
    const onBackKeyDown = (e) => {
      e.preventDefault();
      
      if (showFolderModal) {
        setShowFolderModal(false);
        return;
      }
      
      if (showSearch) {
        setShowSearch(false);
        setSearchKeyword('');
        return;
      }
      
      if (selectedPost) {
        setSelectedPost(null);
        setTimeout(() => {
          window.scrollTo(0, scrollPositions.current[activeTab] || 0);
        }, 50);
        return;
      }
      
      if (activeCategory) {
        setActiveCategory(null);
        return;
      }
      
      if (activeTab !== 'feed') {
        handleTabChange('feed');
        return;
      }
      
      // We are on the top level of the feed tab
      const currentTime = new Date().getTime();
      if (currentTime - backPressTime.current < 2000) {
        if (navigator.app && navigator.app.exitApp) {
          navigator.app.exitApp();
        }
      } else {
        setShowExitToast(true);
        backPressTime.current = currentTime;
      }
    };

    document.addEventListener("backbutton", onBackKeyDown, false);
    return () => {
      document.removeEventListener("backbutton", onBackKeyDown, false);
    };
  }, [showFolderModal, showSearch, selectedPost, activeCategory, activeTab]);

  // Audio Play toggle
  const toggleMusic = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0.2; // Низкая громкость
      if (isMusicPlaying) {
        audioRef.current.pause();
        setIsMusicPlaying(false);
      } else {
        audioRef.current.play().catch(e => console.log(e));
        setIsMusicPlaying(true);
      }
    }
  };

  const handleTrackEnded = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
  };

  useEffect(() => {
    if (isMusicPlaying && audioRef.current) {
      audioRef.current.volume = 0.2;
      audioRef.current.play().catch(e => console.log(e));
    }
  }, [currentTrackIndex]);

  // Sync state with local storage
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('likes', JSON.stringify(likes));
  }, [likes]);

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('activeSort', activeSort);
  }, [activeSort]);

  useEffect(() => {
    if (activeCategory) {
      localStorage.setItem('activeCategory', activeCategory);
    } else {
      localStorage.removeItem('activeCategory');
    }
  }, [activeCategory]);

  useEffect(() => {
    if (selectedPost) {
      localStorage.setItem('selectedPost', JSON.stringify(selectedPost));
    } else {
      localStorage.removeItem('selectedPost');
    }
  }, [selectedPost]);

  useEffect(() => {
    displayCounts.current[activeTab] = displayCount;
    localStorage.setItem('displayCounts', JSON.stringify(displayCounts.current));
  }, [displayCount, activeTab]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);

    const tryUpdateStatusBar = () => {
      if (window.StatusBar) {
        window.StatusBar.overlaysWebView(false);
        if (theme === 'light') {
          window.StatusBar.backgroundColorByHexString('#2b587a');
        } else if (theme === 'dark') {
          window.StatusBar.backgroundColorByHexString('#15181f');
        } else if (theme === 'oled') {
          window.StatusBar.backgroundColorByHexString('#000000');
        }
        window.StatusBar.styleLightContent();
        return true;
      }
      return false;
    };

    if (!tryUpdateStatusBar()) {
      const interval = setInterval(() => {
        if (tryUpdateStatusBar()) {
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('ratingFilter', ratingFilter.toString());
  }, [ratingFilter]);

  useEffect(() => {
    localStorage.setItem('hideMissingImages', JSON.stringify(hideMissingImages));
  }, [hideMissingImages]);

  useEffect(() => {
    localStorage.setItem('paginationEnabled', JSON.stringify(paginationEnabled));
  }, [paginationEnabled]);

  useEffect(() => {
    localStorage.setItem('pageSize', pageSize.toString());
  }, [pageSize]);

  useEffect(() => {
    localStorage.setItem('folders', JSON.stringify(folders));
  }, [folders]);

  // Load database
  useEffect(() => {
    fetch('data.json')
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts || []);
        setComments(data.comments || {});
        
        // Restore displayCount from localStorage
        const savedDisplayCount = displayCounts.current[activeTab] || 10;
        setDisplayCount(savedDisplayCount);
        
        setLoading(false);
        
        // Restore scroll position
        setTimeout(() => {
          if (!selectedPost) {
            window.scrollTo(0, scrollPositions.current[activeTab] || 0);
          }
        }, 150); // slightly longer timeout to ensure posts are rendered
      })
      .catch((err) => {
        console.error('Error loading data.json:', err);
        setLoading(false);
      });
  }, []);

  // Smart hiding header & Infinite scroll / Progress bar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // 1. Collapsible header logic
      if (currentScrollY > 60) {
        if (currentScrollY > lastScrollY.current) {
          setHeaderVisible(false); // scrolling down
        } else {
          setHeaderVisible(true); // scrolling up
        }
      } else {
        setHeaderVisible(true);
      }
      lastScrollY.current = currentScrollY;

      // Persist scroll position and button state
      scrollPositions.current[activeTab] = currentScrollY;
      setShowScrollTopBtn(currentScrollY > 1000);
      
      if (!window.scrollSaveTimer) {
        window.scrollSaveTimer = setTimeout(() => {
          localStorage.setItem('scrollPositions', JSON.stringify(scrollPositions.current));
          window.scrollSaveTimer = null;
        }, 500);
      }

      // 2. Scroll Progress Bar
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }

      // 3. Load more when nearing bottom (if pagination is disabled)
      if (!paginationEnabled) {
        if (
          activeTab === 'feed' ||
          activeTab === 'favorites' ||
          activeTab === 'history'
        ) {
          if (
            window.innerHeight + window.scrollY >=
            document.documentElement.scrollHeight - 150
          ) {
            setDisplayCount((prev) => prev + 10);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab, paginationEnabled]);

  // Save scroll position and display counts when leaving feed or tabs
  const handleTabChange = (newTab) => {
    scrollPositions.current[activeTab] = window.scrollY;
    displayCounts.current[activeTab] = displayCount;
    
    // Close detail view on tab change
    setSelectedPost(null);
    
    setActiveTab(newTab);
    
    // Restore display count or default
    const savedDisplayCount = displayCounts.current[newTab] || 10;
    setDisplayCount(savedDisplayCount);
    setCurrentPage(1); // Reset page on tab switch
    
    // Restore scroll position
    setTimeout(() => {
      window.scrollTo(0, scrollPositions.current[newTab] || 0);
    }, 50);
  };

  // Add post to history
  const addToHistory = (postId) => {
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.id !== postId);
      return [{ id: postId, ts: Date.now() }, ...filtered].slice(0, 50); // limit to 50
    });
  };

  // Add/remove favorite
  const toggleFavorite = (postId) => {
    setFavorites((prev) => {
      if (prev.includes(postId)) {
        // Also remove from all folders
        setFolders(fPrev => fPrev.map(f => ({
          ...f,
          postIds: f.postIds.filter(id => id !== postId)
        })));
        return prev.filter((id) => id !== postId);
      } else {
        // Just add to favorites
        return [...prev, postId];
      }
    });
  };

  // Custom folder operations
  const createFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder = {
      id: Date.now().toString(),
      name: newFolderName.trim(),
      postIds: []
    };
    setFolders(prev => [...prev, newFolder]);
    setNewFolderName('');
    setShowFolderModal(false);
  };

  const deleteFolder = (folderId, e) => {
    if (e) e.stopPropagation();
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;
    if (window.confirm(`Вы уверены, что хотите удалить папку "${folder.name}"? Комиксы останутся в Избранном.`)) {
      setFolders(prev => prev.filter(f => f.id !== folderId));
      if (activeFolderId === folderId) {
        setActiveFolderId('all');
      }
    }
  };

  const addPostToFolder = (postId, folderId) => {
    setFolders(prev => prev.map(f => {
      if (f.id === folderId) {
        const filtered = f.postIds.filter(id => id !== postId);
        return { ...f, postIds: [...filtered, postId] };
      }
      return f;
    }));
    
    // Ensure it is in general favorites too
    setFavorites(prev => {
      if (!prev.includes(postId)) return [...prev, postId];
      return prev;
    });
    setSaveToFolderPost(null);
  };

  // Handle rating likes/dislikes
  const handleRate = (postId, rateType) => {
    setLikes((prev) => {
      const currentRate = prev[postId] || 0;
      let nextRate = 0;
      if (rateType === 'like') {
        nextRate = currentRate === 1 ? 0 : 1;
      } else {
        nextRate = currentRate === -1 ? 0 : -1;
      }
      return { ...prev, [postId]: nextRate };
    });
  };

  // Filter and sort posts
  const getFilteredPosts = () => {
    let result = [];
    if (activeTab === 'feed') {
      result = [...posts];
    } else if (activeTab === 'favorites') {
      if (activeFolderId === 'all') {
        result = posts.filter((p) => favorites.includes(p.id));
      } else {
        const currentFolder = folders.find(f => f.id === activeFolderId);
        const folderIds = currentFolder ? currentFolder.postIds : [];
        result = posts.filter((p) => folderIds.includes(p.id));
      }
    } else if (activeTab === 'history') {
      result = history
        .map((item) => {
          const post = posts.find((p) => p.id === item.id);
          if (post) return { ...post, viewedAt: item.ts };
          return null;
        })
        .filter(Boolean);
    }

    // Category filter (only applicable to feed)
    if (activeTab === 'feed' && activeCategory) {
      result = result.filter(
        (p) => p.category.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    // Search filter
    if (searchKeyword && activeTab !== 'history') {
      const queryWords = searchKeyword.toLowerCase().split(/\s+/).filter(Boolean);
      result = result.filter((p) => {
        // Get post comments text
        const postComments = comments[p.id] || [];
        const commentsText = postComments.map(c => (c.text || '') + ' ' + (c.name || '')).join(' ').toLowerCase();
        
        const title = (p.title || '').toLowerCase();
        const category = (p.category || '').toLowerCase();
        const author = (p.author || '').toLowerCase();
        const idStr = String(p.id);

        return queryWords.every(word => {
          if (title.includes(word) || category.includes(word) || author.includes(word) || commentsText.includes(word) || idStr === word) {
            return true;
          }
          
          // Fuzzy/partial match for merged words like "полулава" mapping to "пол" or "лава" in title:
          const titleWords = title.split(/[^a-zA-Z0-9а-яА-ЯёЁ]+/).filter(w => w.length >= 3);
          if (titleWords.some(tw => word.includes(tw) || tw.includes(word))) {
            return true;
          }
          
          return false;
        });
      });
    }

    // Rating filter slider
    if (activeTab === 'feed') {
      result = result.filter((p) => (p.rating || 0) >= ratingFilter);
    }

    // Hide missing images filter
    if (hideMissingImages) {
      result = result.filter((p) => p.filename && p.filename.endsWith('.webp'));
    }

    // Sort (only if we're not inside history tab)
    if (activeTab !== 'history') {
      if (activeSort === 'best') {
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else {
        result.sort((a, b) => b.id - a.id);
      }
    }

    return result;
  };

  const filteredPosts = getFilteredPosts();

  // Pagination calculations
  const totalPages = Math.ceil(filteredPosts.length / pageSize);
  const visiblePosts = paginationEnabled 
    ? filteredPosts.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filteredPosts.slice(0, displayCount);

  // Group categories
  const getCategories = () => {
    const cats = {};
    posts.forEach((p) => {
      if (p.category) {
        cats[p.category] = (cats[p.category] || 0) + 1;
      }
    });
    return Object.entries(cats).sort((a, b) => b[1] - a[1]);
  };

  const categories = getCategories();

  // Load a random post
  const triggerRandom = () => {
    if (posts.length === 0) return;
    const randomIndex = Math.floor(Math.random() * posts.length);
    const post = posts[randomIndex];
    setSelectedPost(post);
    addToHistory(post.id);
    setHeaderVisible(true);
    window.scrollTo(0, 0);
  };

  // Clear data cache options
  const clearCache = (type) => {
    if (type === 'history') {
      setHistory([]);
    } else if (type === 'favorites') {
      setFavorites([]);
      setFolders([]);
      setActiveFolderId('all');
    } else if (type === 'likes') {
      setLikes({});
    }
  };

  return (
    <div className={`app-container font-${fontSize}`}>
      <audio ref={audioRef} src={playlist[currentTrackIndex]} onEnded={handleTrackEnded} />
      <Toast message="Нажмите еще раз для выхода" show={showExitToast} onHide={() => setShowExitToast(false)} />

      {/* Scroll Progress Bar */}
      {(activeTab === 'feed' || activeTab === 'favorites') && (
        <div className="progress-bar-container" style={{ top: headerVisible ? '48px' : '0' }}>
          <div className="progress-bar" style={{ width: `${scrollProgress}%` }} />
        </div>
      )}

      {/* Header */}
      <header className={`header ${headerVisible ? '' : 'hidden'}`}>
        {selectedPost ? (
          <div
            className="logo"
            onClick={() => {
              setSelectedPost(null);
              setTimeout(() => {
                window.scrollTo(0, scrollPositions.current[activeTab] || 0);
              }, 50);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          >
            <span>← Назад</span>
          </div>
        ) : (
          <div
            className="logo"
            onClick={() => {
              setActiveCategory(null);
              handleTabChange('feed');
            }}
          >
            {activeCategory && activeTab === 'feed'
              ? activeCategory
              : activeTab === 'feed'
              ? 'Comicsbook.ru'
              : activeTab === 'categories'
              ? 'Категории'
              : activeTab === 'favorites'
              ? 'Избранное'
              : activeTab === 'history'
              ? 'История просмотров'
              : 'Настройки'}
          </div>
        )}
        <div className="header-actions">
          <button
            className={`header-btn ${isMusicPlaying ? 'active-pulse' : ''}`}
            onClick={toggleMusic}
            style={{ color: isMusicPlaying ? '#4facfe' : 'inherit' }}
          >
            <Icons.Music />
          </button>
          {!selectedPost && (activeTab === 'feed' || activeTab === 'favorites') && (
            <button
              className="header-btn"
              onClick={() => {
                setShowSearch(!showSearch);
                if (showSearch) setSearchKeyword('');
              }}
            >
              <Icons.Search />
            </button>
          )}
          <button className="header-btn" onClick={triggerRandom}>
            <Icons.Random />
          </button>
        </div>
      </header>

      {/* Main content wrapper */}
      <div className="wrapper" style={{ marginTop: headerVisible ? '0' : '-48px', transition: 'margin-top 0.3s ease' }}>
        {/* Collapsible Search */}
        <div className={`search-box ${showSearch ? 'visible' : ''}`}>
          <input
            type="text"
            placeholder="Поиск по названию или теме..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="loader-container">
            <div className="spinner" />
            <p>Загрузка комиксов...</p>
          </div>
        ) : selectedPost ? (
          <div className="post-detail-view">
            <div className="item" style={{ border: 'none', padding: '12px 0', boxShadow: 'none' }}>
              <header style={{ padding: '0 12px' }}>
                <div className="ava">
                  <img src={getCatGif(selectedPost.category)} alt="" />
                </div>
                <div className="text">
                  <h2>{selectedPost.category}</h2>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>{selectedPost.title || 'Без названия'}</h3>
                  <div className="meta-info">
                    Добавил: {selectedPost.author || 'Аноним'} •{' '}
                    {selectedPost.date_str || 'Архив'}
                  </div>
                </div>
              </header>

              <section style={{ margin: '12px 0' }}>
                <img 
                  src={`upload/${selectedPost.filename}`} 
                  onError={(e) => handleImageError(e, selectedPost)} 
                  alt="" 
                  style={{ width: '100%' }} 
                />
              </section>

              <footer style={{ borderTop: 'none', paddingTop: 0, padding: '0 12px' }}>
                <div className="footer-btn-group">
                  <div
                    className={`footer-btn ${favorites.includes(selectedPost.id) ? 'active-saved' : ''}`}
                    onClick={() => {
                      if (folders.length > 0) {
                        setSaveToFolderPost(selectedPost);
                      } else {
                        toggleFavorite(selectedPost.id);
                      }
                    }}
                    style={{ fontSize: '14px' }}
                  >
                    {favorites.includes(selectedPost.id) ? <Icons.StarFilled /> : <Icons.StarOutline />}
                    <span style={{ marginLeft: '4px' }}>
                      {favorites.includes(selectedPost.id) ? 'В избранном' : 'Сохранить'}
                    </span>
                  </div>
                </div>
                <div className="rate-controls">
                  <span
                    className={`rate-btn ${likes[selectedPost.id] === -1 ? 'disliked' : ''}`}
                    onClick={() => handleRate(selectedPost.id, 'dislike')}
                  >
                    <Icons.Dislike />
                  </span>
                  <p style={{ fontSize: '16px' }}>{(selectedPost.rating || 0) + (likes[selectedPost.id] || 0)}</p>
                  <span
                    className={`rate-btn ${likes[selectedPost.id] === 1 ? 'liked' : ''}`}
                    onClick={() => handleRate(selectedPost.id, 'like')}
                  >
                    <Icons.Like />
                  </span>
                </div>
              </footer>

              {/* Comments inside post details */}
              <div className="comments-section" style={{ display: 'block', marginTop: '20px', padding: '12px' }}>
                <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  Комментарии ({(comments[selectedPost.id] || []).length})
                </h3>
                {(comments[selectedPost.id] || []).length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', margin: 0, padding: '10px 0', textAlign: 'center' }}>
                    Комментариев нет.
                  </p>
                ) : (
                  (comments[selectedPost.id] || []).map((c, idx) => (
                    <div key={idx} className="comment-item" style={{ padding: '8px 0' }}>
                      <img className="comment-avatar" src={c.avatar} alt="" style={{ width: '36px', height: '36px' }} />
                      <div className="comment-body">
                        <div className="comment-author" style={{ fontSize: '14px' }}>{c.name}</div>
                        <div className="comment-text" style={{ fontSize: '13px', marginTop: '2px', lineHeight: '1.4' }}>{c.text}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Feed / Bookmarks / History Pages */}
            {(activeTab === 'feed' ||
              activeTab === 'favorites' ||
              activeTab === 'history') && (
              <div>
                {/* Categories Badge on Feed & Sort Bar */}
                {activeTab === 'feed' && (
                  <div className="sub-bar">
                    {activeCategory && (
                      <div className="category-filter-badge" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--badge-bg)', borderRadius: '20px', fontSize: '13px', border: '1px solid var(--border-color)', color: 'var(--badge-text)', fontWeight: 'bold' }}>
                        <span>📁 Категория: {activeCategory}</span>
                        <span onClick={() => setActiveCategory(null)} style={{ cursor: 'pointer', marginLeft: '10px', fontSize: '15px' }}>✕</span>
                      </div>
                    )}
                    <div className="sort-bar">
                      <button
                        className={`sort-btn ${activeSort === 'best' ? 'active' : ''}`}
                        onClick={() => setActiveSort('best')}
                      >
                        🔥 Лучшие
                      </button>
                      <button
                        className={`sort-btn ${activeSort === 'new' ? 'active' : ''}`}
                        onClick={() => setActiveSort('new')}
                      >
                        ⏳ Свежие
                      </button>
                    </div>
                  </div>
                )}

                {/* Custom folders bar inside Favorites */}
                {activeTab === 'favorites' && (
                  <div className="folders-bar" style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '15px' }}>Папки избранного</span>
                      <button onClick={() => setShowFolderModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--badge-bg)', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '16px', fontSize: '12px', cursor: 'pointer', color: 'var(--text-color)' }}>
                        <Icons.FolderAdd /> Создать
                      </button>
                    </div>
                    <div className="folders-list" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                      <div 
                        className={`folder-tab ${activeFolderId === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveFolderId('all')}
                        style={{ padding: '6px 12px', background: activeFolderId === 'all' ? 'var(--tab-active)' : 'var(--card-bg)', color: activeFolderId === 'all' ? 'white' : 'var(--text-color)', border: '1px solid var(--border-color)', borderRadius: '16px', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        Все ({favorites.length})
                      </div>
                      {folders.map(f => (
                        <div 
                          key={f.id}
                          className={`folder-tab ${activeFolderId === f.id ? 'active' : ''}`}
                          onClick={() => setActiveFolderId(f.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: activeFolderId === f.id ? 'var(--tab-active)' : 'var(--card-bg)', color: activeFolderId === f.id ? 'white' : 'var(--text-color)', border: '1px solid var(--border-color)', borderRadius: '16px', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                          <span>{f.name} ({f.postIds.length})</span>
                        </div>
                      ))}
                    </div>
                    {activeFolderId !== 'all' && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                        <button 
                          onClick={(e) => deleteFolder(activeFolderId, e)}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', color: '#ff3347', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold', padding: '4px 0' }}
                        >
                          <Icons.Trash /> Удалить папку «{folders.find(f => f.id === activeFolderId)?.name}»
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Pagination top controls */}
                {paginationEnabled && filteredPosts.length > 0 && (
                  <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '12px', fontSize: '14px' }}>
                    <button 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      style={{ background: 'transparent', border: 'none', color: currentPage === 1 ? 'var(--text-secondary)' : 'var(--tab-active)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <Icons.ArrowLeft /> Назад
                    </button>
                    <span style={{ fontWeight: '600' }}>Страница {currentPage} из {totalPages || 1}</span>
                    <button 
                      disabled={currentPage === totalPages || totalPages === 0}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      style={{ background: 'transparent', border: 'none', color: currentPage === totalPages ? 'var(--text-secondary)' : 'var(--tab-active)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      Вперед <Icons.ArrowRight />
                    </button>
                  </div>
                )}

                {/* Empty Placeholders */}
                {filteredPosts.length === 0 && (
                  <div className="empty-placeholder">
                    <div className="icon">📂</div>
                    <p>Комиксы не найдены</p>
                  </div>
                )}

                {/* Posts Cards / Compact List */}
                {visiblePosts.map((post) => {
                  const commentsCount = (comments[post.id] || []).length;
                  const isFavorite = favorites.includes(post.id);
                  const postLikeState = likes[post.id] || 0;
                  const currentRating = (post.rating || 0) + postLikeState;

                  if (viewMode === 'compact') {
                    return (
                      <div
                        key={post.id}
                        className="item-compact"
                        onClick={() => {
                          setSelectedPost(post);
                          addToHistory(post.id);
                        }}
                      >
                        <div className="thumb">
                          <img 
                            src={`upload/${post.filename}`} 
                            onError={(e) => handleImageError(e, post)} 
                            alt="" 
                            loading="lazy" 
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
                      key={post.id}
                      className="item"
                      onClick={() => addToHistory(post.id)}
                    >
                      <header>
                        <div className="ava">
                          <img src={getCatGif(post.category)} alt="" />
                        </div>
                        <div className="text" onClick={() => { setSelectedPost(post); addToHistory(post.id); }} style={{ cursor: 'pointer' }}>
                          <h2>{post.category}</h2>
                          <h3>{post.title || 'Без названия'}</h3>
                          <div className="meta-info">
                            Добавил: {post.author || 'Аноним'} •{' '}
                            {post.date_str || 'Архив'}
                          </div>
                        </div>
                      </header>

                      <section
                        onClick={() => {
                          setSelectedPost(post);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <img 
                          src={`upload/${post.filename}`} 
                          onError={(e) => handleImageError(e, post)} 
                          alt="" 
                          loading="lazy" 
                        />
                      </section>

                      <footer>
                        <div className="footer-btn-group">
                          <div
                            className="footer-btn"
                            onClick={() => setSelectedPost(post)}
                          >
                            <Icons.Comments />
                            <span style={{ marginLeft: '4px' }}>Комментарии ({commentsCount})</span>
                          </div>
                          <div
                            className={`footer-btn ${isFavorite ? 'active-saved' : ''}`}
                            onClick={() => {
                              if (folders.length > 0) {
                                setSaveToFolderPost(post);
                              } else {
                                toggleFavorite(post.id);
                              }
                            }}
                          >
                            {isFavorite ? <Icons.StarFilled /> : <Icons.StarOutline />}
                            <span style={{ marginLeft: '4px' }}>{isFavorite ? 'В избранном' : 'Сохранить'}</span>
                          </div>
                        </div>

                        <div className="rate-controls">
                          <span
                            className={`rate-btn ${postLikeState === -1 ? 'disliked' : ''}`}
                            onClick={() => handleRate(post.id, 'dislike')}
                          >
                            <Icons.Dislike />
                          </span>
                          <p
                            className={
                              currentRating > 0
                                ? 'positive'
                                : currentRating < 0
                                ? 'negative'
                                : ''
                            }
                          >
                            {currentRating}
                          </p>
                          <span
                            className={`rate-btn ${postLikeState === 1 ? 'liked' : ''}`}
                            onClick={() => handleRate(post.id, 'like')}
                          >
                            <Icons.Like />
                          </span>
                        </div>
                      </footer>
                    </div>
                  );
                })}

                {/* Pagination bottom controls */}
                {paginationEnabled && filteredPosts.length > 0 && (
                  <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', marginTop: '12px', marginBottom: '20px', fontSize: '14px' }}>
                    <button 
                      disabled={currentPage === 1}
                      onClick={() => {
                        setCurrentPage(p => Math.max(1, p - 1));
                        window.scrollTo(0, 0);
                      }}
                      style={{ background: 'transparent', border: 'none', color: currentPage === 1 ? 'var(--text-secondary)' : 'var(--tab-active)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <Icons.ArrowLeft /> Назад
                    </button>
                    <span style={{ fontWeight: '600' }}>Страница {currentPage} из {totalPages || 1}</span>
                    <button 
                      disabled={currentPage === totalPages || totalPages === 0}
                      onClick={() => {
                        setCurrentPage(p => Math.min(totalPages, p + 1));
                        window.scrollTo(0, 0);
                      }}
                      style={{ background: 'transparent', border: 'none', color: currentPage === totalPages ? 'var(--text-secondary)' : 'var(--tab-active)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      Вперед <Icons.ArrowRight />
                    </button>
                  </div>
                )}

                {/* Show more fallback (only when pagination is disabled) */}
                {!paginationEnabled && displayCount < filteredPosts.length && (
                  <div style={{ textAlign: 'center', padding: '10px 0' }}>
                    <button
                      className="sort-btn"
                      style={{
                        padding: '10px 20px',
                        background: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '20px',
                        color: 'var(--text-color)',
                      }}
                      onClick={() => setDisplayCount((prev) => prev + 10)}
                    >
                      Показать еще
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Categories Page */}
            {activeTab === 'categories' && (
              <div className="categories-grid">
                {categories.map(([name, count]) => (
                  <div
                    key={name}
                    className="category-card"
                    onClick={() => {
                      setActiveCategory(name);
                      handleTabChange('feed');
                    }}
                  >
                    <div className="category-card-name">{name}</div>
                    <div className="category-card-count">{count} постов</div>
                  </div>
                ))}
              </div>
            )}

            {/* Settings Page */}
            {activeTab === 'settings' && (
              <div style={{ paddingBottom: '30px' }}>
                <div className="settings-section-title">Оформление</div>
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
                    <select
                      value={fontSize}
                      onChange={(e) => setFontSize(e.target.value)}
                    >
                      <option value="small">Мелкий</option>
                      <option value="medium">Средний</option>
                      <option value="large">Крупный</option>
                    </select>
                  </div>
                  <div className="setting-row">
                    <span>Вид ленты</span>
                    <select
                      value={viewMode}
                      onChange={(e) => setViewMode(e.target.value)}
                    >
                      <option value="cards">Карточки (Полный)</option>
                      <option value="compact">Компактный (Список)</option>
                    </select>
                  </div>
                  <div className="setting-row">
                    <span>Скрывать посты без картинок</span>
                    <input
                      type="checkbox"
                      checked={hideMissingImages}
                      onChange={(e) => setHideMissingImages(e.target.checked)}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                  </div>
                </div>

                <div className="settings-section-title">Режим просмотра</div>
                <div className="settings-section">
                  <div className="setting-row">
                    <span>Постраничная навигация (вместо бесконечной)</span>
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
                          // Match closest step
                          const closest = steps.reduce((prev, curr) => Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev);
                          setPageSize(closest);
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="settings-section-title">Фильтрация</div>
                <div className="settings-section">
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
                    />
                  </div>
                </div>

                <div className="settings-section-title">Локальные данные</div>
                <div className="settings-section">
                  <div
                    className="setting-row"
                    style={{ cursor: 'pointer', color: '#ff3347' }}
                    onClick={() => clearCache('history')}
                  >
                    <span>Очистить историю просмотров</span>
                    <Icons.Trash />
                  </div>
                  <div
                    className="setting-row"
                    style={{ cursor: 'pointer', color: '#ff3347' }}
                    onClick={() => clearCache('favorites')}
                  >
                    <span>Очистить избранное</span>
                    <Icons.Trash />
                  </div>
                  <div
                    className="setting-row"
                    style={{ cursor: 'pointer', color: '#ff3347' }}
                    onClick={() => clearCache('likes')}
                  >
                    <span>Сбросить оценки</span>
                    <Icons.Trash />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Navigation (Always visible for easy tab switching!) */}
      <div className="bottom-nav">
        <div
          className={`nav-tab ${activeTab === 'feed' && !selectedPost ? 'active' : ''}`}
          onClick={() => handleTabChange('feed')}
        >
          <Icons.Feed />
          <span className="label">Лента</span>
        </div>
        <div
          className={`nav-tab ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => handleTabChange('categories')}
        >
          <Icons.Categories />
          <span className="label">Категории</span>
        </div>
        <div
          className={`nav-tab ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => handleTabChange('favorites')}
        >
          <Icons.Favorites />
          <span className="label">Избранное</span>
        </div>
        <div
          className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => handleTabChange('history')}
        >
          <Icons.History />
          <span className="label">История</span>
        </div>
        <div
          className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => handleTabChange('settings')}
        >
          <Icons.Settings />
          <span className="label">Настройки</span>
        </div>
      </div>
      {/* Scroll to Top Button */}
      {showScrollTopBtn && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="scroll-top-btn"
          style={{ position: 'fixed', bottom: '80px', right: '16px', zIndex: 1000, width: '48px', height: '48px', borderRadius: '50%', background: 'var(--tab-active)', color: 'white', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}
        >
          <Icons.ArrowUp />
        </button>
      )}

      {/* MODAL 1: Create custom folder */}
      {showFolderModal && (
        <div className="modal-overlay" onClick={() => setShowFolderModal(false)} style={{ zIndex: 3000 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '20px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '17px' }}>Создать новую папку</h3>
            <input 
              type="text" 
              placeholder="Название папки..." 
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: '8px', boxSizing: 'border-box', background: 'var(--card-bg)', color: 'var(--text-color)', outline: 'none', marginBottom: '20px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowFolderModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 'bold' }}>Отмена</button>
              <button onClick={createFolder} style={{ background: 'var(--tab-active)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '18px', fontWeight: 'bold', cursor: 'pointer' }}>Создать</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Add post to folder selection */}
      {saveToFolderPost && (
        <div className="modal-overlay" onClick={() => setSaveToFolderPost(null)} style={{ zIndex: 3000 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '20px', maxWidth: '400px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '17px' }}>Добавить в избранное</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div 
                onClick={() => {
                  toggleFavorite(saveToFolderPost.id);
                  setSaveToFolderPost(null);
                }}
                style={{ padding: '12px', background: 'var(--badge-bg)', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ fontWeight: '600' }}>Все избранное (без папки)</span>
                {favorites.includes(saveToFolderPost.id) && <Icons.StarFilled style={{ color: '#f7a823' }} />}
              </div>
              
              {folders.map(f => {
                const inFolder = f.postIds.includes(saveToFolderPost.id);
                return (
                  <div 
                    key={f.id}
                    onClick={() => addPostToFolder(saveToFolderPost.id, f.id)}
                    style={{ padding: '12px', background: 'var(--badge-bg)', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <span>Папка: {f.name}</span>
                    {inFolder && <Icons.StarFilled style={{ color: '#f7a823' }} />}
                  </div>
                );
              })}
              
              {favorites.includes(saveToFolderPost.id) && (
                <button 
                  onClick={() => {
                    toggleFavorite(saveToFolderPost.id);
                    setSaveToFolderPost(null);
                  }}
                  style={{ marginTop: '10px', background: '#ff3347', color: 'white', border: 'none', padding: '10px', borderRadius: '18px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Удалить из избранного
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
