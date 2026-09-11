import React, { useState, useEffect, useRef, useCallback } from 'react';
import Toast from './components/Toast';

import { Icons, getCatGif, getPostImageUrl, handleImageError, brokenImageIds } from './utils/helpers';
import VirtualFeed from './components/VirtualFeed';
import SkeletonLoading from './components/SkeletonLoading';
import BottomNav from './components/BottomNav';

export default function App() {
  // DB state
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState(null);
  const [, setForceUpdate] = useState(0);

  useEffect(() => {
    const handler = () => setForceUpdate(n => n + 1);
    window.addEventListener('brokenImagesUpdated', handler);
    return () => window.removeEventListener('brokenImagesUpdated', handler);
  }, []);

  // App UI state
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef(null);
  const playlist = ['/audio/track1.m4a', '/audio/track2.m4a', '/audio/track3.m4a', '/audio/track4.m4a', '/audio/track5.m4a'];
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [showExitToast, setShowExitToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToastObj, setShowToastObj] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setShowToastObj(true);
    setTimeout(() => setShowToastObj(false), 3000);
  };

  const backPressTime = useRef(0);
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('activeTab') || 'feed');
  const [activeSort, setActiveSort] = useState(() => localStorage.getItem('activeSort') || 'best');
  const [activeCategory, setActiveCategory] = useState(() => {
    let saved = localStorage.getItem('activeCategory');
    if (saved === 'VK Archive') {
      localStorage.setItem('activeCategory', 'ВКонтакте');
      saved = 'ВКонтакте';
    }
    if (saved && saved.length > 50) {
      localStorage.removeItem('activeCategory');
      return null;
    }
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

  const [contextMenuPost, setContextMenuPost] = useState(null);
  const [fullscreenPost, setFullscreenPost] = useState(null);
  const [hiddenPosts, setHiddenPosts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('hiddenPosts') || '[]');
    } catch (e) {
      return [];
    }
  });
  const [randomPost, setRandomPost] = useState(null);

  useEffect(() => {
    localStorage.setItem('hiddenPosts', JSON.stringify(hiddenPosts));
  }, [hiddenPosts]);

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

  const dialogRef = useRef(null);

  useEffect(() => {
    if (contextMenuPost && dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    } else if (!contextMenuPost && dialogRef.current && dialogRef.current.open) {
      dialogRef.current.close();
    }
  }, [contextMenuPost]);

  // Lock body scroll when overlay is active
  useEffect(() => {
    if (contextMenuPost || fullscreenPost || showFolderModal || saveToFolderPost) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [contextMenuPost, fullscreenPost, showFolderModal, saveToFolderPost]);

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
      audioRef.current.volume = 0.8; // Громкость 80%
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

  const handleTrackError = (e) => {
    console.log('Audio error:', e);
    // Move to next track on error to avoid getting stuck
    handleTrackEnded();
  };

  // App lifecycle listener
  useEffect(() => {
    const onPause = () => {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        setIsMusicPlaying(false);
      }
    };
    document.addEventListener("pause", onPause, false);
    return () => {
      document.removeEventListener("pause", onPause, false);
    };
  }, []);

  // Sync state with local storage
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Global Context Menu Prevention for WebView freezes
  useEffect(() => {
    const preventContextMenu = (e) => {
      // Allow context menu ONLY on inputs and textareas (e.g., for copy/paste)
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
      }
    };
    document.addEventListener('contextmenu', preventContextMenu, { capture: true, passive: false });
    return () => {
      document.removeEventListener('contextmenu', preventContextMenu, { capture: true });
    };
  }, []);

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
        setDataError(err.toString());
        setLoading(false);
      });
  }, []);

  // Cleanup corrupted or invalid category from local storage
  useEffect(() => {
    if (posts.length > 0 && activeCategory) {
      const validCategories = new Set(posts.map(p => p.category).filter(Boolean));
      if (!validCategories.has(activeCategory)) {
        setActiveCategory(null);
        localStorage.removeItem('activeCategory');
      }
    }
  }, [posts, activeCategory]);

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
    
    // Auto-select a random post if opening the random tab and none is selected yet
    if (newTab === 'random' && !randomPost) {
      if (posts.length > 0) {
        const randIndex = Math.floor(Math.random() * posts.length);
        setRandomPost(posts[randIndex]);
      }
    }
    
    // Restore display count or default
    const savedDisplayCount = displayCounts.current[newTab] || 10;
    setDisplayCount(savedDisplayCount);
    setCurrentPage(1); // Reset page on tab switch
    
    // Restore scroll position
    setTimeout(() => {
      window.scrollTo(0, scrollPositions.current[newTab] || 0);
    }, 50);
  };

  const selectNewRandomPost = () => {
    if (posts.length === 0) return;
    const randIndex = Math.floor(Math.random() * posts.length);
    setRandomPost(posts[randIndex]);
    window.scrollTo(0, 0);
  };

  // Add post to history
  const addToHistory = (postId) => {
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.id !== postId);
      return [{ id: postId, ts: Date.now() }, ...filtered].slice(0, 50); // limit to 50
    });
  };

  const copyImageToClipboard = async (post) => {
    if (!post) return;
    try {
      // Synchronously instantiate ClipboardItem with Promise value to preserve user gesture token
      const pngPromise = (async () => {
        const response = await fetch(getPostImageUrl(post));
        const blob = await response.blob();
        
        if (blob.type === 'image/webp') {
          const img = new Image();
          img.src = getPostImageUrl(post);
          await new Promise((resolve) => { img.onload = resolve; });
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const pngBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
          return pngBlob;
        }
        return blob;
      })();

      const item = new ClipboardItem({ 'image/png': pngPromise });
      await navigator.clipboard.write([item]);
      showToast("Картинка скопирована!");
    } catch (err) {
      try {
        copyPostLink(post);
        showToast("Копирование картинок не поддерживается. Ссылка скопирована!");
      } catch (e) {
        showToast("Ошибка буфера обмена.");
      }
    }
  };

  const saveImageToGallery = async (post) => {
    if (!post) return;
    const doSave = async () => {
      try {
        showToast("Сохранение...");
        const response = await fetch(getPostImageUrl(post));
        const blob = await response.blob();
        
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result;
          const base64Clean = base64Data.split(',')[1];
          
          window.cordova.base64ToGallery(
            base64Clean,
            { prefix: 'comics_', mediaScanner: true },
            (_path) => showToast("Сохранено в галерею!"),
            (err) => showToast("Ошибка сохранения: " + err)
          );
        };
        reader.readAsDataURL(blob);
      } catch (_err) {
        showToast("Ошибка при скачивании файла.");
      }
    };

    if (window.cordova && window.cordova.plugins) {
      // Get Android version from User Agent
      const ua = navigator.userAgent;
      const match = ua.match(/Android\s+([0-9]+)/i);
      const androidVersion = match ? parseInt(match[1], 10) : null;

      if (androidVersion !== null && androidVersion >= 10) {
        // API 29+ (Android 10+) does not require WRITE_EXTERNAL_STORAGE or READ_MEDIA_IMAGES for MediaStore insert
        doSave();
        return;
      }

      // Fallback for older Android versions
      const permissionToRequest = "android.permission.WRITE_EXTERNAL_STORAGE";

      try {
        if (window.cordova.plugins.permissions) {
          const permissions = window.cordova.plugins.permissions;
          permissions.checkPermission(permissionToRequest, (status) => {
            if (!status.hasPermission) {
              permissions.requestPermission(permissionToRequest, (reqStatus) => {
                if (reqStatus.hasPermission) {
                  doSave();
                } else {
                  showToast("Разрешение отклонено. Невозможно сохранить.");
                }
              }, (_err) => {
                // Safe fallback: try saving anyway if permission request fails
                doSave();
              });
            } else {
              doSave();
            }
          }, (_err) => {
            // Safe fallback: try saving anyway if permission check fails
            doSave();
          });
        } else if (window.cordova.base64ToGallery) {
          doSave();
        } else {
          doSave();
        }
      } catch (_e) {
        // Safe fallback: try saving anyway if synchronous exception is thrown
        doSave();
      }
    } else {
      // Browser fallback
      try {
        const link = document.createElement('a');
        link.href = getPostImageUrl(post);
        link.download = post.filename || 'comic.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("Скачивание файла...");
      } catch (_e) {}
    }
  };

  const copyPostLink = (post) => {
    try {
      const link = post.archive_url || `http://comicsbook.ru/post/${post.id}`;
      navigator.clipboard.writeText(link);
      showToast("Ссылка скопирована!");
    } catch (_e) {
      showToast("Не удалось скопировать ссылку.");
    }
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
    if (activeTab === 'feed' || activeTab === 'search') {
      result = posts.filter(p => !hiddenPosts.includes(p.id));
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
    if (activeTab === 'feed') {
      if (activeCategory) {
        result = result.filter(
          (p) => p.category.toLowerCase() === activeCategory.toLowerCase()
        );
      } else {
        result = result.filter(
          (p) => p.category !== 'ВКонтакте'
        );
      }
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
        const filename = (p.filename || '').toLowerCase();
        const idStr = String(p.id);

        return queryWords.every(word => {
          if (title.includes(word) || category.includes(word) || author.includes(word) || commentsText.includes(word) || idStr === word || filename.includes(word)) {
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
      result = result.filter((p) => {
        if (brokenImageIds.has(p.id)) return false;
        if (p.image_url && typeof p.image_url === 'string' && p.image_url.trim() !== '') return true;
        if (p.filename && typeof p.filename === 'string' && p.filename.endsWith('.webp') && p.image_exists) return true;
        return false;
      });
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
      <Toast message="Нажмите еще раз для выхода" show={showExitToast} onHide={() => setShowExitToast(false)} />
      <Toast message={toastMessage} show={showToastObj} onHide={() => setShowToastObj(false)} />

      <audio ref={audioRef} src={playlist[currentTrackIndex]} onEnded={handleTrackEnded} onError={handleTrackError} autoPlay={isMusicPlaying} />

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
              : activeTab === 'search'
              ? 'Поиск мемов'
              : activeTab === 'random'
              ? 'Случайный мем'
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
        </div>
      </header>

      {/* Main content wrapper */}
      <div className="wrapper" style={{ marginTop: headerVisible ? '0' : '-48px', transition: 'margin-top 0.3s ease' }}>

        {dataError ? (
          <div className="loader-container" style={{ color: '#ff3347', padding: '20px' }}>
            <div className="icon" style={{ fontSize: '32px', marginBottom: '10px' }}>⚠️</div>
            <p style={{ fontWeight: 'bold' }}>Ошибка загрузки базы данных (CORS/OOM)</p>
            <p style={{ fontSize: '12px', marginTop: '10px', opacity: 0.8 }}>{dataError}</p>
          </div>
        ) : loading ? (
          <SkeletonLoading />
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
                  src={getPostImageUrl(selectedPost)} 
                  onError={(e) => handleImageError(e, selectedPost)} 
                  alt="" 
                  style={{ width: '100%', cursor: 'pointer' }} 
                  onContextMenu={(e) => { e.preventDefault(); setContextMenuPost(selectedPost); }}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFullscreenPost(selectedPost); }}
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
            {/* Feed / Bookmarks / Search Pages */}
            {(activeTab === 'feed' ||
              activeTab === 'favorites' ||
              activeTab === 'search') && (
              <div>
                {/* Dedicated Search Input Bar on Search tab */}
                {activeTab === 'search' && (
                  <div className="search-tab-bar" style={{ padding: '12px 16px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', marginBottom: '16px' }}>
                    <input
                      type="text"
                      placeholder="Поиск по названию, автору, комментариям..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '24px', boxSizing: 'border-box', background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '15px', outline: 'none' }}
                      autoFocus
                    />
                    {searchKeyword && (
                      <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'right' }}>
                        Найдено мемов: {filteredPosts.length}
                      </div>
                    )}
                  </div>
                )}
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

                {/* Empty Placeholders */}
                {filteredPosts.length === 0 && (
                  <div className="empty-placeholder">
                    <div className="icon">📂</div>
                    <p>Комиксы не найдены</p>
                  </div>
                )}

                {/* Virtual Feed */}
                {filteredPosts.length > 0 && (
                  <VirtualFeed
                    posts={filteredPosts}
                    viewMode={viewMode}
                    comments={comments}
                    favorites={favorites}
                    likes={likes}
                    onSelectPost={setSelectedPost}
                    onAddToHistory={addToHistory}
                    onContextMenu={setContextMenuPost}
                    onSaveFavorite={(post) => {
                      if (folders.length > 0) {
                        setSaveToFolderPost(post);
                      } else {
                        toggleFavorite(post.id);
                      }
                    }}
                    onRate={handleRate}
                  />
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

            {/* Random Meme Page */}
            {activeTab === 'random' && randomPost && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '30px' }}>
                <button
                  onClick={selectNewRandomPost}
                  className="sort-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    background: 'var(--tab-active)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '24px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    alignSelf: 'center',
                    fontSize: '15px'
                  }}
                >
                  🎲 Другой случайный мем
                </button>

                <div className="item" key={randomPost.id}>
                  <header>
                    <div className="ava">
                      <img src={getCatGif(randomPost.category)} alt="" />
                    </div>
                    <div className="text" style={{ flex: 1 }}>
                      <h2>{randomPost.category}</h2>
                      <h3>{randomPost.title || 'Без названия'}</h3>
                      <div className="meta-info">
                        Добавил: {randomPost.author || 'Аноним'} •{' '}
                        {randomPost.date_str || 'Архив'}
                      </div>
                    </div>
                  </header>

                  <section style={{ cursor: 'pointer' }}>
                    <img 
                      src={randomPost.category === 'ВКонтакте' && randomPost.image_url ? randomPost.image_url : `upload/${randomPost.filename}`} 
                      onError={(e) => handleImageError(e, randomPost)} 
                      alt="" 
                      onContextMenu={(e) => { e.preventDefault(); setContextMenuPost(randomPost); }}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFullscreenPost(randomPost); }}
                    />
                  </section>

                  <footer>
                    <div className="footer-btn-group">
                      <div
                        className="footer-btn"
                        onClick={() => setSelectedPost(randomPost)}
                      >
                        <Icons.Comments />
                        <span style={{ marginLeft: '4px' }}>Комментарии ({(comments[randomPost.id] || []).length})</span>
                      </div>
                      <div
                        className={`footer-btn ${favorites.includes(randomPost.id) ? 'active-saved' : ''}`}
                        onClick={() => {
                          if (folders.length > 0) {
                            setSaveToFolderPost(randomPost);
                          } else {
                            toggleFavorite(randomPost.id);
                          }
                        }}
                      >
                        <Icons.Favorites />
                      </div>
                    </div>
                    <div className="rate">
                      <span onClick={() => handleRate(randomPost.id, 'dislike')} style={{ color: (likes[randomPost.id] || 0) === -1 ? 'red' : 'inherit', cursor: 'pointer', padding: '0 5px' }}>–</span>
                      <p style={{ margin: '0 10px', color: (likes[randomPost.id] || 0) !== 0 ? 'var(--tab-active)' : 'inherit', fontWeight: 'bold' }}>
                        {(randomPost.rating || 0) + (likes[randomPost.id] || 0)}
                      </p>
                      <span onClick={() => handleRate(randomPost.id, 'like')} style={{ color: (likes[randomPost.id] || 0) === 1 ? 'green' : 'inherit', cursor: 'pointer', padding: '0 5px' }}>+</span>
                    </div>
                  </footer>
                </div>
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
      <BottomNav activeTab={activeTab} selectedPost={selectedPost} onTabChange={handleTabChange} />
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
      {/* Context Menu Overlay */}
      {contextMenuPost && (
        <dialog 
          ref={dialogRef}
          className="context-menu-dialog"
          onClick={(e) => {
            if (e.target === dialogRef.current) {
               setContextMenuPost(null);
            }
          }}
        >
          <div className="context-menu-container">
            <div className="context-menu-preview">
              <img src={contextMenuPost.category === 'ВКонтакте' && contextMenuPost.image_url ? contextMenuPost.image_url : `upload/${contextMenuPost.filename}`} alt="" />
            </div>
            <div className="context-menu-options">
              <button 
                className="context-option"
                onClick={() => {
                  setFullscreenPost(contextMenuPost);
                  setContextMenuPost(null);
                }}
              >
                <Icons.Fullscreen className="option-icon" /> На весь экран
              </button>
              
              <button 
                className="context-option"
                onClick={() => {
                  copyImageToClipboard(contextMenuPost);
                  setContextMenuPost(null);
                }}
              >
                <Icons.Copy className="option-icon" /> Скопировать
              </button>
              
              <button 
                className="context-option"
                onClick={() => {
                  saveImageToGallery(contextMenuPost);
                  setContextMenuPost(null);
                }}
              >
                <Icons.Download className="option-icon" /> Сохранить в галерею
              </button>

              <button 
                className="context-option"
                onClick={() => {
                  const isFav = favorites.includes(contextMenuPost.id);
                  toggleFavorite(contextMenuPost.id);
                  showToast(isFav ? "Удалено из избранного" : "Добавлено в избранное");
                  setContextMenuPost(null);
                }}
              >
                {favorites.includes(contextMenuPost.id) ? (
                  <Icons.StarFilled className="option-icon" style={{ color: '#f7a823' }} />
                ) : (
                  <Icons.StarOutline className="option-icon" />
                )}
                {favorites.includes(contextMenuPost.id) ? "В избранном" : "В избранное"}
              </button>

              <button 
                className="context-option"
                onClick={() => {
                  setSaveToFolderPost(contextMenuPost);
                  setContextMenuPost(null);
                }}
              >
                <Icons.FolderAdd className="option-icon" /> Добавить в папку...
              </button>

              <button 
                className="context-option"
                onClick={() => {
                  copyPostLink(contextMenuPost);
                  setContextMenuPost(null);
                }}
              >
                <Icons.Share className="option-icon" /> Поделиться ссылкой
              </button>

              <button 
                className="context-option danger"
                onClick={() => {
                  setHiddenPosts(prev => [...prev, contextMenuPost.id]);
                  showToast("Пост скрыт из ленты");
                  setContextMenuPost(null);
                }}
              >
                <Icons.Hide className="option-icon" /> Скрыть этот мем
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/* Fullscreen Viewer Overlay */}
      {fullscreenPost && (
        <div className="fullscreen-overlay" onClick={() => setFullscreenPost(null)}>
          <button className="fullscreen-close" onClick={() => setFullscreenPost(null)}>×</button>
          <img 
            className="fullscreen-img" 
            src={getPostImageUrl(fullscreenPost)} 
            alt="" 
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
}
