# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.6] - 2026-09-12 — Ретро-музыка, AVIF-сжатие и обновлённые настройки

### ✨ Новые возможности для пользователей
- 🎵 **Минималистичный ретро-плеер**:
  - Удобная плавающая панель управления воспроизведением с живой визуализацией звука (анимированный эквалайзер).
  - Плавный регулятор громкости от 0% до 100% с быстрым отключением звука (Mute).
  - Удобное переключение треков («Предыдущий» / «Следующий») и выбор композиции из ностальгического плейлиста:
    1. *Comicsbook Nostalgia (Intro)*
    2. *Rage Era 2011*
    3. *Ламповый Рунет*
    4. *Trollface Beats*
    5. *Retro Museum Outro*
  - Быстрый вызов и скрытие плеера по клику на иконку ноты в верхней панели с мини-индикатором активности.
- ⚙️ **Новый модульный центр настроек**:
  - **Звук и музыка**: полный контроль фонового саундтрека, громкости и треклиста прямо из меню.
  - **Плавные анимации**: переключатель аппаратных переходов интерфейса, карточек и диалоговых окон.
  - **Оффлайн и медиа**: индикатор автономности архива (24,000+ постов без интернета) и тумблер скрытия постов без иллюстраций.
  - **Чтение и навигация**: выбор между бесконечным скроллом и постраничным просмотром с настройкой шага (5–50 постов) и слайдером порога рейтинга.
  - **Управление данными**: безопасная очистка истории, папок избранного и оценок в один клик.
- 🖼️ **Поддержка ультракомпактного формата AVIF**:
  - Добавлен скрипт `download_comics_avif.py` с многопоточной обработкой и компрессией в AVIF Q75 (экономия от 10% до 35% дискового пространства по сравнению с WebP).
  - Двухуровневый умный загрузчик изображений: при отсутствии AVIF на старых устройствах приложение автоматически переключается на WebP или архивные копии Wayback Machine.

### 🛠 Улучшения под капотом
- Полная модульная декомпозиция: созданы независимые компоненты `MiniAudioPlayer.jsx` и `SettingsView.jsx`.
- Устранены неиспользуемые переменные и предупреждения компилятора, размер production-бандла сохранен в пределах ~97 КБ (gzip).
- Безопасная изоляция ключей подписи Android Keystore и локальных служебных дампов в `.gitignore`.

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
