# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.5] - 2026-09-11

### Added
- **FullscreenViewer.jsx**: Extracted dedicated fullscreen comic viewer supporting pinch-to-zoom (1x–4x), double-tap zoom toggle, drag panning, and horizontal swipe gestures (next/prev comic).
- **FolderModal.jsx**: Extracted modular modal for creating custom favorites folders and managing post assignments.
- **ContextMenuModal.jsx**: Extracted post actions context menu modal with safe backdrop dismissal.
- **useAudioPlayer.js**: Extracted custom audio controller hook with Cordova app lifecycle pause handling and auto-advancing playlist.
- **Debounced Search & Memoization**: Added 150ms input debouncing and wrapped `filteredPosts` and `categories` in `useMemo` to eliminate UI stutter when filtering 24,000+ posts.

### Fixed
- **App.jsx**: Removed duplicate Cordova `backbutton` listener that previously caused duplicate navigation events.
- **App.jsx**: Cleaned dead variables (`totalPages`, `visiblePosts`, `triggerRandom`) and prefixed unused error parameters.
- **License & Author Synchronization**: Unified author as `RandoTeam <vlasov.rus.mos@gmail.com>` with MIT license across root `package.json`, `react_app`, `cordova_app`, and `config.xml`.

### Changed
- **Repository Hygiene**: Purged ~28 MB of alien files (`ChromaLab` assets, logcat dumps, `.idsig` build signatures, scraper test HTML dumps).
- **.gitignore**: Added strict patterns to prevent committing build artifacts, logs, and scraper test outputs.
- **Documentation**: Overhauled `README.md` with centered hero header, technology stack badges, WebP media specifications, architecture pipeline diagram, and approved solo-developer donation block.

## [1.0.4] - 2026-07-07

### Fixed
- **App.jsx**: Resolved a fatal `NaN` sort bug causing the main feed to collapse when rendering VK posts with string-based IDs.
- **App.jsx**: Enforced strict isolation of the `ВКонтакте` category from the main feed to prevent historical data without ratings from skewing the "Best" sorting algorithm.
- **App.jsx**: Fixed an activeCategory parsing condition that caused a race condition and resulted in an empty feed inside the VK section.
- **merge_vk_data.py**: Updated ID generation logic to produce robust Integer hashes for VK comics instead of strings (e.g. `vk_...`), ensuring SQLite and Array sorting compatibility.
- **fix_data.py**: Developed and executed a migration script to normalize legacy `vk_` string IDs to safe Integers in `data.json`.
