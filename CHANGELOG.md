# Changelog for MMM-MyTeams-LeagueTable

## v1.2.0 - UI Improvements and League Expansion

### Enhanced UI Experience
- Standardized table width across all leagues to prevent layout shifts
- Improved "Back to Top" button visibility (appears after 30px of scrolling)
- Added distinct background colors for each league's button when active
- Enhanced sticky header and footer behavior for better navigation
- Added right padding to the points header to improve form column alignment

### League Expansion
- Added support for Scottish Championship (SPFLC)
- Added support for English Premier League (EPL)
- Updated documentation with comprehensive league configuration options

### Documentation Improvements
- Added "showLeague" column to bbcLeaguesPages.md with unique configuration IDs
- Updated README.md to reflect new leagues and configuration options
- Enhanced CHANGELOG with detailed descriptions of all changes

## v1.1.0 - Enhanced Scrolling and Transitions

### Improved UI Experience
- Added sticky headers and footers during scrolling for better navigation
- Enhanced table header with position:sticky to keep it visible during scrolling
- Added sticky footer with improved styling and background
- Implemented smooth scrolling behavior with CSS scroll-behavior
- Customized scrollbar appearance for better aesthetics

### Smooth League Transitions
- Added fade in/out animations when switching between leagues
- Implemented smooth transitions for league button clicks
- Enhanced auto-cycling with proper animation effects
- Added automatic scroll-to-top when changing leagues
- Improved button hover effects with subtle animations

### Documentation
- Created comprehensive bbcLeaguesPages.md with extensive league listings
- Added detailed implementation instructions for adding new leagues
- Expanded documentation with troubleshooting section
- Included non-European leagues and women's competitions
- Added detailed usage examples

### Performance Improvements
- Optimized league switching to prevent unnecessary DOM updates
- Added transition timing for smoother animations
- Improved button click handling with proper state checking
- Enhanced auto-cycling with better timing controls
- Added transform effects for smoother visual transitions

## v1.0.0 - Initial Release

- Support for multiple football competitions (SPFL, UCL, UEL, ECL)
- League selector buttons in header
- Back to Top button for long tables
- Auto-cycling between enabled leagues
- Team highlighting functionality
- Responsive design with scrolling support