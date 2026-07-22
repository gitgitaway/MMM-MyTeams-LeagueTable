# BBC Sport League Pages

This document provides a comprehensive list of football league tables available on the BBC Sport website. These URLs are the default source for the MMM-MyTeams-LeagueTable module.

**Caution:** Check that each URL remains valid prior to each new season starting. BBC Sport occasionally restructures their URL paths.

**Current season:** 2026–27 (BBC Sport paths are stable between seasons; only the ⚠️ entries below require attention.)

**Key:**  
🏆 — League splits into Championship/Relegation groups mid-season  
⚠️ — BBC URL known to return 404; module falls back to Wikipedia/ESPN automatically

The **League Code** column shows the exact value to use in your `config.js` `showLeague` array (or equivalent config property). These are the canonical codes matched by all five internal URL provider maps.

---

## European Competitions

| Country | League Name | BBC Website | League Code |
|---------|-------------|-------------|-------------|
| Europe | UEFA Champions League | https://www.bbc.com/sport/football/champions-league/table | `UEFA_CHAMPIONS_LEAGUE` |
| Europe | UEFA Europa League | https://www.bbc.com/sport/football/europa-league/table | `UEFA_EUROPA_LEAGUE` |
| Europe | UEFA Europa Conference League | https://www.bbc.com/sport/football/europa-conference-league/table | `UEFA_EUROPA_CONFERENCE_LEAGUE` |

**Legacy aliases** (backward compatibility, still accepted in config): `UCL`, `UEL`, `ECL`

---

## European Domestic Leagues — Tier 1

| Country | League Name | BBC Website | League Code |
|---------|-------------|-------------|-------------|
| Albania | Kategoria Superiore | https://www.bbc.co.uk/sport/football/albanian-superliga/table | `ALBANIA_KATEGORIA_SUPERIORE` |
| Armenia | Premier League | https://www.bbc.co.uk/sport/football/armenian-premier-league/table | `ARMENIA_PREMIER_LEAGUE` |
| Austria | Bundesliga 🏆 | https://www.bbc.co.uk/sport/football/austrian-bundesliga/table | `AUSTRIA_BUNDESLIGA` |
| Azerbaijan | Premier League | https://www.bbc.co.uk/sport/football/azerbaijan-premier-league/table | `AZERBAIJAN_PREMIER_LEAGUE` |
| Belarus | Vysshaya Liga | https://www.bbc.co.uk/sport/football/belarusian-vysshaya-liga/table | `BELARUS_VYSSHAYA_LIGA` |
| Belgium | Pro League 🏆 | https://www.bbc.com/sport/football/belgian-pro-league/table | `BELGIUM_PRO_LEAGUE` |
| Bosnia & Herzegovina | Premier League | https://www.bbc.co.uk/sport/football/bosnian-premier-league/table | `BOSNIA_AND_HERZEGOVINA_PREMIER_LEAGUE` |
| Croatia | HNL | https://www.bbc.co.uk/sport/football/croatian-first-league/table | `CROATIA_HNL` |
| Cyprus | First Division 🏆 | https://www.bbc.co.uk/sport/football/cypriot-first-division/table | `CYPRUS_FIRST_DIVISION` |
| Czech Republic | Czech Liga | https://www.bbc.co.uk/sport/football/czech-liga/table | `CZECH_LIGA` |
| Denmark | Superliga 🏆 | https://www.bbc.com/sport/football/danish-superliga/table | `DENMARK_SUPERLIGA` |
| England | Premier League | https://www.bbc.com/sport/football/premier-league/table | `ENGLAND_PREMIER_LEAGUE` |
| England | Championship | https://www.bbc.com/sport/football/english-championship/table | `ENGLAND_CHAMPIONSHIP` |
| Estonia | Meistriliiga | https://www.bbc.co.uk/sport/football/estonian-meistriliiga/table | `ESTONIA_MEISTRILIIGA` |
| Faroe Islands | Premier League | https://www.bbc.co.uk/sport/football/faroe-islands-premier-league/table | `FAROE_ISLANDS_PREMIER_LEAGUE` |
| Finland | Veikkausliiga ⚠️ | https://www.bbc.co.uk/sport/football/finnish-premier-league/table | `FINLAND_VEIKKAUSLIIGA` |
| France | Ligue 1 | https://www.bbc.com/sport/football/french-ligue-one/table | `FRANCE_LIGUE1` |
| Georgia | Erovnuli Liga | https://www.bbc.co.uk/sport/football/georgian-erovnuli-liga/table | `GEORGIA_EROVNULI_LIGA` |
| Germany | Bundesliga | https://www.bbc.com/sport/football/german-bundesliga/table | `GERMANY_BUNDESLIGA` |
| Greece | Super League 🏆 ⚠️ | https://www.bbc.com/sport/football/greek-super-league/table | `GREECE_SUPER_LEAGUE` |
| Hungary | NB I | https://www.bbc.co.uk/sport/football/hungarian-nb-i/table | `HUNGARY_NBI` |
| Iceland | Premier League | https://www.bbc.co.uk/sport/football/icelandic-premier-league/table | `ICELAND_PREMIER_LEAGUE` |
| Israel | Premier League 🏆 | https://www.bbc.co.uk/sport/football/israeli-premier-league/table | `ISRAEL_PREMIER_LEAGUE` |
| Italy | Serie A | https://www.bbc.com/sport/football/italian-serie-a/table | `ITALY_SERIE_A` |
| Kazakhstan | Premier League | https://www.bbc.co.uk/sport/football/kazakhstan-premier-league/table | `KAZAKHSTAN_PREMIER_LEAGUE` |
| Latvia | Virsliga | https://www.bbc.co.uk/sport/football/latvian-virsliga/table | `LATVIA_VIRSLIGA` |
| Lithuania | A Lyga | https://www.bbc.co.uk/sport/football/lithuanian-a-lyga/table | `LITHUANIA_A_LYGA` |
| Moldova | Super Liga | https://www.bbc.co.uk/sport/football/moldovan-super-liga/table | `MOLDOVA_SUPER_LIGA` |
| Montenegro | First League | https://www.bbc.co.uk/sport/football/montenegrin-first-league/table | `MONTENEGRO_FIRST_LEAGUE` |
| Netherlands | Eredivisie | https://www.bbc.com/sport/football/dutch-eredivisie/table | `NETHERLANDS_EREDIVISIE` |
| North Macedonia | First League | https://www.bbc.co.uk/sport/football/north-macedonian-first-league/table | `NORTH_MACEDONIA_FIRST_LEAGUE` |
| Northern Ireland | Premiership | https://www.bbc.com/sport/football/irish-premiership/table | `NORTHERN_IRELAND_PREMIER_LEAGUE` |
| Norway | Eliteserien ⚠️ | https://www.bbc.com/sport/football/norwegian-eliteserien/table | `NORWAY_ELITESERIEN` |
| Poland | Ekstraklasa | https://www.bbc.co.uk/sport/football/polish-ekstraklasa/table | `POLAND_EKSTRAKLASA` |
| Portugal | Primeira Liga | https://www.bbc.com/sport/football/portuguese-primeira-liga/table | `PORTUGAL_PRIMEIRA_LIGA` |
| Republic of Ireland | Premier Division | https://www.bbc.com/sport/football/league-of-ireland-premier/table | `IRELAND_PREMIER_LEAGUE` |
| Romania | Liga I 🏆 ⚠️ | https://www.bbc.co.uk/sport/football/romanian-liga-i/table | `ROMANIA_LIGA_I` |
| Scotland | Premiership 🏆 | https://www.bbc.com/sport/football/scottish-premiership/table | `SCOTLAND_PREMIERSHIP` |
| Scotland | Championship | https://www.bbc.com/sport/football/scottish-championship/table | `SCOTLAND_CHAMPIONSHIP` |
| Serbia | Super Liga 🏆 | https://www.bbc.co.uk/sport/football/serbian-super-lig/table | `SERBIA_SUPER_LIGA` |
| Spain | La Liga | https://www.bbc.com/sport/football/spanish-la-liga/table | `SPAIN_LA_LIGA` |
| Sweden | Allsvenskan | https://www.bbc.com/sport/football/swedish-allsvenskan/table | `SWEDEN_ALLSVENSKAN` |
| Switzerland | Super League 🏆 | https://www.bbc.co.uk/sport/football/swiss-super-league/table | `SWITZERLAND_SUPER_LEAGUE` |
| Turkey | Süper Lig | https://www.bbc.com/sport/football/turkish-super-lig/table | `TURKEY_SUPER_LIG` |
| Ukraine | Premier League | https://www.bbc.com/sport/football/ukrainian-premier-league/table | `UKRAINE_PREMIER_LEAGUE` |
| Wales | Cymru Premier 🏆 | https://www.bbc.com/sport/football/cymru-premier/table | `CYMRU_PREMIER_LEAGUE` |

---

## European Domestic Leagues — Tier 2

> **Note:** Tier 2 leagues are listed here for reference only. They do not currently have canonical league codes in the module's URL maps and are not supported as `showLeague` values. Community contributions welcome.

| Country | League Name | BBC Website |
|---------|-------------|-------------|
| Austria | 2. Liga | https://www.bbc.com/sport/football/austrian-second-league/table |
| Belgium | Challenger Pro League | https://www.bbc.com/sport/football/belgian-challenger-pro-league/table |
| Croatia | First NL | https://www.bbc.com/sport/football/croatian-second-league/table |
| Czech Republic | National Football League | https://www.bbc.com/sport/football/czech-second-league/table |
| Denmark | 1. Division | https://www.bbc.com/sport/football/danish-first-division/table |
| England | EFL League One | https://www.bbc.com/sport/football/league-one/table |
| England | EFL League Two | https://www.bbc.com/sport/football/league-two/table |
| England | National League | https://www.bbc.com/sport/football/national-league/table |
| France | Ligue 2 | https://www.bbc.com/sport/football/french-ligue-two/table |
| Germany | 2. Bundesliga | https://www.bbc.com/sport/football/german-bundesliga-2/table |
| Greece | Super League 2 | https://www.bbc.com/sport/football/greek-second-league/table |
| Hungary | NB II | https://www.bbc.com/sport/football/hungarian-second-league/table |
| Italy | Serie B | https://www.bbc.com/sport/football/italian-serie-b/table |
| Netherlands | Eerste Divisie | https://www.bbc.com/sport/football/dutch-eerste-divisie/table |
| Northern Ireland | NIFL Championship | https://www.bbc.com/sport/football/irish-championship/table |
| Norway | 1. divisjon | https://www.bbc.com/sport/football/norwegian-first-division/table |
| Poland | I liga | https://www.bbc.com/sport/football/polish-first-league/table |
| Portugal | Liga Portugal 2 | https://www.bbc.com/sport/football/portuguese-second-league/table |
| Republic of Ireland | First Division | https://www.bbc.com/sport/football/league-of-ireland-first/table |
| Romania | Liga II | https://www.bbc.com/sport/football/romanian-second-league/table |
| Scotland | League One | https://www.bbc.com/sport/football/scottish-league-one/table |
| Scotland | League Two | https://www.bbc.com/sport/football/scottish-league-two/table |
| Serbia | First League | https://www.bbc.com/sport/football/serbian-first-league/table |
| Spain | La Liga 2 | https://www.bbc.com/sport/football/spanish-la-liga-2/table |
| Sweden | Superettan | https://www.bbc.com/sport/football/swedish-superettan/table |
| Turkey | TFF 1. Lig | https://www.bbc.com/sport/football/turkish-first-league/table |
| Ukraine | Ukrainian First League | https://www.bbc.com/sport/football/ukrainian-first-league/table |
| Wales | Cymru South/North | https://www.bbc.com/sport/football/league-of-wales-division-one/table |

---

## Non-European Leagues

| Country | League Name | BBC Website | League Code |
|---------|-------------|-------------|-------------|
| Algeria | Ligue 1 | https://www.bbc.co.uk/sport/football/algerian-ligue-one/table | `ALGERIA_LIGUE_1` |
| Andorra | Primera Divisió | https://www.bbc.co.uk/sport/football/andorran-primera-division/table | `ANDORRA_PRIMERA_DIVISION` |
| Argentina | Primera División | https://www.bbc.com/sport/football/argentine-primera-division/table | `ARGENTINA_PRIMERA_DIVISION` |
| Australia | A-League | https://www.bbc.com/sport/football/australian-a-league/table | `AUSTRALIA_A_LEAGUE` |
| Bolivia | Primera División | https://www.bbc.co.uk/sport/football/bolivian-primera-division/table | `BOLIVIA_LIGA_PRIMERA_DIVISION` |
| Brazil | Série A | https://www.bbc.com/sport/football/brazilian-serie-a/table | `BRAZIL_SERIA_A` |
| Canada / USA | MLS | https://www.bbc.com/sport/football/major-league-soccer/table | `CANADA_MLS` or `USA_MLS` |
| China | Super League | https://www.bbc.com/sport/football/chinese-super-league/table | `CHINA_SUPER_LEAGUE` |
| Japan | J1 League | https://www.bbc.com/sport/football/japanese-j1-league/table | `JAPAN_J1_LEAGUE` |
| Mexico | Liga MX | https://www.bbc.com/sport/football/mexican-liga-mx/table | `MEXICO_LIGA_MX` |
| Morocco | Botola Pro | https://www.bbc.co.uk/sport/football/moroccan-botola-pro/table | `MOROCCO_BOTOLA_PRO` |
| South Africa | Premier Division | https://www.bbc.co.uk/sport/football/south-african-premier-division/table | `SOUTH_AFRICA_PREMIER_DIVISION` |
| South Korea | K League 1 | https://www.bbc.co.uk/sport/football/south-korean-k-league-1/table | `SOUTH_KOREA_K_LEAGUE_1` |
| Tunisia | Ligue 1 | https://www.bbc.co.uk/sport/football/tunisian-ligue-one/table | `TUNISIA_LIGUE_1` |

---

## International Tournaments

> **Note:** International tournaments and cup competitions do not use the standard league table format. They are listed here for reference only.

| Competition | BBC Website |
|------------|-------------|
| FIFA World Cup 2026 | https://www.bbc.com/sport/football/world-cup |
| FIFA Women's World Cup | https://www.bbc.com/sport/football/womens-world-cup |
| UEFA European Championship | https://www.bbc.com/sport/football/european-championship |
| UEFA Women's Euro | https://www.bbc.com/sport/football/womens-european-championship |
| Copa América | https://www.bbc.com/sport/football/copa-america |
| AFC Asian Cup | https://www.bbc.com/sport/football/asian-cup |
| Africa Cup of Nations | https://www.bbc.com/sport/football/africa-cup-of-nations |
| FIFA Club World Cup | https://www.bbc.com/sport/football/club-world-cup |

**World Cup 2026** has a canonical module code: `WORLD_CUP_2026`

---

## Cup Competitions (BBC reference only — no module league code)

| Competition | BBC Website |
|------------|-------------|
| England — FA Cup | https://www.bbc.com/sport/football/fa-cup |
| England — EFL Cup | https://www.bbc.com/sport/football/league-cup |
| England — Community Shield | https://www.bbc.com/sport/football/community-shield |
| England — Women's Super League | https://www.bbc.com/sport/football/womens-super-league/table |
| England — Women's Championship | https://www.bbc.com/sport/football/womens-championship/table |
| France — Coupe de France | https://www.bbc.com/sport/football/coupe-de-france |
| Germany — DFB-Pokal | https://www.bbc.com/sport/football/dfb-pokal |
| Italy — Coppa Italia | https://www.bbc.com/sport/football/coppa-italia |
| Scotland — Scottish Cup | https://www.bbc.com/sport/football/scottish-cup |
| Scotland — League Cup | https://www.bbc.com/sport/football/scottish-league-cup |
| Scotland — Women's Premier League | https://www.bbc.com/sport/football/scottish-womens-premier-league/table |
| Spain — Copa del Rey | https://www.bbc.com/sport/football/copa-del-rey |

---

## Notes

- **⚠️ BBC 404 URLs**: Finland (Veikkausliiga), Greece (Super League), Norway (Eliteserien), and Romania (Liga I) are known to return HTTP 404 on BBC Sport. The module automatically falls back to Wikipedia or ESPN for these leagues. Re-check BBC Sport at the start of each new season in case coverage is restored.
- **🏆 Split-League Support**: Leagues marked with 🏆 split into Championship and Relegation groups mid-season. Once split, BBC Sport may show only one group or return a 404. The module detects this and escalates to Wikipedia automatically. Look for `[Multi-group]` in the terminal logs to confirm.
- **Intelligent Caching**: All successfully fetched data is cached to memory and disk. When BBC Sport is unavailable, the module serves the most recent cached data. Cache TTL is 24 hours; cleanup runs every 6 hours.
- **URL Stability**: BBC Sport occasionally restructures URLs between seasons. If a league stops updating, check the BBC Sport website directly and update `BBC_URL_MAP` in [`src/league-configs.js`](../src/league-configs.js).
- **Russia**: The Russian Premier League is not included — Russia is suspended from UEFA/FIFA competitions and BBC Sport no longer covers it.
