# Accessibility Features

The **MMM-MyTeams-LeagueTable** module is designed with accessibility in mind, ensuring that football fans of all abilities can stay updated with their favorite teams.

## Key Features

### 1. Screen Reader Support (ARIA)
*   **League Selection**: Each league button has a descriptive `aria-label` (e.g., "Switch to English Premier League table").
*   **Table Data**: Every team row includes an `aria-label` that summarizes the team's standing, rank, and points (e.g., "Arsenal, rank 1, 45 points").
*   **Fixtures**: Fixture rows describe the matchup and current score or kick-off time (e.g., "Liverpool versus Manchester City, starts at 15:00").
*   **Controls**: Buttons for "Back to Top", "Refresh", and "Pin" are all properly labeled for screen readers.

### 2. High Contrast & Visibility
*   **Color Coding**: Promotion and relegation zones are clearly marked with colors. These are supplemented by position numbers to ensure information is not conveyed by color alone.
*   **Responsive Typography**: Uses `clamp()` based font sizes to ensure text remains readable regardless of screen size.
*   **Live Indicators**: Live matches are highlighted with high-brightness text to stand out against the background.

### 3. Navigation
*   **Keyboard Friendly**: Interactive elements like league switcher buttons can be focused and triggered using standard keyboard navigation (Tab/Enter).
*   **Clear Focus States**: Active tabs and buttons have distinct visual states to indicate current selection.
*   **Back to Top**: A sticky "Back to Top" button appears when scrolling through long league tables, facilitating easy navigation.

### 4. Status Notifications
*   **Loading States**: Clear text indicators inform the user when data is being updated.
*   **Stale Data Warnings**: If live data cannot be reached, a "STALE" warning with a history icon is displayed, ensuring the user knows the information may not be current.

## Feedback
I am committed to making this module accessible to everyone. If you encounter any accessibility barriers or have suggestions for improvement, please open an issue on my GitHub repository.
