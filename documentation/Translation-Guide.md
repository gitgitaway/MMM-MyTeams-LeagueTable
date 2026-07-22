# Translation Guide

The **MMM-MyTeams-LeagueTable** module supports multiple languages. This guide explains how to use existing translations and how to add support for a new language.

This folder contains translation files for the MMM-MyTeams-LeagueTable module.

## Supported Languages

| Language | Code | Example |
|----------|------|---------|
| 🇦🇱 Albanian | `sq` | `language: "sq"` |
| 🇿🇦 Afrikaans | `af` | `language: "af"` |
| 🇸🇦 Arabic | `ar` | `language: "ar"` |
| 🇭🇷 Croatian | `hr` | `language: "hr"` |
| 🇨🇿 Czech | `cs` | `language: "cs"` |
| 🇩🇰 Danish | `da` | `language: "da"` |
| 🇳🇱 Dutch | `nl` | `language: "nl"` |
| 🇬🇧 English | `en` | `language: "en"` |
| 🇮🇷 Persian (Farsi) | `fa` | `language: "fa"` |
| 🇫🇮 Finnish | `fi` | `language: "fi"` |
| 🇫🇷 French | `fr` | `language: "fr"` |
| 🇩🇪 German | `de` | `language: "de"` |
| 🇬🇷 Greek | `el` | `language: "el"` |
| 🇭🇹 Haitian Creole | `ht` | `language: "ht"` |
| 🇭🇺 Hungarian | `hu` | `language: "hu"` |
| 🇮🇪 Irish Gaelic | `ga` | `language: "ga"` |
| 🇮🇹 Italian | `it` | `language: "it"` |
| 🇯🇵 Japanese | `ja` | `language: "ja"` |
| 🇰🇷 Korean | `ko` | `language: "ko"` |
| 🇳🇿 Maori | `mi` | `language: "mi"` |
| 🇳🇴 Norwegian | `no` | `language: "no"` |
| 🇵🇱 Polish | `pl` | `language: "pl"` |
| 🇵🇹 Portuguese | `pt` | `language: "pt"` |
| 🇷🇴 Romanian | `ro` | `language: "ro"` |
| 🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scottish Gaelic | `gd` | `language: "gd"` |
| 🇷🇸 Serbian | `sr` | `language: "sr"` |
| 🇸🇰 Slovak | `sk` | `language: "sk"` |
| 🇸🇮 Slovenian | `sl` | `language: "sl"` |
| 🇪🇸 Spanish | `es` | `language: "es"` |
| 🇸🇪 Swedish | `sv` | `language: "sv"` |
| 🇹🇷 Turkish | `tr` | `language: "tr"` |
| 🇺🇦 Ukrainian | `uk` | `language: "uk"` |
| 🇺🇿 Uzbek | `uz` | `language: "uz"` |
| 🏴󠁧󠁢󠁷󠁬󠁳󠁿 Welsh | `cy` | `language: "cy"` |


## File Structure

Each language has its own JSON file named with the ISO 639-1 language code (e.g., `en.json`, `gd.json`).


# Translation Keys

All translation files are located in the `translations/` directory. Each file is a JSON object where the key is the internal identifier and the value is the translated string. All translation files must contain the following core keys:

### Core UI Keys
- `LOADING`: Text shown while data is being fetched.
- `ERROR`: Message shown when a fetch fails.
- `RETRYING`: Message shown during automatic retry attempts.
- `NO_DATA`: Message shown if no league data is returned.
- `LAST_UPDATED`: Label for the data freshness timestamp.
- `POSITION`: Column header for league rank.
- `TEAM`: Column header for team name.
- `PLAYED`: Column header for games played.
- `GOAL_DIFFERENCE`: Column header for GD.
- `POINTS`: Column header for points.
- `FORM`: Column header for the form guide.
- `HIDE_LEAGUE_TABLE`: Accessibility label for hiding the table.
- `SHOW_LEAGUE_TABLE`: Accessibility label for showing the table.

### Tournament & Knockout Keys
- `PLAYOFF`: Label for Playoff round.
- `ROUND_OF_16`: Label for Round of 16.
- `QUARTER_FINAL`: Label for Quarter Final.
- `SEMI_FINAL`: Label for Semi Final.
- `FINAL`: Label for Final.

### Country Keys
These are used for grouping and headers in tournament views like the World Cup.
Example: `SCOTLAND`, `ENGLAND`, `FRANCE`, `BRAZIL`, etc. (Check `en.json` for full list).


## Contributing Translations

### Adding a New Language

1. **Create a new JSON file** named with the ISO 639-1 language code (e.g., `cy.json` for Welsh)
2. **Copy the structure** from `en.json`
3. **Translate all keys** to your language
4. **Update the module** by adding your language to the `getTranslations()` method in `MMM-MyTeams-LeagueTable.js`:

```javascript
getTranslations() {
  return {
    en: "translations/en.json",
    // ... existing languages ...
    cy: "translations/cy.json"  // Add your new language here
  };
}
```

5. **Test your translation** by setting `language: "cy"` in your config
6. **Submit a pull request** with your new translation file

### Improving Existing Translations

If you find errors or have suggestions for improving existing translations:

1. Edit the appropriate `.json` file
2. Ensure all keys remain unchanged (only translate the values)
3. Test your changes
4. Submit a pull request with a description of your improvements

## Translation Guidelines

### General Rules

- **Keep it concise**: UI labels should be short and clear
- **Match the tone**: Maintain consistency with other translations
- **Test thoroughly**: Verify your translations display correctly in the UI
- **Preserve formatting**: Don't add extra spaces or punctuation unless necessary

### Specific Guidelines

- **UPCOMING_FIXTURES**: Should be lowercase (used in title like "Celtic FC upcoming fixtures")
- **H_A**: Should be abbreviated (e.g., "H/A", "D/F", "C/T") to fit in narrow column
- **UNKNOWN**: Should be lowercase (used inline in text)
- **TBD**: Can be abbreviated or spelled out depending on language conventions

### What NOT to Translate

The following are **NOT** translated (they come from the API / BBC/FIFA web sites):

- Team names (e.g., "Celtic", "Rangers")
- Competition names (e.g., "Scottish Premiership", "UEFA Champions League")
- Opponent names
- Dates and times (formatted using the `locale` config parameter)

## File Format

Each translation file must be valid JSON:

```json
{
  "LOADING": "Your translation here...",
  "TBD": "Your translation"
}
```

### JSON Validation

- Use double quotes for keys and values
- No trailing commas
- Escape special characters: `\"`, `\\`, `\n`, etc.
- Validate your JSON using a tool like [JSONLint](https://jsonlint.com/)

## Testing Your Translations

1. **Add to config.js**:
```javascript
{
  module: "MMM-MyTeams-LeagueTable",
  config: {
    language: "gd",  // Your language code
    debug: true      // Enable debug logging
  }
}
```

2. **Restart MagicMirror**:
```bash
pm2 restart mm
```

3. **Check the console** for any translation loading errors

4. **Verify the UI** displays your translations correctly

#
## How to Add a New Language

1.  **Create the JSON file**:
    Create a new file in the `translations/` directory named after the ISO 639-1 language code (e.g., `it.json` for Italian).
2.  **Copy the English template**:
    Copy the contents of `translations/en.json` into your new file.
3.  **Translate the values**:
    Replace the English strings with the equivalent in your target language. Keep the keys (left side) exactly the same.
4.  **Validate JSON**:
    Ensure the file is valid JSON (no trailing commas, properly escaped quotes).
5.  **Restart MagicMirror**:
    The module will automatically detect the new file based on your `config.js` language setting.

## Contributing Translations

If you create a translation for a new language, please consider submitting a Pull Request to share it with the community!


## Questions?

If you have questions about contributing translations, please:

1. Check the [main README](../README.md) for general module information
2. Review existing translation files for examples
3. Open an issue on GitHub for clarification

Thank you for helping make MMM-MyTeams-LeagueTable accessible to more users! 🌍
