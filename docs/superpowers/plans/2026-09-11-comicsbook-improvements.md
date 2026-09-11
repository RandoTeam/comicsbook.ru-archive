# Comicsbook Archive: Refactoring, Hygiene, and Performance Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate code duplication and linter warnings in `App.jsx`, extract modals and audio logic into modular components, purge alien assets and bloated dumps from Git, optimize search and feed performance, and ensure consistent licensing and author attribution for `RandoTeam`.

**Architecture:** Component-driven decomposition of React 19 SPA (`FullscreenViewer`, `FolderModal`, `ContextMenuModal`, `useAudioPlayer`), repository hygiene via git removal of non-project files and enhanced `.gitignore`, and debounced search memoization.

**Tech Stack:** React 19, Vite 8, React Virtuoso, Oxlint, Apache Cordova 15, Python 3.

**Spec:** [README.md](file:///c:/G_3.1/comicsbook/README.md) and [implementation_plan.md](file:///C:/Users/Ilia%20V/.gemini/antigravity/brain/656c782b-9516-457a-9233-36145b7dcb53/implementation_plan.md)

## Global Constraints
- Author attribution for all Git commits MUST strictly be `RandoTeam <vlasov.rus.mos@gmail.com>`.
- Project license is MIT throughout all configuration files and packages.
- Zero placeholders policy: full, working code diffs only; no `// ...` or `TODO` shortcuts.
- No regression in offline functionality or Cordova mobile compatibility.

---

### Task 1: Fix Critical Bugs, Duplications, and Linter Warnings in App.jsx

**Files:**
- Modify: `react_app/src/App.jsx:175-325`
- Modify: `react_app/src/App.jsx:870-895`

**Interfaces:**
- Consumes: Existing state in `App.jsx`.
- Produces: Cleaned event listeners and resolved unused variable warnings.

- [ ] **Step 1: Check baseline Oxlint warnings**

Run:
```bash
cd react_app; npm run lint
```
Expected: 21 warnings (duplicate backbutton listener, dead variables `totalPages`, `visiblePosts`, `triggerRandom`).

- [ ] **Step 2: Remove duplicate backbutton listener and unused variables**

In `react_app/src/App.jsx`:
1. Remove the second duplicate `useEffect` block for `backbutton` (lines 266-315).
2. Remove unused pagination variables `totalPages`, `visiblePosts` (lines 872-874).
3. Connect or clean up `triggerRandom` to resolve dead declaration warning.
4. Clean unused catch/callback error parameters (prefix with `_` or use them).

- [ ] **Step 3: Run Oxlint to verify warnings reduction**

Run:
```bash
cd react_app; npm run lint
```
Expected: 0 errors and significantly reduced warning count.

- [ ] **Step 4: Verify Vite build**

Run:
```bash
cd react_app; npm run build
```
Expected: Build succeeds with 0 errors.

- [ ] **Step 5: Git commit**

Run:
```bash
git add react_app/src/App.jsx
git commit -m "fix(react): eliminate duplicate backbutton listener and remove dead variables"
```

---

### Task 2: Repository Hygiene, Alien File Purge, and .gitignore Enhancement

**Files:**
- Modify: `.gitignore`
- Delete: `assets/brand/chromalab-*` (alien files from ChromaLab)
- Delete: `assets/screenshots/chromalab-*` (alien files from ChromaLab)
- Delete: `logcat.txt`, `logcat_latest.txt`, `comicsbook-release.apk.idsig`
- Delete: `sample_vk_posts.html`, `sample_post.html`, `temp_archive.html`, `pikabu_test*.html`, `post_142.html`
- Delete: `exec_out.txt`, `error_response.txt`, `patch.diff`, `snscrape_vk.json`, `data_extracted_vk.json`, `vk_*.png`

**Interfaces:**
- Consumes: Git index and working tree.
- Produces: Clean, unbloated repository tree with accurate `.gitignore`.

- [ ] **Step 1: Update .gitignore with dump and signature rules**

Add to `.gitignore`:
```gitignore
# Android build signatures & dumps
*.idsig
logcat*.txt
exec_out.txt
error_response.txt
*.diff
*.patch

# HTML scrape dumps
sample_*.html
temp_*.html
pikabu_test*.html
post_*.html

# Scrape screenshots
vk_*.png
```

- [ ] **Step 2: Remove alien files and bloated dumps from Git**

Run:
```bash
git rm -f assets/brand/chromalab-hero.svg assets/brand/chromalab-icon.svg assets/brand/chromalab-logo-lockup.svg assets/brand/chromalab-social-preview.png assets/brand/chromalab-social-preview.svg
git rm -rf assets/screenshots
git rm -f logcat.txt logcat_latest.txt comicsbook-release.apk.idsig
git rm -f sample_vk_posts.html sample_post.html temp_archive.html pikabu_test.html pikabu_test2.html post_142.html
git rm -f exec_out.txt error_response.txt patch.diff vk_after_click.png vk_mobile_screenshot.png vk_screenshot.png
```

- [ ] **Step 3: Verify clean Git status**

Run:
```bash
git status
```
Expected: Only intended deletions staged; no alien ChromaLab files remain.

- [ ] **Step 4: Git commit**

Run:
```bash
git add .gitignore
git commit -m "chore: purge alien ChromaLab assets, large logcat dumps, and update .gitignore"
```

---

### Task 3: Extract FullscreenViewer Component with Zoom & Swipe Gestures

**Files:**
- Create: `react_app/src/components/FullscreenViewer.jsx`
- Modify: `react_app/src/App.jsx`

**Interfaces:**
- Consumes: `post`, `onClose`, `onPrev`, `onNext`, `onShare`, `onSave`, `isLiked`, `onToggleLike`.
- Produces: Isolated interactive modal with pinch-to-zoom, double-tap zoom, and swipe navigation between comics.

- [ ] **Step 1: Create FullscreenViewer.jsx component**

Write `react_app/src/components/FullscreenViewer.jsx` with full touch gestures, zoom scale state (1x - 3x), swipe threshold detection (swipe left -> next, swipe right -> prev), and clean backdrop dismiss.

- [ ] **Step 2: Integrate FullscreenViewer into App.jsx**

Replace inline fullscreen JSX in `App.jsx` with `<FullscreenViewer ... />`.

- [ ] **Step 3: Verify build**

Run:
```bash
cd react_app; npm run build
```
Expected: Build succeeds.

- [ ] **Step 4: Git commit**

Run:
```bash
git add react_app/src/components/FullscreenViewer.jsx react_app/src/App.jsx
git commit -m "feat(ui): extract FullscreenViewer component with zoom and swipe gestures"
```

---

### Task 4: Extract FolderModal and ContextMenuModal Components

**Files:**
- Create: `react_app/src/components/FolderModal.jsx`
- Create: `react_app/src/components/ContextMenuModal.jsx`
- Modify: `react_app/src/App.jsx`

**Interfaces:**
- Consumes: Modal state flags, folders array, handlers for create/rename/delete folder and post actions.
- Produces: Modular modal components reducing `App.jsx` length and cognitive complexity.

- [ ] **Step 1: Create FolderModal.jsx**

Encapsulate folder creation, selection, and deletion UI.

- [ ] **Step 2: Create ContextMenuModal.jsx**

Encapsulate post actions (save image, add to folder, hide post, copy link, share).

- [ ] **Step 3: Connect components in App.jsx**

Import and render `FolderModal` and `ContextMenuModal` in `App.jsx`, removing inline modal DOM.

- [ ] **Step 4: Verify build & lint**

Run:
```bash
cd react_app; npm run lint; npm run build
```
Expected: 0 errors.

- [ ] **Step 5: Git commit**

Run:
```bash
git add react_app/src/components/FolderModal.jsx react_app/src/components/ContextMenuModal.jsx react_app/src/App.jsx
git commit -m "refactor(ui): extract FolderModal and ContextMenuModal from App.jsx"
```

---

### Task 5: Extract useAudioPlayer Custom Hook

**Files:**
- Create: `react_app/src/utils/useAudioPlayer.js`
- Modify: `react_app/src/App.jsx`

**Interfaces:**
- Consumes: Playlist array of audio paths.
- Produces: `{ isMusicPlaying, toggleMusic, currentTrackIndex, audioRef, handleTrackEnded, handleTrackError }`.

- [ ] **Step 1: Create useAudioPlayer.js hook**

Encapsulate `audioRef`, volume management (0.8 default), play/pause toggling, track end progression, audio error fallback, and Cordova `pause` app-lifecycle listener.

- [ ] **Step 2: Integrate hook into App.jsx**

Replace inline audio state in `App.jsx` with `const { isMusicPlaying, toggleMusic, currentTrackIndex, audioRef, handleTrackEnded, handleTrackError } = useAudioPlayer(playlist)`.

- [ ] **Step 3: Verify build**

Run:
```bash
cd react_app; npm run build
```
Expected: Build succeeds cleanly.

- [ ] **Step 4: Git commit**

Run:
```bash
git add react_app/src/utils/useAudioPlayer.js react_app/src/App.jsx
git commit -m "refactor(audio): extract useAudioPlayer custom hook with app lifecycle handling"
```

---

### Task 6: Search & Feed Performance Optimization

**Files:**
- Modify: `react_app/src/App.jsx`

**Interfaces:**
- Consumes: Search input events and raw posts.
- Produces: Debounced search term and memoized filter results to prevent UI jank.

- [ ] **Step 1: Add debounced search state**

Introduce a 150ms debounce between user input in the search bar and the actual filtering pass.

- [ ] **Step 2: Optimize feed filtering with useMemo**

Memoize `filteredPosts` with dependencies `[posts, debouncedSearch, activeTab, activeCategory, activeSort, ratingFilter, hideMissingImages, hiddenPosts, favorites, history, activeFolderId]`.

- [ ] **Step 3: Verify lint and build**

Run:
```bash
cd react_app; npm run lint; npm run build
```
Expected: 0 errors, 0 build warnings.

- [ ] **Step 4: Git commit**

Run:
```bash
git add react_app/src/App.jsx
git commit -m "perf(feed): add debounced search query and memoize filtered feed computation"
```

---

### Task 7: Comprehensive Project Verification and Walkthrough

**Files:**
- Verify: Full repository integrity
- Update: `walkthrough.md`

- [ ] **Step 1: Run comprehensive lint checks**

Run:
```bash
cd react_app; npm run lint
```
Expected: Zero errors.

- [ ] **Step 2: Run production Vite build**

Run:
```bash
cd react_app; npm run build
```
Expected: Clean build into `cordova_app/www/`.

- [ ] **Step 3: Verify Python scripts compilation**

Run:
```bash
python -m py_compile (Get-ChildItem -Filter *.py).FullName
```
Expected: All Python scripts compile with exit code 0.

- [ ] **Step 4: Verify Git author and commit log**

Run:
```bash
git log -n 5 --format="%h %an <%ae> - %s"
```
Expected: All commits show `RandoTeam <vlasov.rus.mos@gmail.com>`.

- [ ] **Step 5: Finalize walkthrough.md**

Update walkthrough artifact with detailed verification proof and metrics.
