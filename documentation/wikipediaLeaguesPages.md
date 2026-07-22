# Wikipedia League Pages for MMM-MyTeams-LeagueTable

The module uses Wikipedia as its primary fallback for leagues not covered by BBC Sport. Wikipedia is preferred because it uses standard `wikitable` HTML that is highly reliable for scraping without JavaScript.

**Caution:** Check that each URL remain valid prior to each new season starting.

🏆 - Denotes that the League splits mid season.


## How to Find Wikipedia URLs

Wikipedia season pages follow a standard naming convention. Follow these steps to find a league URL for your config:

1.  Search Wikipedia for the current season of your league (e.g., "2026–27 Liga I").
2.  Ensure the page contains a "League table" section with a standard data table.
3.  Copy the URL from your browser's address bar. It should look like this:
    `https://en.wikipedia.org/wiki/2026%E2%80%9327_Liga_I`

> **Season note:** Most European leagues are on **2026–27**. Calendar-year leagues (Estonia, Finland, Iceland, Ireland, Japan, etc.) are on **2026**. Spring–Autumn leagues (Norway Eliteserien, Sweden Allsvenskan) are one cycle ahead: **2027**.

## Uefa European Competitions

| Country | League Name | Wikipedia Website | showLeague |
|---------|-------------|------------|------------|
| Europe | UEFA Champions League | https://en.wikipedia.org/wiki/2026–27_UEFA_Champions_League | UEFA_CHAMPIONS_LEAGUE |
| Europe | UEFA Europa League | https://en.wikipedia.org/wiki/2026–27_UEFA_Europa_League | UEFA_EUROPA_LEAGUE |
| Europe | UEFA Conference League | https://en.wikipedia.org/wiki/2026–27_UEFA_Conference_League | UEFA_EUROPA_CONFERENCE_LEAGUE |

## European Domestic Leagues - Tier 1

| Country | League Name | Wikipedia Website | showLeague |
|---------|-------------|------------|------------|
| Austria | Austrian Bundesliga 🏆 | https://en.wikipedia.org/wiki/2026–27_Austrian_Football_Bundesliga | AUSTRIA_BUNDESLIGA |
| Belgium | Belgian Pro League 🏆 | https://en.wikipedia.org/wiki/2026–27_Belgian_Pro_League | BELGIUM_PRO_LEAGUE |
| Croatia | Croatian HNL | https://en.wikipedia.org/wiki/2026–27_Croatian_Football_League | CROATIA_HNL |
| Cyprus | Cypriot First Division 🏆 | https://en.wikipedia.org/wiki/2026–27_Cypriot_First_Division | CYPRUS_FIRST_DIVISION |
| Czech Republic | Czech Liga | https://en.wikipedia.org/wiki/2026–27_Czech_First_League | CZECH_LIGA |
| Denmark | Superligaen 🏆 | https://en.wikipedia.org/wiki/2026–27_Danish_Superliga | DENMARK_SUPERLIGAEN |
| England | Premier League | https://en.wikipedia.org/wiki/2026–27_Premier_League | ENGLAND_PREMIER_LEAGUE |
| France | Ligue 1 | https://en.wikipedia.org/wiki/2026–27_Ligue_1 | FRANCE_LIGUE1 |
| Germany | Bundesliga | https://en.wikipedia.org/wiki/2026–27_Bundesliga | GERMANY_BUNDESLIGA |
| Greece | Super League Greece 🏆 | https://en.wikipedia.org/wiki/2026–27_Super_League_Greece | GREECE_SUPER_LEAGUE |
| Hungary | Hungarian NB I | https://en.wikipedia.org/wiki/2026–27_Nemzeti_Bajnokság_I | HUNGARY_NBI |
| Israel | Israeli Premier League 🏆 | https://en.wikipedia.org/wiki/2026–27_Israeli_Premier_League | ISRAEL_PREMIER_LEAGUE |
| Italy | Serie A | https://en.wikipedia.org/wiki/2026–27_Serie_A | ITALY_SERIE_A |
| Netherlands | Eredivisie | https://en.wikipedia.org/wiki/2026–27_Eredivisie | NETHERLANDS_EREDIVISIE |
| Northern Ireland | Irish Premiership | https://en.wikipedia.org/wiki/2026–27_NIFL_Premiership | NI_PREMIERSHIP |
| Norway | Eliteserien | https://en.wikipedia.org/wiki/2027_Eliteserien | NORWAY_ELITESERIEN |
| Poland | Ekstraklasa | https://en.wikipedia.org/wiki/2026–27_Ekstraklasa | POLAND_EKSTRAKLASA |
| Portugal | Primeira Liga | https://en.wikipedia.org/wiki/2026–27_Primeira_Liga | PORTUGAL_PRIMEIRA_LIGA |
| Republic of Ireland | Irish Premier Division | https://en.wikipedia.org/wiki/2026_League_of_Ireland_Premier_Division | IE_PREMIER_DIVISION |
| Romania | Liga I 🏆 | https://en.wikipedia.org/wiki/2026–27_Liga_I | ROMANIA_LIGA_I |
| Russia | Russian Premier League | https://en.wikipedia.org/wiki/2026–27_Russian_Premier_League | showRPL |
| Scotland | Scottish Premiership 🏆 | https://en.wikipedia.org/wiki/2026–27_Scottish_Premiership | SCOTLAND_PREMIERSHIP |
| Serbia | Serbian Super Liga 🏆 | https://en.wikipedia.org/wiki/2026–27_Serbian_SuperLiga | SERBIA_SUPER_LIGA |
| Spain | La Liga | https://en.wikipedia.org/wiki/2026–27_La_Liga | SPAIN_LA_LIGA |
| Sweden | Allsvenskan | https://en.wikipedia.org/wiki/2027_Allsvenskan | SWEDEN_ALLSVENSKAN |
| Switzerland | Swiss Super League 🏆 | https://en.wikipedia.org/wiki/2026–27_Swiss_Super_League | SWITZERLAND_SUPER_LEAGUE |
| Turkey | Süper Lig | https://en.wikipedia.org/wiki/2026–27_Süper_Lig | TURKEY_SUPER_LIG |
| Ukraine | Ukrainian Premier League | https://en.wikipedia.org/wiki/2026–27_Ukrainian_Premier_League | UKRAINE_PREMIER_LEAGUE |
| Wales | Cymru Premier 🏆 | https://en.wikipedia.org/wiki/2026–27_Cymru_Premier | WALES_PREMIER |

## European Domestic Leagues - Tier 2

| Country | League Name | Wikipedia Website | showLeague |
|---------|-------------|------------|------------|
| Austria | 2. Liga | https://en.wikipedia.org/wiki/2026–27_Austrian_Football_Second_League | showAustrian2Liga |
| Belgium | Challenger Pro League | https://en.wikipedia.org/wiki/2026–27_Challenger_Pro_League | showBelgianChallenger |
| Croatia | First NL | https://en.wikipedia.org/wiki/2026–27_First_Football_League_(Croatia) | showCroatiaFirstNL |
| Czech Republic | National Football League | https://en.wikipedia.org/wiki/2026–27_Czech_National_Football_League | showCzechFNL |
| Denmark | 1. Division | https://en.wikipedia.org/wiki/2026–27_Danish_1._Division | showDenmark1Div |
| England | Championship | https://en.wikipedia.org/wiki/2026–27_EFL_Championship | ENGLAND_CHAMPIONSHIP |
| France | Ligue 2 | https://en.wikipedia.org/wiki/2026–27_Ligue_2 | showLigue2 |
| Germany | 2. Bundesliga | https://en.wikipedia.org/wiki/2026–27_2._Bundesliga | showBundesliga2 |
| Greece | Super League 2 | https://en.wikipedia.org/wiki/2026–27_Super_League_Greece_2 | showGreekSuperLeague2 |
| Hungary | NB II | https://en.wikipedia.org/wiki/2026–27_Nemzeti_Bajnokság_II | showHungaryNB2 |
| Italy | Serie B | https://en.wikipedia.org/wiki/2026–27_Serie_B | showSerieB |
| Netherlands | Eerste Divisie | https://en.wikipedia.org/wiki/2026–27_Eerste_Divisie | showEersteDivisie |
| Northern Ireland | NIFL Championship | https://en.wikipedia.org/wiki/2026–27_NIFL_Championship | showNIChampionship |
| Norway | 1. divisjon | https://en.wikipedia.org/wiki/2027_Norwegian_First_Division | showNorway1Div |
| Poland | I liga | https://en.wikipedia.org/wiki/2026–27_I_liga | showPoland1Liga |
| Portugal | Liga Portugal 2 | https://en.wikipedia.org/wiki/2026–27_Liga_Portugal_2 | showLigaPortugal2 |
| Republic of Ireland | First Division | https://en.wikipedia.org/wiki/2026_League_of_Ireland_First_Division | showIEFirstDivision |
| Romania | Liga II | https://en.wikipedia.org/wiki/2026–27_Liga_II | showRomaniaLiga2 |
| Russia | First League | https://en.wikipedia.org/wiki/2026–27_Russian_First_League | showRussianFirstLeague |
| Scotland | Scottish Championship | https://en.wikipedia.org/wiki/2026–27_Scottish_Championship | SCOTLAND_CHAMPIONSHIP |
| Serbia | First League | https://en.wikipedia.org/wiki/2026–27_Serbian_First_League | showSerbiaFirstLeague |
| Spain | La Liga 2 | https://en.wikipedia.org/wiki/2026–27_Segunda_División | showLaLiga2 |
| Sweden | Superettan | https://en.wikipedia.org/wiki/2027_Superettan | showSuperettan |
| Switzerland | Challenge League | https://en.wikipedia.org/wiki/2026–27_Swiss_Challenge_League | showSwissChallengeLeague |
| Turkey | 1. Lig | https://en.wikipedia.org/wiki/2026–27_TFF_First_League | showTFF1Lig |
| Ukraine | First League | https://en.wikipedia.org/wiki/2026–27_Ukrainian_First_League | showUkrainianFirstLeague |
| Wales | Cymru South/North | https://en.wikipedia.org/wiki/2026–27_Cymru_South_/_Cymru_North | showWalesDiv1 |

## Non-European Leagues

| Country | League Name | BBC Website | showLeague |
|---------|-------------|------------|------------|
| Argentina | Primera División | https://en.wikipedia.org/wiki/2026_Argentine_Primera_División | ARGENTINA_PRIMERA |
| Australia | A-League Men | https://en.wikipedia.org/wiki/2026–27_A-League_Men | AUSTRALIA_A_LEAGUE |
| Bolivia | Liga 2 | https://en.wikipedia.org/wiki/2024_Copa_Sim%C3%B3n_Bol%C3%ADvar_(Bolivia) | BOLIVIA_LIGA_2 |
| Brazil | Brasileirão Serie A | https://en.wikipedia.org/wiki/2026_Campeonato_Brasileiro_Série_A | BRAZIL_SERIE_A |
| China | Chinese Super League | https://en.wikipedia.org/wiki/2026_Chinese_Super_League | CHINA_SUPER_LEAGUE |
| Japan | J1 League | https://en.wikipedia.org/wiki/2026_J1_League | JAPAN_J1_LEAGUE |
| Mexico | Liga MX | https://en.wikipedia.org/wiki/2026–27_Liga_MX_season | MEXICO_LIGA_MX |
| USA | Major League Soccer | https://en.wikipedia.org/wiki/2026_Major_League_Soccer_season | USA_MLS |

## Using Wikipedia in your Config

To explicitly use Wikipedia for a specific league, set the `provider` config option to `"wikipedia"`.

```javascript
{
    module: "MMM-MyTeams-LeagueTable",
    config: {
        provider: "wikipedia",
        selectedLeagues: ["ROMANIA_LIGA_I"],
    }
}
```

## Limitations

- **Multi-Group Splits (🏆)**: Wikipedia is the **primary source** for leagues that split into Championship and Relegation groups. The module uses a specialized multi-group parser to extract and display all tables simultaneously.
- **No Fixtures**: Wikipedia parsers only extract the league standings (Table). They do not support fixtures or scores.
- **Update Frequency**: Wikipedia is updated by volunteers; standings might be delayed compared to live sports sites like BBC or Soccerway.
- **Team Names**: Wikipedia often uses full official team names (e.g., "Fotbal Club FCSB" instead of "FCSB"). The module's normalization system handles most common variations, but you may need to add custom entries to `teamLogoMap` for some teams.
