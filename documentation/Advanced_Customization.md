# Advanced Customization Guide

This guide is for users who want to push the boundaries of the **MMM-MyTeams-LeagueTable** module through custom styling and advanced logo configuration.

## Custom CSS Styling

The module uses standard MagicMirror CSS classes and modern CSS variables. You can override these in your `custom.css` file.

### CSS Variables
The module defines these variables for easy theme integration:

```css
.MMM-MyTeams-LeagueTable {
  --table-font-size: clamp(12px, 1.2vw, 18px);
  --header-bg-color: rgba(255, 255, 255, 0.1);
  --row-hover-bg: rgba(255, 255, 255, 0.05);
  --promotion-color: #4caf50;
  --relegation-color: #f44336;
  --uefa-color: #2196f3;
}
```

### Examples

**1. Change Highlight Color for Your Team**
```css
.MMM-MyTeams-LeagueTable .highlight-team {
  background-color: #ffd700 !important;
  color: #000 !important;
  font-weight: bold;
}
```

**2. Compact Mode (Smaller Rows)**
```css
.MMM-MyTeams-LeagueTable .league-row {
  padding: 2px 4px;
}
```

---

## Custom Team Logo Mappings

While the module includes over 1,700 mappings, you might find a missing team or want to use a custom icon.

### Adding a New Logo
1.  **Place the image**: Save your logo (PNG or SVG) in `images/crests/[Country]/[TeamName].png`.
2.  **Edit Mappings**: Open `team-logo-mappings.js`.
3.  **Add Entry**: Add your team to the relevant country object.

```javascript
// team-logo-mappings.js
"Scotland": {
  "My Local Team": "Scotland/my-local-team.png",
}
```

### Handling Naming Mismatches
If the module logs `NO MAPPING FOUND for team 'XYZ'`, copy the **normalized** name from the log and add it to `team-logo-mappings.js` exactly as it appears.

---

## Performance Tuning

If you are running on a low-power Raspberry Pi Zero:
- Set `showTeamLogos: false`.
- Increase `updateInterval` to `3600000` (1 hour).
- Reduce `maxTeams` to `10`.

## Developer Hooks

The module broadcasts its state via `sendNotification`:
- `LEAGUE_DATA_RECEIVED`: Sent when a league refresh completes.
- `LEAGUE_SWITCHED`: Sent when the active league changes (manual or auto).
