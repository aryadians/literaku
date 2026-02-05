# Changelog

All notable changes to the **Literaku** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Notification System**: Real-time alerts for likes and comments using Supabase Realtime.
- **Sorting**: Added ability to sort reviews by Newest, Popular, and Oldest.
- **PDF Reader**: Improved mobile responsiveness and fallback UI.
- **Categories Page**: Browse books by genre with review counts.
- **Admin Dashboard**: Basic upload functionality for books (PDF & Cover).

### Changed
- Refactored `reviews` page to use server-side sorting API.
- Updated `ReaderInterface` to handle missing PDFs gracefully.
- Improved `README.md` with comprehensive documentation.

### Fixed
- Fixed build errors in `ReaderInterface` component.
- Fixed layout issues on mobile devices for the navigation bar.

## [1.0.0] - 2026-02-05
### Added
- Initial release of Literaku.
- Core features: Library, Reviews, Auth (NextAuth), Dashboard.
- UI Components: Bento Grid, Modern Dark Mode.
