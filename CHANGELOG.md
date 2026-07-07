# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.4] - 2026-07-07

### Fixed
- **App.jsx**: Resolved a fatal `NaN` sort bug causing the main feed to collapse when rendering VK posts with string-based IDs.
- **App.jsx**: Enforced strict isolation of the `ВКонтакте` category from the main feed to prevent historical data without ratings from skewing the "Best" sorting algorithm.
- **App.jsx**: Fixed an activeCategory parsing condition that caused a race condition and resulted in an empty feed inside the VK section.
- **merge_vk_data.py**: Updated ID generation logic to produce robust Integer hashes for VK comics instead of strings (e.g. `vk_...`), ensuring SQLite and Array sorting compatibility.
- **fix_data.py**: Developed and executed a migration script to normalize legacy `vk_` string IDs to safe Integers in `data.json`.
