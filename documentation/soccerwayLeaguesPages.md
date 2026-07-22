# Soccerway League Pages for MMM-MyTeams-LeagueTable

This module supports fetching league data from **Soccerway**, expanding its coverage to include leagues not found on BBC Sport (e.g., Romania's Liga 1 "SuperLiga").

**Caution:** Check that each URL remain valid prior to each new season starting.

🏆 - Denotes that the League splits mid season.


## How to Find Soccerway URLs

Soccerway URLs are more complex than BBC's because they contain internal IDs. Follow these steps to find a league URL for your config:

1.  Visit [int.soccerway.com](https://int.soccerway.com/).
2.  Navigate to your desired league (e.g., **Europe > Romania > Liga I**).
3.  Click on the **Table** tab if you're not already there.
4.  Copy the URL from your browser's address bar. It should look like this:
    `https://int.soccerway.com/national/romania/liga-i/20262027/regular-season/r81845/`

## Uefa European Competitions

| Country | League Name | "parser" Website | showLeague |
|---------|-------------|------------|------------|
| Europe | UEFA Champions League | https://int.soccerway.com/international/europe/uefa-champions-league/20262027/league-stage/ | UEFA_CHAMPIONS_LEAGUE |
| Europe | UEFA Europa League | https://int.soccerway.com/international/europe/uefa-cup/20262027/league-stage/ | UEFA_EUROPA_LEAGUE |
| Europe | UEFA Europa Conference League | https://int.soccerway.com/international/europe/uefa-europa-conference-league/20262027/league-stage/ | UEFA_EUROPA_CONFERENCE_LEAGUE |

## European Domestic Leagues - Tier 1

| Country | League Name | Wikipedia Website | showLeague |
|---------|-------------|------------|------------|
| Austria | Austrian Bundesliga 🏆 | https://int.soccerway.com/national/austria/bundesliga/20262027/regular-season/ | AUSTRIA_BUNDESLIGA |
| Belgium | Belgian Pro League 🏆 | https://int.soccerway.com/national/belgium/pro-league/20262027/regular-season/ | BELGIUM_PRO_LEAGUE |
| Croatia | Croatian HNL | https://int.soccerway.com/national/croatia/1-hnl/20262027/regular-season/ | CROATIA_HNL |
| Cyprus | Cypriot First Division 🏆 | https://int.soccerway.com/national/cyprus/first-division/ | CYPRUS_FIRST_DIVISION |
| Czech Republic | Czech Liga | https://int.soccerway.com/national/czech-republic/czech-liga/20262027/regular-season/ | CZECH_LIGA |
| Denmark | Superligaen 🏆 | https://int.soccerway.com/national/denmark/superliga/20262027/regular-season/ | DENMARK_SUPERLIGAEN |
| England | Premier League | https://int.soccerway.com/national/england/premier-league/20262027/regular-season/ | ENGLAND_PREMIER_LEAGUE |
| France | Ligue 1 | https://int.soccerway.com/national/france/ligue-1/20262027/regular-season/ | FRANCE_LIGUE1 |
| Germany | Bundesliga | https://int.soccerway.com/national/germany/bundesliga/20262027/regular-season/ | GERMANY_BUNDESLIGA |
| Greece | Greek Super League 🏆 | https://int.soccerway.com/national/greece/super-league/20262027/regular-season/ | GREECE_SUPER_LEAGUE |
| Hungary | Hungarian NB I | https://int.soccerway.com/national/hungary/nb-i/20262027/regular-season/ | HUNGARY_NBI |
| Israel | Israeli Premier League 🏆 | https://int.soccerway.com/national/israel/premier-league/ | ISRAEL_PREMIER_LEAGUE |
| Italy | Serie A | https://int.soccerway.com/national/italy/serie-a/20262027/regular-season/ | ITALY_SERIE_A |
| Netherlands | Eredivisie | https://int.soccerway.com/national/netherlands/eredivisie/20262027/regular-season/ | NETHERLANDS_EREDIVISIE |
| Northern Ireland | Irish Premiership | https://int.soccerway.com/national/northern-ireland/ifa-premiership/20262027/regular-season/ | NI_PREMIERSHIP |
| Norway | Eliteserien | https://int.soccerway.com/national/norway/eliteserien/2026/regular-season/ | NORWAY_ELITESERIEN |
| Poland | Ekstraklasa | https://int.soccerway.com/national/poland/ekstraklasa/20262027/regular-season/ | POLAND_EKSTRAKLASA |
| Portugal | Primeira Liga | https://int.soccerway.com/national/portugal/portuguese-liga-/20262027/regular-season/ | PORTUGAL_PRIMEIRA_LIGA |
| Republic of Ireland | Irish Premier Division | https://int.soccerway.com/national/republic-of-ireland/premier-division/2026/regular-season/ | IE_PREMIER_DIVISION |
| Romania | Liga I 🏆 | https://int.soccerway.com/national/romania/liga-i/20262027/regular-season/ | ROMANIA_LIGA_I |
| Russia | Russian Premier League | https://int.soccerway.com/national/russia/premier-league/20262027/regular-season/ | showRPL |
| Scotland | Scottish Premiership 🏆 | https://int.soccerway.com/national/scotland/premier-league/20262027/regular-season/ | SCOTLAND_PREMIERSHIP |
| Serbia | Serbian Super Liga 🏆 | https://int.soccerway.com/national/serbia/super-liga/20262027/regular-season/ | SERBIA_SUPER_LIGA |
| Spain | La Liga | https://int.soccerway.com/national/spain/primera-division/20262027/regular-season/ | SPAIN_LA_LIGA |
| Sweden | Allsvenskan | https://int.soccerway.com/national/sweden/allsvenskan/2026/regular-season/ | SWEDEN_ALLSVENSKAN |
| Switzerland | Swiss Super League 🏆 | https://int.soccerway.com/national/switzerland/super-league/20262027/regular-season/ | SWITZERLAND_SUPER_LEAGUE |
| Turkey | Turkish Super Lig | https://int.soccerway.com/national/turkey/super-lig/20262027/regular-season/ | TURKEY_SUPER_LIG |
| Ukraine | Ukrainian Premier League | https://int.soccerway.com/national/ukraine/premier-league/20262027/regular-season/ | UKRAINE_PREMIER_LEAGUE |
| Wales | Cymru Premier 🏆 | https://int.soccerway.com/national/wales/premier-league/20262027/regular-season/ | WALES_PREMIER |

## European Domestic Leagues - Tier 2

| Country | League Name | Wikipedia Website | showLeague |
|---------|-------------|------------|------------|
| Austria | 2. Liga | https://int.soccerway.com/national/austria/1-liga/20262027/regular-season/ | showAustrian2Liga |
| Belgium | Challenger Pro League | https://int.soccerway.com/national/belgium/second-division/20262027/regular-season/ | showBelgianChallenger |
| Croatia | First NL | https://int.soccerway.com/national/croatia/2-hnl/20262027/regular-season/ | showCroatiaFirstNL |
| Czech Republic | National Football League | https://int.soccerway.com/national/czech-republic/2-liga/20262027/regular-season/ | showCzechFNL |
| Denmark | 1. Division | https://int.soccerway.com/national/denmark/1st-division/20262027/regular-season/ | showDenmark1Div |
| England | Championship | https://int.soccerway.com/national/england/championship/20262027/regular-season/ | ENGLAND_CHAMPIONSHIP |
| France | Ligue 2 | https://int.soccerway.com/national/france/ligue-2/20262027/regular-season/ | showLigue2 |
| Germany | 2. Bundesliga | https://int.soccerway.com/national/germany/2-bundesliga/20262027/regular-season/ | showBundesliga2 |
| Greece | Super League 2 | https://int.soccerway.com/national/greece/football-league/20262027/regular-season/ | showGreekSuperLeague2 |
| Hungary | NB II | https://int.soccerway.com/national/hungary/nb-ii/20262027/regular-season/ | showHungaryNB2 |
| Italy | Serie B | https://int.soccerway.com/national/italy/serie-b/20262027/regular-season/ | showSerieB |
| Netherlands | Eerste Divisie | https://int.soccerway.com/national/netherlands/eerste-divisie/20262027/regular-season/ | showEersteDivisie |
| Northern Ireland | NIFL Championship | https://int.soccerway.com/national/northern-ireland/championship/20262027/regular-season/ | showNIChampionship |
| Norway | 1. divisjon | https://int.soccerway.com/national/norway/1-divisjon/2026/regular-season/ | showNorway1Div |
| Poland | I liga | https://int.soccerway.com/national/poland/i-liga/20262027/regular-season/ | showPoland1Liga |
| Portugal | Liga Portugal 2 | https://int.soccerway.com/national/portugal/liga-de-honra/20262027/regular-season/ | showLigaPortugal2 |
| Republic of Ireland | First Division | https://int.soccerway.com/national/republic-of-ireland/first-division/2026/regular-season/ | showIEFirstDivision |
| Romania | Liga II | https://int.soccerway.com/national/romania/liga-ii/20262027/regular-season/ | showRomaniaLiga2 |
| Russia | First League | https://int.soccerway.com/national/russia/1-division/20262027/regular-season/ | showRussianFirstLeague |
| Scotland | Scottish Championship | https://int.soccerway.com/national/scotland/first-division/20262027/regular-season/ | SCOTLAND_CHAMPIONSHIP |
| Serbia | First League | https://int.soccerway.com/national/serbia/prva-liga/20262027/regular-season/ | showSerbiaFirstLeague |
| Spain | La Liga 2 | https://int.soccerway.com/national/spain/segunda-division/20262027/regular-season/ | showLaLiga2 |
| Sweden | Superettan | https://int.soccerway.com/national/sweden/superettan/2026/regular-season/ | showSuperettan |
| Switzerland | Challenge League | https://int.soccerway.com/national/switzerland/challenge-league/20262027/regular-season/ | showSwissChallengeLeague |
| Turkey | 1. Lig | https://int.soccerway.com/national/turkey/1-lig/20262027/regular-season/ | showTFF1Lig |
| Ukraine | First League | https://int.soccerway.com/national/ukraine/1-division/20262027/regular-season/ | showUkrainianFirstLeague |
| Wales | FAW Championship | https://int.soccerway.com/national/wales/faw-championship/20262027/regular-season/ | showWalesDiv1 |

## Other Non European Domestic Leagues 

| Country | League Name | Wikipedia Website | showLeague |
|---------|-------------|------------|------------|
| Argentina | Primera División | https://int.soccerway.com/national/argentina/primera-division/2026/regular-season/ | ARGENTINA_PRIMERA |
| Australia | A-League Men | https://int.soccerway.com/national/australia/a-league/20262027/regular-season/ | AUSTRALIA_A_LEAGUE |
| Bolivia | Liga 2 | https://int.soccerway.com/national/bolivia/nacional-b/2024/regular-season/r80941/ | BOLIVIA_LIGA_2 |
| Brazil | Brasileirão Serie A | https://int.soccerway.com/national/brazil/serie-a/2026/regular-season/ | BRAZIL_SERIE_A |
| China | Chinese Super League | https://int.soccerway.com/national/china-pr/csl/2026/regular-season/ | CHINA_SUPER_LEAGUE |
| Japan | J1 League | https://int.soccerway.com/national/japan/j1-league/2026/regular-season/ | JAPAN_J1_LEAGUE |
| Mexico | Liga MX | https://int.soccerway.com/national/mexico/liga-mx/20262027/regular-season/ | MEXICO_LIGA_MX |
| USA | Major League Soccer | https://int.soccerway.com/national/united-states/mls/2026/regular-season/ | USA_MLS |

## Using Soccerway in your Config

To explicitly use Soccerway for a league, set the `provider` config option to `"soccerway"` and ensure you have a valid Soccerway URL (either internally mapped or via custom URL).

```javascript
{
    module: "MMM-MyTeams-LeagueTable",
    config: {
        provider: "soccerway", // Set to "soccerway" to prioritize Soccerway
        selectedLeagues: ["ROMANIA_LIGA_I"],
        // If a league is not in the internal mapping, you can use customUrls
    }
}
```

## Troubleshooting

- **No Data Found**: Ensure you are on the **Table** page of Soccerway. The URL must contain a table with the class `leaguetable`.
- **Parsing Errors**: Soccerway frequently updates its layout; check for module updates if parsing fails.
- **Team Names**: The module uses standard team name normalization, but some Soccerway names may differ slightly from BBC Sport. If team logos are missing, use the `teamLogoMap` to fix them.
