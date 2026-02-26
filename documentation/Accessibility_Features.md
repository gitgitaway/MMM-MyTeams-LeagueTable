# Accessibility Features

The **MMM-MyTeams-LeagueTable** module is designed with accessibility in mind, ensuring that football fans of all abilities can stay updated with their favorite teams.

**🎉 WCAG 2.1 Level AA Compliant** (as of v1.9.0 - February 2026)

The module now meets **Web Content Accessibility Guidelines (WCAG) 2.1 Level AA** standards, providing comprehensive support for screen readers, keyboard navigation, and assistive technologies.

## Key Features

### 1. Comprehensive Screen Reader Support (ARIA)

**Tables & Data Structure** (Enhanced in v1.9.0):
*   **Table Semantics**: All tables include `role="table"` with descriptive `aria-label` attributes (e.g., "Scottish Premiership Standings Table")
*   **Row Identification**: Every row has `role="row"` and `aria-rowindex` for proper navigation sequence
*   **Column Headers**: All header cells include `role="columnheader"` and `aria-sort="none"` attributes
*   **Data Cells**: All data cells include `role="cell"` for proper table grid navigation
*   **Row Context**: Every team row includes an `aria-label` that summarizes the team's standing, rank, and points (e.g., "Arsenal, rank 1, 45 points")

**Interactive Elements**:
*   **League Selection**: Each league button has a descriptive `aria-label` (e.g., "Switch to English Premier League table")
*   **Fixtures**: Fixture rows describe the matchup and current score or kick-off time (e.g., "Liverpool versus Manchester City, starts at 15:00")
*   **Controls**: All buttons (Refresh, Clear Cache, Pin, Back to Top) are properly labeled with both `aria-label` and `title` attributes
*   **Pin Button**: Includes `aria-pressed` state to indicate whether auto-cycling is paused

### 2. High Contrast & Visibility
*   **Color Coding**: Promotion and relegation zones are clearly marked with colors. These are supplemented by position numbers to ensure information is not conveyed by color alone.
*   **Responsive Typography**: Uses `clamp()` based font sizes to ensure text remains readable regardless of screen size.
*   **Live Indicators**: Live matches are highlighted with high-brightness text to stand out against the background.

### 3. Full Keyboard Navigation (Enhanced in v1.9.0)

**Complete Keyboard Control** - The module is 100% keyboard accessible with no mouse required:

*   **Tab Navigation**: All interactive elements are focusable with Tab/Shift+Tab keys
*   **Activation**: All buttons respond to both Enter and Space keys for activation
*   **League Switcher**: Navigate between leagues using Tab, activate with Enter/Space
*   **Refresh Button**: Press Enter or Space to manually refresh league data
*   **Clear Cache Button**: Press Enter or Space to clear cached data
*   **Pin Button**: Press Enter or Space to pause/resume auto-cycling
*   **Back to Top**: Press Enter or Space to scroll to top of table

**Keyboard Navigation Implementation**:
*   All interactive elements include `tabindex="0"` for keyboard focus
*   Custom `addKeyboardNavigation()` helper ensures consistent Enter/Space key handling
*   Clear focus indicators on all focusable elements
*   Logical tab order follows visual layout

**Navigation Aids**:
*   **Back to Top**: A sticky "Back to Top" button appears when scrolling through long league tables, accessible via keyboard
*   **Active States**: Currently selected league and tabs have distinct visual states

### 4. Status Notifications
*   **Loading States**: Clear text indicators inform the user when data is being updated.
*   **Stale Data Warnings**: If live data cannot be reached, a "STALE" warning with a history icon is displayed, ensuring the user knows the information may not be current.
*   **Error Messages**: Descriptive error messages provide context when data fetching fails.

### 5. Enhanced Form Indicator Shapes (A11Y-10)

The form column (W/D/L recent results) supports two display modes, controlled by the `enhancedIndicatorShapes` config option:

**`enhancedIndicatorShapes: true` (default)** — shape-coded tokens for users who cannot distinguish colors alone:
- **Win (W)** — circular token (WCAG success criterion: non-color differentiator)
- **Draw (D)** — square token
- **Loss (L)** — triangular token

**`enhancedIndicatorShapes: false`** — minimalist text-only mode with no background shape:
- **W** — green text (`#018749`)
- **D** — grey text (`#888888`)
- **L** — red text (`#ff3333`)

Both modes satisfy WCAG 1.4.1 (Use of Color) by ensuring results are never conveyed by color alone — either through shapes (enhanced mode) or clear letter labels (flat mode).

**Configuration:**
```javascript
enhancedIndicatorShapes: true,  // Shape-coded tokens (default, recommended)
enhancedIndicatorShapes: false, // Text-only with colored letters
```

**High-contrast mode:** When `enhanced` mode is active, additional diagonal stripe patterns are layered onto form tokens in browsers and OSes that report `prefers-contrast: high`, providing a third differentiator beyond color and shape.

---

### 6. Security & Safe Content (Enhanced in v1.9.0)

**XSS Prevention**:
*   **Zero innerHTML Usage**: All dynamic content uses safe DOM manipulation methods
*   **Input Validation**: All user-provided inputs (like `dateTimeOverride`) are validated with proper bounds checking
*   **Safe Icon Creation**: Custom `createIcon()` helper prevents code injection through icon elements

This ensures that all content displayed in the module is safe and cannot be exploited for malicious purposes.

## Technical Implementation

### ARIA Attributes Reference

**Table Structure**:
```html
<table role="table" aria-label="Scottish Premiership Standings Table">
  <thead>
    <tr role="row">
      <th role="columnheader" aria-sort="none">Position</th>
      <th role="columnheader" aria-sort="none">Team</th>
      <!-- Additional headers -->
    </tr>
  </thead>
  <tbody>
    <tr role="row" aria-rowindex="1" aria-label="Celtic, rank 1, 45 points">
      <td role="cell">1</td>
      <td role="cell">Celtic</td>
      <!-- Additional cells -->
    </tr>
  </tbody>
</table>
```

**Interactive Controls**:
```html
<button aria-label="Refresh Data" title="Refresh Data" tabindex="0">
  <i class="fas fa-sync-alt"></i>
</button>

<button aria-label="Pin (pause auto-cycling)" aria-pressed="false" tabindex="0">
  <i class="fas fa-thumbtack"></i>
</button>
```

### Helper Functions (v1.9.0)

The module includes specialized helper functions for consistent accessibility:

*   **`createTableHeader(text, className)`**: Creates `<th>` elements with proper ARIA attributes
*   **`createTableCell(content, className)`**: Creates `<td>` elements with `role="cell"`
*   **`addKeyboardNavigation(element, callback)`**: Adds Enter/Space key support to interactive elements
*   **`createIcon(iconClass)`**: Creates FontAwesome icons safely without innerHTML

## Compliance Status

**WCAG 2.1 Level AA Compliance** (Achieved in v1.9.0, enhanced in v2.2.0):
- ✅ **1.3.1 Info and Relationships**: All table structures use proper semantic HTML and ARIA attributes
- ✅ **1.4.1 Use of Color**: Form result tokens are differentiated by shape (enhanced mode) or explicit letter labels (flat mode), never by color alone
- ✅ **2.1.1 Keyboard**: All functionality available via keyboard interface
- ✅ **2.1.2 No Keyboard Trap**: Users can navigate away from all interactive elements
- ✅ **2.4.3 Focus Order**: Tab order follows logical visual sequence
- ✅ **2.4.7 Focus Visible**: Clear focus indicators on all focusable elements
- ✅ **4.1.2 Name, Role, Value**: All UI components have accessible names and roles
- ✅ **4.1.3 Status Messages**: Error and status messages properly communicated to assistive technologies

## Testing Recommendations

To verify accessibility on your installation:

1. **Screen Reader Testing**: Test with NVDA (Windows), JAWS (Windows), or VoiceOver (macOS)
2. **Keyboard Navigation**: Navigate entire module using only Tab, Enter, and Space keys
3. **Focus Visibility**: Verify all interactive elements show clear focus indicators
4. **Color Contrast**: Ensure sufficient contrast ratios (minimum 4.5:1 for text)

## Feedback
I am committed to making this module accessible to everyone. If you encounter any accessibility barriers or have suggestions for improvement, please open an issue on the GitHub repository.

**Accessibility Resources**:
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
