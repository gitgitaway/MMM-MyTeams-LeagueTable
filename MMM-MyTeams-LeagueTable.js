(() => {
  // src/constants.js
  var LEAGUE_TABS = {
    SCOTLAND_PREMIERSHIP: "SPFL",
    SCOTLAND_CHAMPIONSHIP: "SPFLC",
    ENGLAND_PREMIER_LEAGUE: "EPL",
    GERMANY_BUNDESLIGA: "BL",
    FRANCE_LIGUE1: "L1",
    SPAIN_LA_LIGA: "LAL",
    ITALY_SERIE_A: "SA",
    PORTUGAL_PRIMEIRA_LIGA: "PPL",
    BELGIUM_PRO_LEAGUE: "BPL",
    NETHERLANDS_EREDIVISIE: "ERE",
    GREECE_SUPER_LEAGUE: "GSL",
    TURKEY_SUPER_LIG: "TSL",
    UEFA_CHAMPIONS_LEAGUE: "UCL",
    UEFA_EUROPA_LEAGUE: "UEL",
    UEFA_EUROPA_CONFERENCE_LEAGUE: "ECL",
    WORLD_CUP_2026: "WC2026"
  };
  var LEAGUE_HEADERS = {
    SCOTLAND_PREMIERSHIP: "Scottish Premiership",
    SCOTLAND_CHAMPIONSHIP: "Scottish Championship",
    ENGLAND_PREMIER_LEAGUE: "Premier League",
    GERMANY_BUNDESLIGA: "Bundesliga",
    FRANCE_LIGUE1: "Ligue 1",
    SPAIN_LA_LIGA: "La Liga",
    ITALY_SERIE_A: "Serie A",
    PORTUGAL_PRIMEIRA_LIGA: "Primeira Liga",
    BELGIUM_PRO_LEAGUE: "Pro League",
    NETHERLANDS_EREDIVISIE: "Eredivisie",
    GREECE_SUPER_LEAGUE: "Super League Greece",
    TURKEY_SUPER_LIG: "S\xFCper Lig",
    UEFA_CHAMPIONS_LEAGUE: "Champions League",
    UEFA_EUROPA_LEAGUE: "Europa League",
    UEFA_EUROPA_CONFERENCE_LEAGUE: "Conference League",
    WORLD_CUP_2026: "FIFA World Cup 2026"
  };
  var COMMON_SUFFIXES = [
    "fc",
    "sc",
    "ac",
    "cf",
    "sk",
    "if",
    "bk",
    "fk",
    "ik",
    "aik",
    "afc",
    "vfb",
    "unt",
    "fn"
  ];
  var LEGACY_CODE_MAP = {
    SPFL: "SCOTLAND_PREMIERSHIP",
    SPFLC: "SCOTLAND_CHAMPIONSHIP",
    EPL: "ENGLAND_PREMIER_LEAGUE",
    UCL: "UEFA_CHAMPIONS_LEAGUE",
    UEL: "UEFA_EUROPA_LEAGUE",
    ECL: "UEFA_EUROPA_CONFERENCE_LEAGUE",
    CHAMPIONS_LEAGUE: "UEFA_CHAMPIONS_LEAGUE",
    EUROPA_LEAGUE: "UEFA_EUROPA_LEAGUE",
    EUROPA_CONFERENCE_LEAGUE: "UEFA_EUROPA_CONFERENCE_LEAGUE",
    WALES_PREMIER_LEAGUE: "CYMRU_PREMIER_LEAGUE"
  };
  var EUROPEAN_LEAGUES2 = [
    "UEFA_CHAMPIONS_LEAGUE",
    "UEFA_EUROPA_LEAGUE",
    "UEFA_EUROPA_CONFERENCE_LEAGUE"
  ];
  var TEAM_ALIASES = {
    "cabo verde": "Cape Verde",
    "cape verde islands": "Cape Verde",
    "ir iran": "Iran",
    "iran, islamic republic of": "Iran",
    "south korea": "Rep. of Korea",
    "korea republic": "Rep. of Korea",
    "korea, republic of": "Rep. of Korea",
    "c\xF4te d'ivoire": "Ivory Coast",
    "cote d'ivoire": "Ivory Coast",
    "bosnia-herzegovina": "Bosnia and Herzegovina",
    "bosnia & herzegovina": "Bosnia and Herzegovina",
    curacao: "Cura\xE7ao",
    usa: "United States",
    "united states (host)": "United States",
    "mexico (host)": "Mexico",
    "canada (host)": "Canada",
    "argentina (title holder)": "Argentina",
    "united states of america": "United States",
    czechia: "Czech Republic",
    "check republic": "Czech Republic",
    "congo dr": "DR Congo",
    "democratic republic of congo": "DR Congo",
    "rd congo": "DR Congo",
    "democratic republic of the congo": "DR Congo",
    t\u00FCrkiye: "Turkey",
    "north macedonia": "Macedonia",
    "viet nam": "Vietnam",
    eswatini: "Swaziland",
    Wales: "Cymru"
  };

  // src/league-configs.js
  var BBC_URL_MAP = {
    ALBANIA_KATEGORIA_SUPERIORE: "https://www.bbc.co.uk/sport/football/albanian-superliga/table",
    ALGERIA_LIGUE_1: "https://www.bbc.co.uk/sport/football/algerian-ligue-one/table",
    ANDORRA_PRIMERA_DIVISION: "https://www.bbc.co.uk/sport/football/andorran-primera-division/table",
    ARGENTINA_PRIMERA_DIVISION: "https://www.bbc.co.uk/sport/football/argentine-primera-division/table",
    ARMENIA_PREMIER_LEAGUE: "https://www.bbc.co.uk/sport/football/armenian-premier-league/table",
    AUSTRALIA_A_LEAGUE: "https://www.bbc.co.uk/sport/football/australian-a-league/table",
    AUSTRIA_BUNDESLIGA: "https://www.bbc.co.uk/sport/football/austrian-bundesliga/table",
    AZERBAIJAN_PREMIER_LEAGUE: "https://www.bbc.co.uk/sport/football/azerbaijan-premier-league/table",
    BELARUS_VYSSHAYA_LIGA: "https://www.bbc.co.uk/sport/football/belarusian-vysshaya-liga/table",
    BELGIUM_PRO_LEAGUE: "https://www.bbc.co.uk/sport/football/belgian-pro-league/table",
    BOLIVIA_LIGA_PRIMERA_DIVISION: "https://www.bbc.co.uk/sport/football/bolivian-primera-division/table",
    BOSNIA_AND_HERZEGOVINA_PREMIER_LEAGUE: "https://www.bbc.co.uk/sport/football/bosnian-premier-league/table",
    BRAZIL_SERIA_A: "https://www.bbc.co.uk/sport/football/brazilian-serie-a/table",
    CANADA_MLS: "https://www.bbc.co.uk/sport/football/major-league-soccer/table",
    CHINA_SUPER_LEAGUE: "https://www.bbc.co.uk/sport/football/chinese-super-league/table",
    CROATIA_HNL: "https://www.bbc.co.uk/sport/football/croatian-first-league/table",
    CYMRU_PREMIER_LEAGUE: "https://www.bbc.co.uk/sport/football/cymru-premier/table",
    CYPRUS_FIRST_DIVISION: "https://www.bbc.co.uk/sport/football/cypriot-first-division/table",
    CZECH_LIGA: "https://www.bbc.co.uk/sport/football/czech-liga/table",
    DENMARK_SUPERLIGA: "https://www.bbc.co.uk/sport/football/danish-superliga/table",
    ENGLAND_CHAMPIONSHIP: "https://www.bbc.co.uk/sport/football/english-championship/table",
    ENGLAND_PREMIER_LEAGUE: "https://www.bbc.co.uk/sport/football/premier-league/table",
    ESTONIA_MEISTRILIIGA: "https://www.bbc.co.uk/sport/football/estonian-meistriliiga/table",
    FAROE_ISLANDS_PREMIER_LEAGUE: "https://www.bbc.co.uk/sport/football/faroe-islands-premier-league/table",
    FRANCE_LIGUE1: "https://www.bbc.co.uk/sport/football/french-ligue-one/table",
    GEORGIA_EROVNULI_LIGA: "https://www.bbc.co.uk/sport/football/georgian-erovnuli-liga/table",
    GERMANY_BUNDESLIGA: "https://www.bbc.co.uk/sport/football/german-bundesliga/table",
    GREECE_SUPER_LEAGUE: "https://www.bbc.co.uk/sport/football/greek-superleague/table",
    HUNGARY_NBI: "https://www.bbc.co.uk/sport/football/hungarian-nb-i/table",
    ICELAND_PREMIER_LEAGUE: "https://www.bbc.co.uk/sport/football/icelandic-premier-league/table",
    IRELAND_PREMIER_LEAGUE: "https://www.bbc.co.uk/sport/football/irish-premier-league/table",
    ISRAEL_PREMIER_LEAGUE: "https://www.bbc.co.uk/sport/football/israeli-premier-league/table",
    ITALY_SERIE_A: "https://www.bbc.co.uk/sport/football/italian-serie-a/table",
    JAPAN_J1_LEAGUE: "https://www.bbc.co.uk/sport/football/japanese-j1-league/table",
    KAZAKHSTAN_PREMIER_LEAGUE: "https://www.bbc.co.uk/sport/football/kazakhstan-premier-league/table",
    LATVIA_VIRSLIGA: "https://www.bbc.co.uk/sport/football/latvian-virsliga/table",
    LITHUANIA_A_LYGA: "https://www.bbc.co.uk/sport/football/lithuanian-a-lyga/table",
    MEXICO_LIGA_MX: "https://www.bbc.co.uk/sport/football/mexican-liga-mx/table",
    MOLDOVA_SUPER_LIGA: "https://www.bbc.co.uk/sport/football/moldovan-super-liga/table",
    MONTENEGRO_FIRST_LEAGUE: "https://www.bbc.co.uk/sport/football/montenegrin-first-league/table",
    MOROCCO_BOTOLA_PRO: "https://www.bbc.co.uk/sport/football/moroccan-botola-pro/table",
    NETHERLANDS_EREDIVISIE: "https://www.bbc.co.uk/sport/football/dutch-eredivisie/table",
    NORTH_MACEDONIA_FIRST_LEAGUE: "https://www.bbc.co.uk/sport/football/macedonian-first-league/table",
    NORTHERN_IRELAND_PREMIER_LEAGUE: "https://www.bbc.co.uk/sport/football/northern-ireland-premier-league/table",
    NORWAY_ELITESERIEN: "https://www.bbc.co.uk/sport/football/norwegian-tippeligaen/table",
    POLAND_EKSTRAKLASA: "https://www.bbc.co.uk/sport/football/polish-ekstraklasa/table",
    PORTUGAL_PRIMEIRA_LIGA: "https://www.bbc.co.uk/sport/football/portuguese-primeira-liga/table",
    SCOTLAND_CHAMPIONSHIP: "https://www.bbc.co.uk/sport/football/scottish-championship/table",
    SCOTLAND_PREMIERSHIP: "https://www.bbc.co.uk/sport/football/scottish-premiership/table",
    SERBIA_SUPER_LIGA: "https://www.bbc.co.uk/sport/football/serbian-super-lig/table",
    SOUTH_AFRICA_PREMIER_DIVISION: "https://www.bbc.co.uk/sport/football/south-african-premier-division/table",
    SOUTH_KOREA_K_LEAGUE_1: "https://www.bbc.co.uk/sport/football/south-korean-k-league-1/table",
    SPAIN_LA_LIGA: "https://www.bbc.co.uk/sport/football/spanish-la-liga/table",
    SWEDEN_ALLSVENSKAN: "https://www.bbc.co.uk/sport/football/swedish-allsvenskan/table",
    SWITZERLAND_SUPER_LEAGUE: "https://www.bbc.co.uk/sport/football/swiss-super-league/table",
    TUNISIA_LIGUE_1: "https://www.bbc.co.uk/sport/football/tunisian-ligue-one/table",
    TURKEY_SUPER_LIG: "https://www.bbc.co.uk/sport/football/turkish-super-lig/table",
    UKRAINE_PREMIER_LEAGUE: "https://www.bbc.co.uk/sport/football/ukrainian-premier-league/table",
    USA_MLS: "https://www.bbc.co.uk/sport/football/major-league-soccer/table",
    UEFA_CHAMPIONS_LEAGUE: {
      table: "https://www.bbc.co.uk/sport/football/champions-league/table",
      fixtures: "https://www.bbc.co.uk/sport/football/champions-league/scores-fixtures"
    },
    UEFA_EUROPA_CONFERENCE_LEAGUE: {
      table: "https://www.bbc.co.uk/sport/football/europa-conference-league/table",
      fixtures: "https://www.bbc.co.uk/sport/football/europa-conference-league/scores-fixtures"
    },
    UEFA_EUROPA_LEAGUE: {
      table: "https://www.bbc.co.uk/sport/football/europa-league/table",
      fixtures: "https://www.bbc.co.uk/sport/football/europa-league/scores-fixtures"
    },
    WORLD_CUP_2026: [
      "https://www.bbc.co.uk/sport/football/world-cup/scores-fixtures/2026-06",
      "https://www.bbc.co.uk/sport/football/world-cup/scores-fixtures/2026-07"
    ],
    ECL: {
      table: "https://www.bbc.co.uk/sport/football/europa-conference-league/table",
      fixtures: "https://www.bbc.co.uk/sport/football/europa-conference-league/scores-fixtures"
    },
    UCL: {
      table: "https://www.bbc.co.uk/sport/football/champions-league/table",
      fixtures: "https://www.bbc.co.uk/sport/football/champions-league/scores-fixtures"
    },
    UEL: {
      table: "https://www.bbc.co.uk/sport/football/europa-league/table",
      fixtures: "https://www.bbc.co.uk/sport/football/europa-league/scores-fixtures"
    }
  };
  var WIKIPEDIA_URL_MAP = {
    ALBANIA_KATEGORIA_SUPERIORE: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Kategoria_Superiore",
    ALGERIA_LIGUE_1: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Algerian_Ligue_1",
    ANDORRA_PRIMERA_DIVISION: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Andorran_Premier_League",
    ARGENTINA_PRIMERA_DIVISION: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Argentine_Primera_Division",
    ARMENIA_PREMIER_LEAGUE: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Armenian_Premier_League",
    AUSTRALIA_A_LEAGUE: "https://en.wikipedia.org/wiki/2026%E2%80%9327_A-League_Men%27s_competition",
    AUSTRIA_BUNDESLIGA: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Austrian_Football_Bundesliga",
    AZERBAIJAN_PREMIER_LEAGUE: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Azerbaijan_Premier_League",
    BELARUS_VYSSHAYA_LIGA: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Belarusian_Premier_League",
    BELGIUM_PRO_LEAGUE: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Belgian_Pro_League",
    BOLIVIA_LIGA_PRIMERA_DIVISION: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Bolivian_Primera_Division",
    BOSNIA_AND_HERZEGOVINA_PREMIER_LEAGUE: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Bosnian_Premier_League",
    BRAZIL_SERIA_A: "https://en.wikipedia.org/wiki/2026_in_Brazilian_football#Campeonato_Brasileiro_S%C3%A9rie_A",
    CANADA_MLS: "https://en.wikipedia.org/wiki/2026_Major_League_Soccer_season",
    CHINA_SUPER_LEAGUE: "https://en.wikipedia.org/wiki/2026_Chinese_Super_League",
    CROATIA_HNL: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Croatian_Football_League",
    CYMRU_PREMIER_LEAGUE: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Cymru_Premier",
    CYPRUS_FIRST_DIVISION: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Cypriot_First_Division",
    CZECH_LIGA: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Czech_First_League",
    DENMARK_SUPERLIGA: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Danish_Superliga",
    ENGLAND_CHAMPIONSHIP: "https://en.wikipedia.org/wiki/2026%E2%80%9327_EFL_Championship",
    ENGLAND_PREMIER_LEAGUE: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Premier_League",
    ESTONIA_MEISTRILIIGA: "https://en.wikipedia.org/wiki/2026_Meistriliiga",
    FAROE_ISLANDS_PREMIER_LEAGUE: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Faroe_Islands_Premier_League",
    FINLAND_VEIKKAUSLIIGA: "https://en.wikipedia.org/wiki/2026_Veikkausliiga",
    FRANCE_LIGUE1: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Ligue_1",
    GEORGIA_EROVNULI_LIGA: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Erovnuli_Liga",
    GERMANY_BUNDESLIGA: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Bundesliga",
    GREECE_SUPER_LEAGUE: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Super_League_Greece",
    HUNGARY_NBI: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Nemzeti_Bajnoks%C3%A1g_I",
    ICELAND_PREMIER_LEAGUE: "https://en.wikipedia.org/wiki/2026_%C3%9Arvalsdeild_karla",
    IRELAND_PREMIER_LEAGUE: "https://en.wikipedia.org/wiki/2026_League_of_Ireland_Premier_Division",
    ISRAEL_PREMIER_LEAGUE: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Israeli_Premier_League",
    ITALY_SERIE_A: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Serie_A",
    JAPAN_J1_LEAGUE: "https://en.wikipedia.org/wiki/2026_J1_League",
    KAZAKHSTAN_PREMIER_LEAGUE: "https://en.wikipedia.org/wiki/2026_Kazakhstan_Premier_League",
    LATVIA_VIRSLIGA: "https://en.wikipedia.org/wiki/2026_Virsliga",
    LITHUANIA_A_LYGA: "https://en.wikipedia.org/wiki/2026_A_Lyga",
    MEXICO_LIGA_MX: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Liga_MX",
    MOLDOVA_SUPER_LIGA: "https://en.wikipedia.org/wiki/2026_Moldovan_National_Division",
    MONTENEGRO_FIRST_LEAGUE: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Montenegrin_First_League",
    MOROCCO_BOTOLA_PRO: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Botola_Pro",
    NETHERLANDS_EREDIVISIE: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Eredivisie",
    NORTH_MACEDONIA_FIRST_LEAGUE: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Macedonian_First_League",
    NORTHERN_IRELAND_PREMIER_LEAGUE: "https://en.wikipedia.org/wiki/2026%E2%80%9327_NIFL_Premiership",
    NORWAY_ELITESERIEN: "https://en.wikipedia.org/wiki/2027_Eliteserien",
    POLAND_EKSTRAKLASA: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Ekstraklasa",
    PORTUGAL_PRIMEIRA_LIGA: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Primeira_Liga",
    ROMANIA_LIGA_I: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Liga_I",
    SCOTLAND_CHAMPIONSHIP: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Scottish_Championship",
    SCOTLAND_PREMIERSHIP: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Scottish_Premiership",
    SERBIA_SUPER_LIGA: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Serbian_SuperLiga",
    SOUTH_AFRICA_PREMIER_DIVISION: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Premier_Soccer_League",
    SOUTH_KOREA_K_LEAGUE_1: "https://en.wikipedia.org/wiki/2026_K_League_1",
    SPAIN_LA_LIGA: "https://en.wikipedia.org/wiki/2026%E2%80%9327_La_Liga",
    SWEDEN_ALLSVENSKAN: "https://en.wikipedia.org/wiki/2027_Allsvenskan",
    SWITZERLAND_SUPER_LEAGUE: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Swiss_Super_League",
    TUNISIA_LIGUE_1: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Tunisian_Ligue_1",
    TURKEY_SUPER_LIG: "https://en.wikipedia.org/wiki/2026%E2%80%9327_S%C3%BCper_Lig",
    UKRAINE_PREMIER_LEAGUE: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Ukrainian_Premier_League",
    USA_MLS: "https://en.wikipedia.org/wiki/2026_Major_League_Soccer_season",
    WALES_PREMIER_LEAGUE: "https://en.wikipedia.org/wiki/2026%E2%80%9327_Cymru_Premier",
    UEFA_CHAMPIONS_LEAGUE: "https://en.wikipedia.org/wiki/2026%E2%80%9327_UEFA_Champions_League",
    UEFA_EUROPA_CONFERENCE_LEAGUE: "https://en.wikipedia.org/wiki/2026%E2%80%9327_UEFA_Conference_League",
    UEFA_EUROPA_LEAGUE: "https://en.wikipedia.org/wiki/2026%E2%80%9327_UEFA_Europa_League",
    WORLD_CUP_2026: "https://en.wikipedia.org/wiki/2026_FIFA_World_Cup"
  };
  var SOCCERWAY_URL_MAP = {
    AUSTRIA_BUNDESLIGA: "https://int.soccerway.com/national/austria/bundesliga/20262027/regular-season/r00000/",
    CYMRU_PREMIER_LEAGUE: "https://int.soccerway.com/national/wales/cymru-premier/20262027/regular-season/r00000/",
    ENGLAND_PREMIER_LEAGUE: "https://int.soccerway.com/national/england/premier-league/20262027/regular-season/r00000/",
    FRANCE_LIGUE1: "https://int.soccerway.com/national/france/ligue-1/20262027/regular-season/r00000/",
    GERMANY_BUNDESLIGA: "https://int.soccerway.com/national/germany/bundesliga/20262027/regular-season/r00000/",
    GREECE_SUPER_LEAGUE: "https://int.soccerway.com/national/greece/super-league/20262027/regular-season/r00000/",
    ITALY_SERIE_A: "https://int.soccerway.com/national/italy/serie-a/20262027/regular-season/r00000/",
    NORWAY_ELITESERIEN: "https://int.soccerway.com/national/norway/eliteserien/2026/regular-season/r00000/",
    SCOTLAND_PREMIERSHIP: "https://int.soccerway.com/national/scotland/premier-league/20262027/regular-season/r00000/",
    SPAIN_LA_LIGA: "https://int.soccerway.com/national/spain/primera-division/20262027/regular-season/r00000/"
  };
  var GOOGLE_URL_MAP = {
    ALBANIA_KATEGORIA_SUPERIORE: "https://www.google.com/search?q=Albania+Kategoria+Superiore+table+standings+2026-27",
    ALGERIA_LIGUE_1: "https://www.google.com/search?q=Algeria+Ligue+1+table+standings+2026-27",
    ANDORRA_PRIMERA_DIVISION: "https://www.google.com/search?q=Andorra+Primera+Divisio+table+standings+2026-27",
    ARGENTINA_PRIMERA_DIVISION: "https://www.google.com/search?q=Argentine+Primera+Division+table+standings+2026-27",
    ARMENIA_PREMIER_LEAGUE: "https://www.google.com/search?q=Armenian+Premier+League+table+standings+2026-27",
    AUSTRALIA_A_LEAGUE: "https://www.google.com/search?q=Australia+A-League+table+standings+2026-27",
    AUSTRIA_BUNDESLIGA: "https://www.google.com/search?q=Austrian+Bundesliga+table+standings+2026-27",
    AZERBAIJAN_PREMIER_LEAGUE: "https://www.google.com/search?q=Azerbaijan+Premier+League+table+standings+2026-27",
    BELARUS_VYSSHAYA_LIGA: "https://www.google.com/search?q=Belarus+Vysshaya+Liga+table+standings+2026-27",
    BELGIUM_PRO_LEAGUE: "https://www.google.com/search?q=Belgian+Pro+League+table+standings+2026-27",
    BOLIVIA_LIGA_PRIMERA_DIVISION: "https://www.google.com/search?q=Bolivia+Primera+Division+table+standings+2026-27",
    BOSNIA_AND_HERZEGOVINA_PREMIER_LEAGUE: "https://www.google.com/search?q=Bosnia+Premier+League+table+standings+2026-27",
    BRAZIL_SERIA_A: "https://www.google.com/search?q=Brazilian+Serie+A+table+standings+2027",
    CANADA_MLS: "https://www.google.com/search?q=MLS+Major+League+Soccer+table+standings+2027",
    CHINA_SUPER_LEAGUE: "https://www.google.com/search?q=China+Super+League+table+standings+2027",
    CROATIA_HNL: "https://www.google.com/search?q=Croatia+HNL+table+standings+2026-27",
    CYMRU_PREMIER_LEAGUE: "https://www.google.com/search?q=Cymru+Premier+League+table+standings+2026-27",
    CYPRUS_FIRST_DIVISION: "https://www.google.com/search?q=Cyprus+First+Division+table+standings+2026-27",
    CZECH_LIGA: "https://www.google.com/search?q=Czech+First+Liga+table+standings+2026-27",
    DENMARK_SUPERLIGA: "https://www.google.com/search?q=Danish+Superliga+table+standings+2026-27",
    ENGLAND_CHAMPIONSHIP: "https://www.google.com/search?q=EFL+Championship+table+standings+2026-27",
    ENGLAND_PREMIER_LEAGUE: "https://www.google.com/search?q=Premier+League+table+standings+2026-27",
    ESTONIA_MEISTRILIIGA: "https://www.google.com/search?q=Estonian+Meistriliiga+table+standings+2027",
    FAROE_ISLANDS_PREMIER_LEAGUE: "https://www.google.com/search?q=Faroe+Islands+Premier+League+table+standings+2026-27",
    FINLAND_VEIKKAUSLIIGA: "https://www.google.com/search?q=Finland+Veikkausliiga+table+standings+2027",
    FRANCE_LIGUE1: "https://www.google.com/search?q=Ligue+1+table+standings+2026-27",
    GEORGIA_EROVNULI_LIGA: "https://www.google.com/search?q=Georgia+Erovnuli+Liga+table+standings+2026-27",
    GERMANY_BUNDESLIGA: "https://www.google.com/search?q=Bundesliga+table+standings+2026-27",
    GREECE_SUPER_LEAGUE: "https://www.google.com/search?q=Greek+Super+League+table+standings+2026-27",
    HUNGARY_NBI: "https://www.google.com/search?q=Hungarian+NB+I+table+standings+2026-27",
    ICELAND_PREMIER_LEAGUE: "https://www.google.com/search?q=Iceland+Urvalsdeild+table+standings+2027",
    IRELAND_PREMIER_LEAGUE: "https://www.google.com/search?q=League+of+Ireland+Premier+Division+table+standings+2027",
    ISRAEL_PREMIER_LEAGUE: "https://www.google.com/search?q=Israeli+Premier+League+table+standings+2026-27",
    ITALY_SERIE_A: "https://www.google.com/search?q=Serie+A+table+standings+2026-27",
    JAPAN_J1_LEAGUE: "https://www.google.com/search?q=J1+League+table+standings+2027",
    KAZAKHSTAN_PREMIER_LEAGUE: "https://www.google.com/search?q=Kazakhstan+Premier+League+table+standings+2027",
    LATVIA_VIRSLIGA: "https://www.google.com/search?q=Latvian+Virsliga+table+standings+2027",
    LITHUANIA_A_LYGA: "https://www.google.com/search?q=Lithuanian+A+Lyga+table+standings+2027",
    MEXICO_LIGA_MX: "https://www.google.com/search?q=Liga+MX+table+standings+2026-27",
    MOLDOVA_SUPER_LIGA: "https://www.google.com/search?q=Moldovan+National+Division+table+standings+2027",
    MONTENEGRO_FIRST_LEAGUE: "https://www.google.com/search?q=Montenegrin+First+League+table+standings+2026-27",
    MOROCCO_BOTOLA_PRO: "https://www.google.com/search?q=Morocco+Botola+Pro+table+standings+2026-27",
    NETHERLANDS_EREDIVISIE: "https://www.google.com/search?q=Eredivisie+table+standings+2026-27",
    NORTH_MACEDONIA_FIRST_LEAGUE: "https://www.google.com/search?q=North+Macedonia+First+League+table+standings+2026-27",
    NORTHERN_IRELAND_PREMIER_LEAGUE: "https://www.google.com/search?q=Northern+Ireland+Premiership+table+standings+2026-27",
    NORWAY_ELITESERIEN: "https://www.google.com/search?q=Eliteserien+table+standings+2027",
    POLAND_EKSTRAKLASA: "https://www.google.com/search?q=Ekstraklasa+table+standings+2026-27",
    PORTUGAL_PRIMEIRA_LIGA: "https://www.google.com/search?q=Primeira+Liga+table+standings+2026-27",
    ROMANIA_LIGA_I: "https://www.google.com/search?q=Romanian+Superliga+table+standings+2026-27",
    SCOTLAND_CHAMPIONSHIP: "https://www.google.com/search?q=Scottish+Championship+table+standings+2026-27",
    SCOTLAND_PREMIERSHIP: "https://www.google.com/search?q=Scottish+Premiership+table+standings+2026-27",
    SERBIA_SUPER_LIGA: "https://www.google.com/search?q=Serbian+SuperLiga+table+standings+2026-27",
    SOUTH_AFRICA_PREMIER_DIVISION: "https://www.google.com/search?q=South+Africa+Premier+Soccer+League+table+standings+2026-27",
    SOUTH_KOREA_K_LEAGUE_1: "https://www.google.com/search?q=K+League+1+table+standings+2027",
    SPAIN_LA_LIGA: "https://www.google.com/search?q=La+Liga+table+standings+2026-27",
    SWEDEN_ALLSVENSKAN: "https://www.google.com/search?q=Allsvenskan+table+standings+2027",
    SWITZERLAND_SUPER_LEAGUE: "https://www.google.com/search?q=Swiss+Super+League+table+standings+2026-27",
    TUNISIA_LIGUE_1: "https://www.google.com/search?q=Tunisian+Ligue+1+table+standings+2026-27",
    TURKEY_SUPER_LIG: "https://www.google.com/search?q=Turkish+Super+Lig+table+standings+2026-27",
    UKRAINE_PREMIER_LEAGUE: "https://www.google.com/search?q=Ukrainian+Premier+League+table+standings+2026-27",
    USA_MLS: "https://www.google.com/search?q=MLS+Major+League+Soccer+table+standings+2027",
    WALES_PREMIER_LEAGUE: "https://www.google.com/search?q=Cymru+Premier+League+table+standings+2026-27",
    UEFA_CHAMPIONS_LEAGUE: "https://www.google.com/search?q=UEFA+Champions+League+group+standings+2026-27",
    UEFA_EUROPA_CONFERENCE_LEAGUE: "https://www.google.com/search?q=UEFA+Conference+League+standings+2026-27",
    UEFA_EUROPA_LEAGUE: "https://www.google.com/search?q=UEFA+Europa+League+standings+2026-27",
    WORLD_CUP_2026: "https://www.google.com/search?q=FIFA+World+Cup+2026+group+standings"
  };
  var ESPN_URL_MAP = {
    ARGENTINA_PRIMERA_DIVISION: "https://www.espn.com/soccer/standings/_/league/arg.1",
    AUSTRALIA_A_LEAGUE: "https://www.espn.com/soccer/standings/_/league/aus.1",
    AUSTRIA_BUNDESLIGA: "https://www.espn.com/soccer/standings/_/league/aut.1",
    BELGIUM_PRO_LEAGUE: "https://www.espn.com/soccer/standings/_/league/bel.1",
    BRAZIL_SERIA_A: "https://www.espn.com/soccer/standings/_/league/bra.1",
    CANADA_MLS: "https://www.espn.com/soccer/standings/_/league/usa.1",
    CROATIA_HNL: "https://www.espn.com/soccer/standings/_/league/cro.1",
    CYMRU_PREMIER_LEAGUE: "https://www.espn.com/soccer/standings/_/league/wal.1",
    CYPRUS_FIRST_DIVISION: "https://www.espn.com/soccer/standings/_/league/cyp.1",
    CZECH_LIGA: "https://www.espn.com/soccer/standings/_/league/cze.1",
    DENMARK_SUPERLIGA: "https://www.espn.com/soccer/standings/_/league/den.1",
    ENGLAND_CHAMPIONSHIP: "https://www.espn.com/soccer/standings/_/league/eng.2",
    ENGLAND_PREMIER_LEAGUE: "https://www.espn.com/soccer/standings/_/league/eng.1",
    FRANCE_LIGUE1: "https://www.espn.com/soccer/standings/_/league/fra.1",
    GERMANY_BUNDESLIGA: "https://www.espn.com/soccer/standings/_/league/ger.1",
    GREECE_SUPER_LEAGUE: "https://www.espn.com/soccer/standings/_/league/gre.1",
    HUNGARY_NBI: "https://www.espn.com/soccer/standings/_/league/hun.1",
    ISRAEL_PREMIER_LEAGUE: "https://www.espn.com/soccer/standings/_/league/isr.1",
    ITALY_SERIE_A: "https://www.espn.com/soccer/standings/_/league/ita.1",
    JAPAN_J1_LEAGUE: "https://www.espn.com/soccer/standings/_/league/jpn.1",
    MEXICO_LIGA_MX: "https://www.espn.com/soccer/standings/_/league/mex.1",
    NETHERLANDS_EREDIVISIE: "https://www.espn.com/soccer/standings/_/league/ned.1",
    NORWAY_ELITESERIEN: "https://www.espn.com/soccer/standings/_/league/nor.1",
    POLAND_EKSTRAKLASA: "https://www.espn.com/soccer/standings/_/league/pol.1",
    PORTUGAL_PRIMEIRA_LIGA: "https://www.espn.com/soccer/standings/_/league/por.1",
    ROMANIA_LIGA_I: "https://www.espn.com/soccer/standings/_/league/rou.1",
    SCOTLAND_CHAMPIONSHIP: "https://www.espn.com/soccer/standings/_/league/sco.2",
    SCOTLAND_PREMIERSHIP: "https://www.espn.com/soccer/standings/_/league/sco.1",
    SERBIA_SUPER_LIGA: "https://www.espn.com/soccer/standings/_/league/srb.1",
    SOUTH_KOREA_K_LEAGUE_1: "https://www.espn.com/soccer/standings/_/league/kor.1",
    SPAIN_LA_LIGA: "https://www.espn.com/soccer/standings/_/league/esp.1",
    SWEDEN_ALLSVENSKAN: "https://www.espn.com/soccer/standings/_/league/swe.1",
    SWITZERLAND_SUPER_LEAGUE: "https://www.espn.com/soccer/standings/_/league/sui.1",
    TURKEY_SUPER_LIG: "https://www.espn.com/soccer/standings/_/league/tur.1",
    UKRAINE_PREMIER_LEAGUE: "https://www.espn.com/soccer/standings/_/league/ukr.1",
    USA_MLS: "https://www.espn.com/soccer/standings/_/league/usa.1",
    UEFA_CHAMPIONS_LEAGUE: "https://www.espn.com/soccer/standings/_/league/uefa.champions",
    UEFA_EUROPA_CONFERENCE_LEAGUE: "https://www.espn.com/soccer/standings/_/league/uefa.europa.conf",
    UEFA_EUROPA_LEAGUE: "https://www.espn.com/soccer/standings/_/league/uefa.europa",
    ECL: "https://www.espn.com/soccer/standings/_/league/uefa.europa.conf",
    UCL: "https://www.espn.com/soccer/standings/_/league/uefa.champions",
    UEL: "https://www.espn.com/soccer/standings/_/league/uefa.europa"
  };
  var LEAGUE_SPLITS = {
    ROMANIA_LIGA_I: {
      regularSeasonGames: 30,
      championshipSize: 6,
      relegationSize: 10,
      pointsCarryover: "halved",
      showAllGroups: true,
      groups: [
        { label: "Play-off Group", size: 6, keywords: ["play-off table", "play-off round", "playoff table", "playoff round", "championship round", "championship group", "championship table"] },
        { label: "Play-out Group", size: 10, keywords: ["play-out table", "play-out round", "relegation round", "relegation group", "relegation table"] }
      ],
      championshipKeywords: ["championship round", "championship group", "playoff round", "play-off round", "play-off table", "playoff table"],
      relegationKeywords: ["relegation round", "relegation group", "play-out round", "play-out table"],
      preferGroup: "championship"
    },
    SCOTLAND_PREMIERSHIP: {
      regularSeasonGames: 33,
      championshipSize: 6,
      relegationSize: 6,
      pointsCarryover: "all",
      showAllGroups: true,
      groups: [
        { label: "Top Six", size: 6, keywords: ["2nd phase championship group", "2nd phase champions group", "championship group", "championship round", "championship table", "top six", "top 6", "upper tier"] },
        { label: "Bottom Six", size: 6, keywords: ["2nd phase relegation group", "2nd phase relegate", "relegation group", "relegation round", "relegation table", "bottom six", "bottom 6", "lower tier"] }
      ],
      championshipKeywords: ["2nd phase championship group", "championship group", "championship round", "championship table", "top six", "top 6", "upper tier"],
      relegationKeywords: ["2nd phase relegation group", "relegation group", "relegation round", "relegation table", "bottom six", "bottom 6", "lower tier"],
      preferGroup: "championship"
    },
    AUSTRIA_BUNDESLIGA: {
      regularSeasonGames: 22,
      championshipSize: 6,
      relegationSize: 6,
      pointsCarryover: "halved",
      showAllGroups: true,
      groups: [
        { label: "Championship Group", size: 6, keywords: ["meisterrunde", "meister-gruppe", "meistergruppe", "championship round", "championship group", "championship table"] },
        { label: "Relegation Group", size: 6, keywords: ["relegationsrunde", "relegation group", "relegation round", "qualifikationsgruppe", "bottom group", "relegation table"] }
      ],
      championshipKeywords: ["meisterrunde", "meister-gruppe", "meistergruppe", "top group", "meistergruppe table"],
      relegationKeywords: ["relegation round", "relegation group", "qualifikationsgruppe", "bottom group", "qualifikationsgruppe table"],
      preferGroup: "championship"
    },
    BELGIUM_PRO_LEAGUE: {
      regularSeasonGames: 30,
      championshipSize: 6,
      relegationSize: 10,
      pointsCarryover: "halved",
      showAllGroups: true,
      groups: [
        { label: "Champions' Play-offs", size: 6, keywords: ["champions' play-offs", "champions play-offs", "championship play-offs", "championship playoff", "championship group", "championship round", "top 6", "po1", "play-offs i", "playoffs i"] },
        { label: "Europa Play-offs", size: 6, keywords: ["europa play-offs", "europe play-offs", "europa playoffs", "po2", "play-offs ii", "playoffs ii", "europa league play-offs", "conference league play-offs"] },
        { label: "Relegation Play-offs", size: 4, keywords: ["relegation play-offs", "relegation playoff", "relegation group", "bottom 4", "relegation table"] }
      ],
      championshipKeywords: ["champions' play-offs", "champions play-offs", "championship play-offs", "championship playoff", "championship round", "top 6", "championship table"],
      relegationKeywords: ["relegation play-offs", "relegation group", "bottom group", "relegation table"],
      preferGroup: "championship"
    },
    SWITZERLAND_SUPER_LEAGUE: {
      regularSeasonGames: 33,
      championshipSize: 6,
      relegationSize: 6,
      pointsCarryover: "all",
      showAllGroups: true,
      groups: [
        { label: "Championship Group", size: 6, keywords: ["meisterrunde", "championship group", "championship round", "top 6", "championship table"] },
        { label: "Relegation Group", size: 6, keywords: ["abstiegsrunde", "relegation group", "relegation round", "bottom 6", "relegation table"] }
      ],
      championshipKeywords: ["championship group", "meisterrunde", "top 6", "meisterrunde table"],
      relegationKeywords: ["relegation group", "abstiegsrunde", "bottom 6", "abstiegsrunde table"],
      preferGroup: "championship"
    },
    DENMARK_SUPERLIGA: {
      regularSeasonGames: 22,
      championshipSize: 6,
      relegationSize: 6,
      pointsCarryover: "all",
      showAllGroups: true,
      groups: [
        { label: "Championship Group", size: 6, keywords: ["championship group", "championship round", "top 6", "upper half", "championship table"] },
        { label: "Relegation Group", size: 6, keywords: ["relegation group", "relegation round", "bottom 6", "lower half", "relegation table"] }
      ],
      championshipKeywords: ["championship group", "top 6", "upper half", "championship table"],
      relegationKeywords: ["relegation group", "bottom 6", "lower half", "relegation table"],
      preferGroup: "championship"
    },
    SERBIA_SUPER_LIGA: {
      regularSeasonGames: 30,
      championshipSize: 8,
      relegationSize: 8,
      pointsCarryover: "all",
      showAllGroups: true,
      groups: [
        { label: "Championship Group", size: 8, keywords: ["championship group", "championship round", "top 8", "first group", "championship table"] },
        { label: "Relegation Group", size: 8, keywords: ["relegation group", "relegation round", "bottom 8", "second group", "relegation table"] }
      ],
      championshipKeywords: ["championship group", "championship playoff", "championship group", "top 6", "championship table"],
      relegationKeywords: ["relegation round", "relegation playoff", "relegation group", "bottom 8", "relegation table"],
      preferGroup: "championship"
    }
  };

  // src/state.js
  var state = {
    // -----------------------------
    // Match Events & Notifications
    // -----------------------------
    _checkMatchEvents(oldData, newData) {
      if (!oldData || !newData || !newData.fixtures) return;
      const leagueName = this.config.leagueHeaders[newData.leagueType] || newData.leagueType;
      newData.fixtures.forEach((newFix) => {
        const oldFix = oldData.fixtures.find(
          (f) => f.homeTeam === newFix.homeTeam && f.awayTeam === newFix.awayTeam && f.date === newFix.date
        );
        if (!oldFix) return;
        const oldHome = parseInt(oldFix.homeScore);
        const oldAway = parseInt(oldFix.awayScore);
        const newHome = parseInt(newFix.homeScore);
        const newAway = parseInt(newFix.awayScore);
        if (!isNaN(oldHome) && !isNaN(newHome) && newHome > oldHome) {
          this._broadcastMatchEvent("GOAL", {
            team: newFix.homeTeam,
            score: `${newHome}-${newAway}`,
            fixture: `${newFix.homeTeam} vs ${newFix.awayTeam}`,
            league: leagueName
          });
        }
        if (!isNaN(oldAway) && !isNaN(newAway) && newAway > oldAway) {
          this._broadcastMatchEvent("GOAL", {
            team: newFix.awayTeam,
            score: `${newHome}-${newAway}`,
            fixture: `${newFix.homeTeam} vs ${newFix.awayTeam}`,
            league: leagueName
          });
        }
        if (oldFix.status !== newFix.status) {
          if (newFix.status === "HT") {
            this._broadcastMatchEvent("HALFTIME", {
              score: `${newHome}-${newAway}`,
              fixture: `${newFix.homeTeam} vs ${newFix.awayTeam}`,
              league: leagueName
            });
          } else if (newFix.status === "FT" || newFix.status === "Full Time") {
            this._broadcastMatchEvent("FULLTIME", {
              score: `${newHome}-${newAway}`,
              fixture: `${newFix.homeTeam} vs ${newFix.awayTeam}`,
              league: leagueName
            });
          }
        }
      });
    },
    _broadcastMatchEvent(type, data) {
      this.log(3, "EVENT", `Broadcasting match event: ${type}`, data);
      this.sendNotification(`MTLT_MATCH_${type}`, data);
      if (this.config.showMatchAlerts) {
        this.sendNotification("SHOW_ALERT", {
          title: `${type === "GOAL" ? "\u26BD GOAL!" : type}`,
          message: `${data.fixture}: ${data.score} (${data.league})`,
          timer: 5e3
        });
      }
    },
    _autoFocusRelevantSubTab(leagueType) {
    },
    // -----------------------------
    // Refresh Strategy (PERF-01)
    // -----------------------------
    scheduleUpdate() {
      const self = this;
      if (this.updateTimer) clearTimeout(this.updateTimer);
      let nextUpdate = this.config.updateInterval || 18e5;
      let hasLiveGames = false;
      let mightHaveLiveGames = false;
      let hasUpcomingToday = false;
      const nowMs = Date.now();
      const hour = (/* @__PURE__ */ new Date()).getHours();
      const todayDateStr = this.getCurrentDateString();
      if (this.leagueData) {
        Object.values(this.leagueData).forEach((data) => {
          if (data && data.fixtures) {
            data.fixtures.forEach((f) => {
              const isFinished = ["FT", "PEN", "AET"].includes((f.status || "").toUpperCase());
              if (f.live) hasLiveGames = true;
              else if (f.date === todayDateStr && !isFinished) {
                if (f.timestamp && f.timestamp < nowMs + 9e5) mightHaveLiveGames = true;
                else hasUpcomingToday = true;
              }
            });
          }
        });
      }
      if (hasLiveGames) nextUpdate = 12e4;
      else if (mightHaveLiveGames) nextUpdate = 3e5;
      else if (hasUpcomingToday) nextUpdate = 9e5;
      else if (hour >= 1 && hour <= 6) nextUpdate = 144e5;
      this.updateTimer = setTimeout(() => {
        self.requestAllLeagueData();
        self.scheduleUpdate();
      }, nextUpdate);
    },
    scheduleCycling() {
      if (this._pinned) return;
      if (this.cycleTimer) clearInterval(this.cycleTimer);
      if (this.enabledLeagueCodes && this.enabledLeagueCodes.length > 1) {
        this.cycleTimer = setInterval(() => this.cycleToNextLeague(), this.config.cycleInterval);
        this.scheduleWorldCupSubtabCycling();
      }
    },
    cycleToNextLeague() {
      if (this.isScrolling || this._pinned) return;
      if (!this.enabledLeagueCodes || this.enabledLeagueCodes.length <= 1) return;
      let currentIndex = this.enabledLeagueCodes.indexOf(this.currentLeague);
      let nextIndex = (currentIndex + 1) % this.enabledLeagueCodes.length;
      this.currentLeague = this.enabledLeagueCodes[nextIndex];
      const uefaLeagues = ["UEFA_CHAMPIONS_LEAGUE", "UEFA_EUROPA_LEAGUE", "UEFA_EUROPA_CONFERENCE_LEAGUE", "UCL", "UEL", "ECL"];
      if (this.currentLeague === "WORLD_CUP_2026") {
        this.currentSubTab = this.config.defaultWCSubTab || "A";
      } else if (uefaLeagues.includes(this.currentLeague)) {
        this.currentSubTab = "Table";
      } else {
        this.currentSubTab = null;
      }
      this._lastRenderedKey = null;
      this.log(3, "UI", `Cycling to league: ${this.currentLeague}`);
      this.updateDom(this.config.animationSpeed);
    },
    scheduleWorldCupSubtabCycling() {
      if (this.isScrolling || this._pinned) return;
      if (this.wcSubtabTimer) clearInterval(this.wcSubtabTimer);
      if (this.wcInitialDelayTimer) clearTimeout(this.wcInitialDelayTimer);
      if (this.config.autoCycleWcSubtabs === false) return;
      if (this.currentLeague !== "WORLD_CUP_2026" || !(this.config.autoCycle || this.config.onlyShowWorldCup2026)) return;
      const groupsToShow = this.config.showWC2026Groups || ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
      const isCurrentGroup = groupsToShow.includes(this.currentSubTab);
      const interval = this.config.wcSubtabCycleInterval || 15e3;
      if (isCurrentGroup) {
        this.wcInitialDelayTimer = setTimeout(() => {
          this.wcSubtabTimer = setInterval(() => {
            if (this.isWorldCupStageComplete("GROUPS")) {
              clearInterval(this.wcSubtabTimer);
              this.currentSubTab = "Rd32";
              this.updateDom(this.config.animationSpeed);
              return;
            }
            let idx = groupsToShow.indexOf(this.currentSubTab);
            this.currentSubTab = groupsToShow[(idx + 1) % groupsToShow.length];
            this.updateDom(this.config.animationSpeed);
          }, interval);
        }, interval);
      }
    },
    // -----------------------------
    // Data Processing
    // -----------------------------
    socketNotificationReceived(notification, payload) {
      switch (notification) {
        case "LEAGUE_DATA":
          this.processLeagueData(payload);
          break;
        case "FETCH_ERROR":
          this.processError(payload);
          break;
        case "DEBUG_INFO":
          this.log(4, "BACKEND", payload.message, payload.data || "");
          break;
      }
    },
    processLeagueData(data) {
      const leagueType = data.leagueType || "SPFL";
      if (this.leagueData[leagueType]) this._checkMatchEvents(this.leagueData[leagueType], data);
      this.leagueData[leagueType] = data;
      this.loaded[leagueType] = true;
      if (!this.currentLeague || this.currentLeague === leagueType) this.currentLeague = leagueType;
      if (this.config.autoFocusRelevantSubTab) this._autoFocusRelevantSubTab(leagueType);
      this.error = null;
      this.retryCount = 0;
      if (leagueType === this.currentLeague) {
        this._lastRenderedKey = null;
        this.announceDataUpdate(this.config.leagueHeaders[leagueType] || leagueType);
        this.debouncedUpdateDom(this.config.animationSpeed);
      }
    },
    _shouldSkipRender() {
      if (this.config.debug) return false;
      const data = this.leagueData[this.currentLeague];
      const dataKey = JSON.stringify(data?.standings || data?.teams || data?.groups || {});
      const key = `${this.currentLeague}_${this.currentSubTab || "table"}_${this.isOnline}_${this.isContentHidden}_${dataKey}`;
      if (this._lastRenderedKey === key) return true;
      this._lastRenderedKey = key;
      return false;
    },
    debouncedUpdateDom(speed) {
      if (this.updateDomTimer) clearTimeout(this.updateDomTimer);
      this.saveFocusState();
      this.updateDomTimer = setTimeout(() => {
        this.updateDom(speed || this.config.animationSpeed);
        this.updateDomTimer = null;
        setTimeout(() => this.restoreFocusState(), (speed || this.config.animationSpeed || 0) + 150);
      }, 200);
    },
    processError(error) {
      const leagueType = error.leagueType || null;
      if (!this._leagueRetryCounters) this._leagueRetryCounters = /* @__PURE__ */ new Map();
      if (leagueType) {
        const count = (this._leagueRetryCounters.get(leagueType) || 0) + 1;
        this._leagueRetryCounters.set(leagueType, count);
        if (count <= this.config.maxRetries) {
          setTimeout(() => this._requestSingleLeagueData(leagueType), this.config.retryDelay);
        } else {
          this.updateDom(this.config.animationSpeed);
        }
        return;
      }
      this.error = error;
      this.retryCount++;
      if (this.retryCount <= this.config.maxRetries) {
        setTimeout(() => this.requestAllLeagueData(), this.config.retryDelay);
      } else {
        this.updateDom(this.config.animationSpeed);
      }
    },
    _requestSingleLeagueData(leagueCode) {
      const urls = this.getLeagueUrl(leagueCode);
      if (!urls || !urls.primary && !urls.fallback) return;
      this.sendSocketNotification("GET_LEAGUE_DATA", {
        ...this.config,
        leagueType: leagueCode,
        url: urls.primary,
        fallbackUrl: urls.fallback,
        providerChain: urls.providerChain || [],
        splitConfig: LEAGUE_SPLITS[leagueCode] || null
      });
    },
    getLeagueUrl(leagueCode) {
      const provider = (this.config.provider || "auto").toLowerCase();
      const urls = {
        bbc: BBC_URL_MAP[leagueCode],
        google: GOOGLE_URL_MAP[leagueCode],
        wikipedia: WIKIPEDIA_URL_MAP[leagueCode],
        espn: ESPN_URL_MAP[leagueCode],
        soccerway: SOCCERWAY_URL_MAP[leagueCode]
      };
      const buildChain = (...providerOrder) => providerOrder.map((p) => urls[p] ? { url: urls[p], provider: p } : null).filter(Boolean);
      let chain = [];
      if (provider === "bbc") chain = buildChain("bbc", "soccerway", "espn", "wikipedia", "google");
      else if (provider === "espn") chain = buildChain("espn", "bbc", "soccerway", "wikipedia", "google");
      else if (provider === "soccerway") chain = buildChain("soccerway", "bbc", "espn", "wikipedia", "google");
      else if (provider === "wikipedia") chain = buildChain("wikipedia", "soccerway", "bbc", "espn", "google");
      else chain = buildChain("bbc", "soccerway", "espn", "wikipedia", "google");
      if (chain.length === 0) return null;
      return {
        primary: chain[0].url,
        fallback: chain.length > 1 ? chain[1].url : null,
        providerChain: chain
      };
    },
    requestAllLeagueData() {
      if (!this.enabledLeagueCodes || this.enabledLeagueCodes.length === 0) {
        this.log(2, "CORE", "No leagues configured to fetch");
        return;
      }
      this.enabledLeagueCodes.forEach((leagueCode, index) => {
        const urls = this.getLeagueUrl(leagueCode);
        if (!urls || !urls.primary && !urls.fallback) {
          this.log(1, "CORE", `Could not find URL for league code: ${leagueCode}`);
          return;
        }
        const splitConfig = LEAGUE_SPLITS[leagueCode] || null;
        setTimeout(() => {
          this.log(3, "DATA", `Requesting data for ${leagueCode}${splitConfig ? " (split-league)" : ""}`);
          this.sendSocketNotification("GET_LEAGUE_DATA", {
            ...this.config,
            leagueType: leagueCode,
            url: urls.primary,
            fallbackUrl: urls.fallback,
            providerChain: urls.providerChain || [],
            splitConfig
          });
        }, index * 500);
      });
    },
    handleOnlineStatus(isOnline) {
      this.isOnline = isOnline;
      if (!isOnline) this.announceToScreenReader("Internet connection lost - showing cached data", true);
      else {
        this.announceToScreenReader("Internet connection restored - updating data", true);
        this.requestAllLeagueData();
      }
      this.updateDom();
    },
    setupOfflineDetection() {
      window.addEventListener("online", () => this.handleOnlineStatus(true));
      window.addEventListener("offline", () => this.handleOnlineStatus(false));
    },
    isWorldCupStageComplete(stageId) {
      const data = this.leagueData && this.leagueData.WORLD_CUP_2026;
      if (!data) return false;
      if (stageId === "GROUPS") {
        const groups = this.config.showWC2026Groups || ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
        return groups.every((g) => data.standings && data.standings[g] ? data.standings[g].every((team) => team.played >= 3) : false);
      }
      return false;
    },
    determineEnabledLeagues() {
      this.enabledLeagueCodes = [];
      if (this.config.onlyShowWorldCup2026) {
        this.enabledLeagueCodes = ["WORLD_CUP_2026"];
        return;
      }
      if (this.config.selectedLeagues?.length) {
        this.config.selectedLeagues.forEach((c) => {
          const n = this.normalizeLeagueCode(c);
          if (n && !this.enabledLeagueCodes.includes(n)) this.enabledLeagueCodes.push(n);
        });
      }
      if (!this.enabledLeagueCodes.length && this.config.legacyLeagueToggle) {
        const map = { showSPFL: "SCOTLAND_PREMIERSHIP", showSPFLC: "SCOTLAND_CHAMPIONSHIP", showEPL: "ENGLAND_PREMIER_LEAGUE", showUCL: "UEFA_CHAMPIONS_LEAGUE", showUEL: "UEFA_EUROPA_LEAGUE", showECL: "UEFA_EUROPA_CONFERENCE_LEAGUE" };
        Object.entries(map).forEach(([k, v]) => {
          if (this.config[k] && !this.enabledLeagueCodes.includes(v)) this.enabledLeagueCodes.push(v);
        });
      }
      if (this.config.showWC2026) {
        if (!this.enabledLeagueCodes.includes("WORLD_CUP_2026")) this.enabledLeagueCodes.push("WORLD_CUP_2026");
      } else if (this.config.showWC2026 === false) this.enabledLeagueCodes = this.enabledLeagueCodes.filter((c) => c !== "WORLD_CUP_2026");
      const uefa = ["UEFA_EUROPA_CONFERENCE_LEAGUE", "UEFA_EUROPA_LEAGUE", "UEFA_CHAMPIONS_LEAGUE"];
      if (this.config.showUEFAleagues) uefa.forEach((c) => {
        if (!this.enabledLeagueCodes.includes(c)) this.enabledLeagueCodes.push(c);
      });
      else if (this.config.showUEFAleagues === false) this.enabledLeagueCodes = this.enabledLeagueCodes.filter((c) => !uefa.includes(c));
      if (!this.enabledLeagueCodes.length) this.enabledLeagueCodes = ["SCOTLAND_PREMIERSHIP"];
      if (!this.currentLeague || !this.enabledLeagueCodes.includes(this.currentLeague)) this.currentLeague = this.enabledLeagueCodes[0] || "SCOTLAND_PREMIERSHIP";
    },
    normalizeLeagueCode(code) {
      return code ? LEGACY_CODE_MAP[code] || code : null;
    }
  };

  // src/logos.js
  var logos = {
    // ===== NEW: Build normalized team lookup map =====
    // Creates a case-insensitive, whitespace-normalized lookup for team logo mappings
    // Handles common naming variations (e.g., "St Mirren" vs "st mirren", "ST. MIRREN", etc.)
    // Also handles suffix/prefix variations like FC, SC, AC in any case combination
    // Also handles diacritics (accents, umlauts) - "Atlético" matches "Atletico"
    buildNormalizedTeamMap() {
      var self = this;
      this.normalizedTeamLogoMap = {};
      this.fuzzyTeamLogoMap = {};
      var commonSuffixes = COMMON_SUFFIXES;
      var getAlternativeDiacriticsSpellings = function(str) {
        if (!str) return [];
        var variants = [];
        if (str.match(/[öüä]/i)) {
          var withOe = str.replace(/ö/gi, (m) => m === "\xF6" ? "oe" : "OE").replace(/ü/gi, (m) => m === "\xFC" ? "ue" : "UE").replace(/ä/gi, (m) => m === "\xE4" ? "ae" : "AE");
          variants.push(self.normalizeTeamName(withOe));
        }
        return variants;
      };
      var normalize = function(str) {
        return self.normalizeTeamName(str);
      };
      var fuzzyNormalize = function(str) {
        return self.fuzzyNormalizeTeamName(str);
      };
      var stripSuffixes = function(str) {
        var normalized = normalize(str);
        var parts = normalized.split(" ");
        var stripped = normalized;
        if (parts.length > 1) {
          var lastWord = parts[parts.length - 1];
          if (commonSuffixes.indexOf(lastWord) !== -1) {
            stripped = parts.slice(0, -1).join(" ");
          }
          var firstWord = parts[0];
          if (commonSuffixes.indexOf(firstWord) !== -1) {
            stripped = parts.slice(1).join(" ");
          }
        }
        return stripped.trim();
      };
      Object.keys(this.mergedTeamLogoMap).forEach((teamName) => {
        var normalized = normalize(teamName);
        var fuzzy = fuzzyNormalize(teamName);
        var stripped = stripSuffixes(teamName);
        if (normalized && normalized.length > 0) {
          this.normalizedTeamLogoMap[normalized] = this.mergedTeamLogoMap[teamName];
          if (fuzzy && fuzzy.length > 0) {
            this.fuzzyTeamLogoMap[fuzzy] = this.mergedTeamLogoMap[teamName];
          }
          if (stripped !== normalized && stripped.length > 0) {
            this.normalizedTeamLogoMap[stripped] = this.mergedTeamLogoMap[teamName];
          }
          commonSuffixes.forEach((suffix) => {
            var withSuffix = `${normalized} ${suffix}`;
            if (!this.normalizedTeamLogoMap[withSuffix]) {
              this.normalizedTeamLogoMap[withSuffix] = this.mergedTeamLogoMap[teamName];
            }
          });
          getAlternativeDiacriticsSpellings(teamName).forEach((variant) => {
            if (variant && !this.normalizedTeamLogoMap[variant]) {
              this.normalizedTeamLogoMap[variant] = this.mergedTeamLogoMap[teamName];
            }
            var strippedVariant = stripSuffixes(variant);
            if (strippedVariant && strippedVariant !== variant && !this.normalizedTeamLogoMap[strippedVariant]) {
              this.normalizedTeamLogoMap[strippedVariant] = this.mergedTeamLogoMap[teamName];
            }
          });
        }
      });
      const aliases = this.teamAliases || TEAM_ALIASES;
      Object.keys(aliases).forEach((alias) => {
        var targetName = aliases[alias];
        var normalizedAlias = normalize(alias);
        var logoPath = this.mergedTeamLogoMap[targetName] || this.normalizedTeamLogoMap[normalize(targetName)];
        if (logoPath && !this.normalizedTeamLogoMap[normalizedAlias]) {
          this.normalizedTeamLogoMap[normalizedAlias] = logoPath;
          var strippedAlias = stripSuffixes(normalizedAlias);
          if (strippedAlias && strippedAlias !== normalizedAlias && !this.normalizedTeamLogoMap[strippedAlias]) {
            this.normalizedTeamLogoMap[strippedAlias] = logoPath;
          }
        }
      });
      this.log(
        3,
        "LOGO",
        `Built normalized team map with ${Object.keys(this.normalizedTeamLogoMap).length} entries (diacritics removed, Anglicization variants added, case/whitespace normalized, suffix/prefix variants, common abbreviations)`
      );
    },
    // ===== NEW: Get team logo mapping with intelligent lookup =====
    // Tries multiple matching strategies:
    // 1. Exact match (fastest)
    // 2. Normalized match (case-insensitive, whitespace-normalized, diacritics removed)
    // 3. Suffix/prefix variants (handles AFC, VFB, FC, SC, AC in any case, no length restrictions)
    // 4. Diacritic variants (handles accents/umlauts AND Anglicization: Atlético→Atletico, Köln→Koln or Koeln)
    getTeamLogoMapping(teamName) {
      if (!teamName) return null;
      let logoPath = null;
      if (this.mergedTeamLogoMap && this.mergedTeamLogoMap[teamName]) {
        logoPath = this.mergedTeamLogoMap[teamName];
      }
      if (!logoPath) {
        var normalized = this.normalizeTeamName(teamName);
        if (this.normalizedTeamLogoMap[normalized]) {
          this.log(
            4,
            "LOGO",
            `Found normalized mapping for '${teamName}' as '${normalized}' (diacritics/case/whitespace normalized, Anglicization variants like K\xF6ln\u2192koeln supported)`
          );
          logoPath = this.normalizedTeamLogoMap[normalized];
        } else {
          var commonSuffixes = COMMON_SUFFIXES;
          var parts = normalized.split(" ");
          var stripped = normalized;
          if (parts.length > 1) {
            var lastWord = parts[parts.length - 1];
            if (commonSuffixes.indexOf(lastWord) !== -1) {
              stripped = parts.slice(0, -1).join(" ");
            }
            var firstWord = parts[0];
            if (commonSuffixes.indexOf(firstWord) !== -1) {
              stripped = parts.slice(1).join(" ");
            }
          }
          if (stripped !== normalized && this.normalizedTeamLogoMap[stripped]) {
            this.log(
              4,
              "LOGO",
              `Found suffix/prefix variant mapping for '${teamName}' -> '${stripped}'`
            );
            logoPath = this.normalizedTeamLogoMap[stripped];
          } else {
            var fuzzy = this.fuzzyNormalizeTeamName(teamName);
            if (this.fuzzyTeamLogoMap[fuzzy]) {
              this.log(
                4,
                "LOGO",
                `Found fuzzy mapping for '${teamName}' -> '${fuzzy}'`
              );
              logoPath = this.fuzzyTeamLogoMap[fuzzy];
            }
          }
        }
      }
      if (logoPath) {
        if (logoPath.indexOf("http") !== 0 && logoPath.indexOf("/") !== 0) {
          return this.file(`images/${logoPath}`);
        }
        return logoPath;
      }
      this.log(
        2,
        "LOGO",
        `NO MAPPING FOUND for team '${teamName}'.`
      );
      return null;
    },
    setupLazyLoading() {
      if (!("IntersectionObserver" in window)) {
        this.imageObserver = null;
        return;
      }
      this.imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const dataSrc = img.getAttribute("data-src");
            if (dataSrc) {
              img.src = dataSrc;
              img.removeAttribute("data-src");
              this.imageObserver.unobserve(img);
            }
          }
        });
      }, { rootMargin: "50px" });
    },
    setupImageLazyLoading(img, src) {
      if (this.imageObserver) {
        img.setAttribute("data-src", src);
        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"%3E%3C/svg%3E';
        img.loading = "lazy";
        this.imageObserver.observe(img);
      } else {
        img.src = src;
        img.loading = "lazy";
      }
    },
    loadLogoMappings() {
      const url = this.file("team-logo-mappings.js");
      return this.loadScript(url).then(() => {
        this.mergedTeamLogoMap = Object.assign({}, window.TEAM_LOGO_MAPPINGS || {}, this.config.teamLogoMap || {});
        this.buildNormalizedTeamMap();
        this._lastRenderedKey = null;
        this.updateDom(this.config.animationSpeed);
      }).catch((err) => this.log(1, "LOGO", `Could not load team-logo-mappings.js: ${err.message}`));
    },
    /**
     * Get the flag/logo for a given league (P-08)
     * @param {string} leagueCode - The league identifier
     * @returns {string|null} - The path to the flag image
     */
    getLeagueFlag(leagueCode) {
      const uefaLeagues = ["UEFA_CHAMPIONS_LEAGUE", "UCL"];
      const europaLeagues = ["UEFA_EUROPA_LEAGUE", "UEL"];
      const conferenceLeagues = ["UEFA_EUROPA_CONFERENCE_LEAGUE", "ECL"];
      if (uefaLeagues.includes(leagueCode)) return this.file("images/UCL.png");
      if (europaLeagues.includes(leagueCode)) return this.file("images/UEL.png");
      if (conferenceLeagues.includes(leagueCode)) return this.file("images/UECL.png");
      if (leagueCode === "WORLD_CUP_2026") return this.file("images/WC2026.png");
      if (typeof EUROPEAN_LEAGUES !== "undefined" && EUROPEAN_LEAGUES[leagueCode]) {
        const config = EUROPEAN_LEAGUES[leagueCode];
        const countryFolder = config.countryFolder || config.country;
        const flagName = (config.country || "").toLowerCase().replace(/\s+/g, "_");
        return this.file(`images/crests/${countryFolder}/${flagName}.png`);
      }
      if (leagueCode === "SCOTLAND_PREMIERSHIP" || leagueCode === "SCOTLAND_CHAMPIONSHIP" || leagueCode === "SPFL" || leagueCode === "SPFLC")
        return this.file("images/crests/Scotland/scotland.png");
      if (leagueCode === "ENGLAND_PREMIER_LEAGUE" || leagueCode === "EPL")
        return this.file("images/crests/England/england.png");
      return null;
    }
  };

  // src/rendering.js
  var rendering = {
    // Return the list of CSS files to load for this module
    getStyles() {
      return ["MMM-MyTeams-LeagueTable.min.css"];
    },
    // Get translations
    getTranslations() {
      return {
        af: "translations/af.json",
        ar: "translations/ar.json",
        de: "translations/de.json",
        en: "translations/en.json",
        es: "translations/es.json",
        fa: "translations/fa.json",
        fr: "translations/fr.json",
        ga: "translations/ga.json",
        gd: "translations/gd.json",
        hr: "translations/hr.json",
        ht: "translations/ht.json",
        it: "translations/it.json",
        ja: "translations/ja.json",
        ko: "translations/ko.json",
        mi: "translations/mi.json",
        nl: "translations/nl.json",
        no: "translations/no.json",
        pt: "translations/pt.json",
        uz: "translations/uz.json",
        cy: "translations/cy.json",
        sv: "translations/sv.json",
        pl: "translations/pl.json",
        tr: "translations/tr.json",
        hu: "translations/hu.json",
        uk: "translations/uk.json",
        el: "translations/el.json",
        da: "translations/da.json",
        cs: "translations/cs.json",
        fi: "translations/fi.json",
        ro: "translations/ro.json",
        sk: "translations/sk.json",
        sl: "translations/sl.json",
        sq: "translations/sq.json",
        sr: "translations/sr.json"
      };
    },
    // Helper to translate team names
    translateTeamName(name) {
      if (!name) return "";
      const key = name.toUpperCase().replace(/\s+/g, "_");
      const translated = this.translate(key);
      return translated === key ? name : translated;
    },
    // -----------------------------
    // Theme & Layout Overrides
    // -----------------------------
    _applyThemeOverrides() {
      const styleId = "mmm-myteams-leaguetable-theme-override";
      let styleEl = document.getElementById(styleId);
      if (this.config.darkMode === null && this.config.fontColorOverride === null && this.config.opacityOverride === null && this.config.firstPlaceColor === "rgba(255, 255, 255, 0.1)" && this.config.highlightedColor === "rgba(255, 255, 255, 0.1)") {
        if (styleEl) styleEl.remove();
        return;
      }
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
      }
      let css = "";
      if (this.config.darkMode === true) {
        css += ".spfl-league-table { background-color: #111 !important; color: #fff !important; }\n";
      } else if (this.config.darkMode === false) {
        css += ".spfl-league-table { background-color: #f5f5f5 !important; color: #000 !important; }\n";
      }
      if (this.config.fontColorOverride && this.isValidColor(this.config.fontColorOverride)) {
        css += `.spfl-league-table * { color: ${this.config.fontColorOverride} !important; }
`;
      }
      if (this.config.opacityOverride !== null && this.config.opacityOverride !== void 0) {
        let opacity = parseFloat(this.config.opacityOverride);
        if (!isNaN(opacity)) {
          opacity = Math.min(Math.max(opacity, 0), 1);
          css += `.spfl-league-table * { opacity: ${opacity} !important; }
`;
          css += ".spfl-league-table .back-to-top-controls { opacity: 0 !important; }\n";
          css += ".spfl-league-table .back-to-top-controls.visible { opacity: 1 !important; }\n";
        }
      }
      if (this.config.firstPlaceColor && this.isValidColor(this.config.firstPlaceColor)) {
        css += `.spfl-league-table .team-row:first-child { background-color: ${this.config.firstPlaceColor} !important; }
`;
        css += `.spfl-league-table .team-row:first-child .pos-cell { background: ${this.config.firstPlaceColor} !important; }
`;
      }
      if (this.config.highlightedColor && this.isValidColor(this.config.highlightedColor)) {
        css += `.spfl-league-table .team-row.highlighted { background-color: ${this.config.highlightedColor} !important; }
`;
      }
      if (this.config.customTeamColors && typeof this.config.customTeamColors === "object") {
        Object.entries(this.config.customTeamColors).forEach(([teamName, color]) => {
          if (this.isValidColor(color)) {
            const escapedName = teamName.replace(/"/g, '\\"');
            css += `.spfl-league-table .team-row[data-team-name="${escapedName}"] { background-color: ${color} !important; }
`;
            css += `.spfl-league-table .team-row[data-team-name="${escapedName}"] .pos-cell { background: ${color} !important; }
`;
          }
        });
      }
      styleEl.textContent = css;
    },
    // -----------------------------
    // Navigation & UI Elements
    // -----------------------------
    _createHeaderMetaInfo() {
      const meta = document.createElement("div");
      meta.className = "league-meta-info";
      const data = this.leagueData[this.currentLeague];
      const source = data && (data.source || data.provider) || "";
      const sourceText = source ? ` (${source})` : "";
      const refreshBtn = document.createElement("button");
      refreshBtn.className = "refresh-btn bright";
      refreshBtn.title = "Refresh Data";
      refreshBtn.appendChild(this.createIcon("fa fa-refresh"));
      refreshBtn.onclick = (e) => {
        e.stopPropagation();
        this.sendSocketNotification("FETCH_LEAGUE_DATA", { leagueCode: this.currentLeague, force: true });
        const icon = refreshBtn.querySelector("i");
        if (icon) {
          icon.classList.add("fa-spin");
          setTimeout(() => icon.classList.remove("fa-spin"), 2e3);
        }
      };
      meta.appendChild(refreshBtn);
      const clearBtn = document.createElement("button");
      clearBtn.className = "clear-cache-btn bright";
      clearBtn.title = "Clear Cache";
      clearBtn.appendChild(this.createIcon("fa fa-eraser"));
      clearBtn.onclick = (e) => {
        e.stopPropagation();
        this.sendSocketNotification("CACHE_CLEAR_ALL", {});
        const icon = clearBtn.querySelector("i");
        if (icon) {
          icon.classList.add("fa-spin");
          setTimeout(() => icon.classList.remove("fa-spin"), 1e3);
        }
      };
      meta.appendChild(clearBtn);
      const pinBtn = document.createElement("button");
      pinBtn.className = "pin-btn bright" + (this._pinned ? " active" : "");
      pinBtn.title = this._pinned ? "Unpin (Resume cycling)" : "Pin (Pause cycling)";
      pinBtn.appendChild(this.createIcon("fa fa-map-pin"));
      pinBtn.onclick = (e) => {
        e.stopPropagation();
        this._pinned = !this._pinned;
        this.scheduleCycling();
        this.updateDom();
      };
      meta.appendChild(pinBtn);
      const lastUpdate = document.createElement("div");
      lastUpdate.className = "last-updated-badge";
      const date = /* @__PURE__ */ new Date();
      const timeStr = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
      lastUpdate.textContent = timeStr + sourceText;
      meta.appendChild(lastUpdate);
      meta.appendChild(this._createToggleIcon());
      return meta;
    },
    _createToggleIcon() {
      const toggleIcon = document.createElement("button");
      toggleIcon.className = "LeagueTable-toggle-icon visible";
      toggleIcon.title = this.isContentHidden ? this.translate("SHOW_LEAGUE_TABLE") : this.translate("HIDE_LEAGUE_TABLE");
      toggleIcon.setAttribute("aria-label", toggleIcon.title);
      toggleIcon.setAttribute("aria-expanded", !this.isContentHidden);
      toggleIcon.appendChild(document.createTextNode(this.isContentHidden ? "\u25B2" : "\u25BC"));
      toggleIcon.onclick = (e) => {
        e.stopPropagation();
        this.isContentHidden = !this.isContentHidden;
        this.updateDom();
      };
      return toggleIcon;
    },
    _addHorizontalScrollIndicators(container, parent) {
      if (!container || !parent) return;
      const wrapper = document.createElement("div");
      wrapper.className = "league-tabs-wrapper";
      const prevBtn = document.createElement("button");
      prevBtn.className = "tab-scroll-btn prev";
      prevBtn.appendChild(this.createIcon("fa fa-chevron-left"));
      prevBtn.setAttribute("aria-label", "Scroll tabs left");
      const nextBtn = document.createElement("button");
      nextBtn.className = "tab-scroll-btn next";
      nextBtn.appendChild(this.createIcon("fa fa-chevron-right"));
      nextBtn.setAttribute("aria-label", "Scroll tabs right");
      const updateArrows = () => {
        if (!container) return;
        const { scrollLeft, scrollWidth, clientWidth } = container;
        if (scrollLeft > 5) prevBtn.classList.add("visible");
        else prevBtn.classList.remove("visible");
        if (scrollLeft < scrollWidth - clientWidth - 5 && scrollWidth > clientWidth) nextBtn.classList.add("visible");
        else nextBtn.classList.remove("visible");
      };
      prevBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        container.scrollBy({ left: -120, behavior: "smooth" });
      });
      nextBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        container.scrollBy({ left: 120, behavior: "smooth" });
      });
      container.addEventListener("scroll", updateArrows);
      if (window.ResizeObserver) {
        const resizeObserver = new ResizeObserver(() => updateArrows());
        resizeObserver.observe(container);
        this._tabResizeObserver = resizeObserver;
      } else {
        window.addEventListener("resize", updateArrows);
      }
      setTimeout(updateArrows, 300);
      wrapper.appendChild(prevBtn);
      wrapper.appendChild(container);
      wrapper.appendChild(nextBtn);
      parent.appendChild(wrapper);
    },
    createIcon(iconClass) {
      const icon = document.createElement("i");
      icon.className = iconClass;
      return icon;
    },
    createOfflineIndicator() {
      if (this.isOnline) return null;
      const offlineIndicator = document.createElement("div");
      offlineIndicator.className = "offline-indicator";
      offlineIndicator.setAttribute("role", "status");
      offlineIndicator.setAttribute("aria-live", "polite");
      offlineIndicator.appendChild(this.createIcon("fa fa-wifi"));
      offlineIndicator.appendChild(document.createTextNode(" Offline Mode - Showing Cached Data"));
      return offlineIndicator;
    },
    // -----------------------------
    // Sorting & Countdown
    // -----------------------------
    _sortTableByColumn(column, header) {
      const currentSort = header.getAttribute("aria-sort") || "none";
      const newSort = currentSort === "descending" ? "ascending" : "descending";
      const allHeaders = header.parentNode.querySelectorAll("th");
      allHeaders.forEach((h) => {
        if (h !== header) h.setAttribute("aria-sort", "none");
      });
      header.setAttribute("aria-sort", newSort);
      this._currentSortColumn = column;
      this._currentSortOrder = newSort;
      this._lastRenderedKey = null;
      this.debouncedUpdateDom();
    },
    _renderNextMatchCountdown() {
      if (!this.config.highlightTeams || this.config.highlightTeams.length === 0) return null;
      let allFixtures = [];
      Object.values(this.leagueData).forEach((data) => {
        if (data && data.fixtures) allFixtures = allFixtures.concat(data.fixtures);
      });
      if (allFixtures.length === 0) return null;
      const now = Date.now();
      const highlightedTeams = this.config.highlightTeams;
      const upcomingMatches = allFixtures.filter((f) => {
        const isHighlighted = highlightedTeams.includes(f.homeTeam) || highlightedTeams.includes(f.awayTeam);
        return isHighlighted && f.timestamp && f.timestamp > now;
      });
      if (upcomingMatches.length === 0) return null;
      upcomingMatches.sort((a, b) => a.timestamp - b.timestamp);
      const nextMatch = upcomingMatches[0];
      const widget = document.createElement("div");
      widget.className = "next-match-countdown";
      const header = document.createElement("div");
      header.className = "countdown-header";
      header.textContent = "Next Highlighted Match";
      widget.appendChild(header);
      const teams = document.createElement("div");
      teams.className = "countdown-teams";
      teams.textContent = `${nextMatch.homeTeam} vs ${nextMatch.awayTeam}`;
      widget.appendChild(teams);
      const timer = document.createElement("div");
      timer.className = "countdown-timer";
      const updateTimer = () => {
        const diff = nextMatch.timestamp - Date.now();
        if (diff <= 0) {
          timer.textContent = "Kicked off!";
          return;
        }
        const days = Math.floor(diff / (1e3 * 60 * 60 * 24));
        const hours = Math.floor(diff % (1e3 * 60 * 60 * 24) / (1e3 * 60 * 60));
        const minutes = Math.floor(diff % (1e3 * 60 * 60) / (1e3 * 60));
        const seconds = Math.floor(diff % (1e3 * 60) / 1e3);
        let timeStr = days > 0 ? `${days}d ` : "";
        timeStr += `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        timer.textContent = timeStr;
      };
      updateTimer();
      const interval = setInterval(updateTimer, 1e3);
      if (!this._countdownIntervals) this._countdownIntervals = [];
      this._countdownIntervals.push(interval);
      widget.appendChild(timer);
      if (nextMatch.venue) {
        const venue = document.createElement("div");
        venue.className = "countdown-venue";
        venue.textContent = nextMatch.venue;
        widget.appendChild(venue);
      }
      return widget;
    },
    // -----------------------------
    // Table Construction Helpers
    // -----------------------------
    createTableHeader(text, className) {
      const th = document.createElement("th");
      th.textContent = text;
      th.className = className;
      th.setAttribute("role", "columnheader");
      th.setAttribute("scope", "col");
      const sortKeyMap = { "#": "position", "Team": "name", "P": "played", "W": "won", "D": "drawn", "L": "lost", "F": "gf", "A": "ga", "GD": "gd", "Pts": "points" };
      const sortKey = sortKeyMap[text];
      if (sortKey) {
        th.setAttribute("aria-sort", this._currentSortColumn === sortKey ? this._currentSortOrder : "none");
        th.addEventListener("click", () => this._sortTableByColumn(sortKey, th));
      } else {
        th.setAttribute("aria-sort", "none");
      }
      return th;
    },
    createTableCell(content = "", className = "") {
      const td = document.createElement("td");
      if (content !== void 0 && content !== null && content !== "") {
        td.textContent = content;
      } else if (content === 0 || content === "0") {
        td.textContent = "0";
      }
      if (className) td.className = className;
      td.setAttribute("role", "cell");
      return td;
    },
    createFormIndicator(form) {
      const container = document.createElement("div");
      container.className = "form-tokens";
      if (!form || !Array.isArray(form)) return container;
      const maxGames = this.config.formMaxGames || 5;
      const displayForm = form.slice(0, maxGames);
      displayForm.forEach((item) => {
        const token = document.createElement("span");
        const result = typeof item === "string" ? item : item.result || "";
        const details = typeof item === "object" && item.details ? item.details : "";
        token.textContent = result;
        token.className = "form-token";
        if (result === "W") token.classList.add("form-win");
        else if (result === "D") token.classList.add("form-draw");
        else if (result === "L") token.classList.add("form-loss");
        if (details) {
          token.classList.add("has-tooltip");
          token.setAttribute("data-tooltip", details);
          token.setAttribute("aria-label", details);
        } else {
          const labelMap = { "W": "Win", "D": "Draw", "L": "Loss" };
          token.setAttribute("aria-label", labelMap[result] || result);
        }
        container.appendChild(token);
      });
      return container;
    },
    updateTeamNameColumnWidth() {
      const root = document.getElementById(`mtlt-${this.identifier}`);
      if (!root) return;
      const cacheKey = `${this.currentLeague}_${this.currentSubTab || "table"}`;
      if (!this._teamNameWidthCache) this._teamNameWidthCache = {};
      if (this._teamNameWidthCache[cacheKey]) {
        root.style.setProperty("--team-name-width", `${this._teamNameWidthCache[cacheKey]}px`);
        return;
      }
      const names = root.querySelectorAll(".team-cell .team-name");
      if (!names || names.length === 0) return;
      const measurer = document.createElement("span");
      const cs = window.getComputedStyle(names[0]);
      measurer.style.cssText = `position:absolute;visibility:hidden;white-space:nowrap;left:-9999px;font-family:${cs.fontFamily};font-size:${cs.fontSize};font-weight:${cs.fontWeight};font-style:${cs.fontStyle}`;
      document.body.appendChild(measurer);
      let max = 0;
      names.forEach((n) => {
        measurer.textContent = n.textContent || "";
        max = Math.max(max, measurer.offsetWidth);
      });
      measurer.remove();
      const width = Math.ceil(max + 10);
      this._teamNameWidthCache[cacheKey] = width;
      root.style.setProperty("--team-name-width", `${width}px`);
    },
    handleBackToTopClick() {
      const root = document.getElementById(`mtlt-${this.identifier}`);
      const tableContainer = root ? root.querySelector(".league-body-scroll") || root.querySelector(".league-content-container") : null;
      const uefaScrollContainers = root ? root.querySelectorAll(".uefa-section-scroll") : null;
      if (tableContainer) tableContainer.scrollTo({ top: 0, behavior: "smooth" });
      else if (uefaScrollContainers) uefaScrollContainers.forEach((c) => c.scrollTo({ top: 0, behavior: "smooth" }));
      setTimeout(() => this.updateScrollButtons(), 500);
    },
    updateScrollButtons() {
      const root = document.getElementById(`mtlt-${this.identifier}`);
      const tableContainer = root ? root.querySelector(".league-body-scroll") || root.querySelector(".league-content-container") || root.querySelector(".uefa-section-scroll") : null;
      const backToTopControls = root ? root.querySelector(".back-to-top-controls") : null;
      if (tableContainer && backToTopControls) {
        if (tableContainer.scrollTop > 0) {
          backToTopControls.classList.add("visible");
        } else {
          backToTopControls.classList.remove("visible");
        }
      }
    },
    // -----------------------------
    // Main Rendering Engine
    // -----------------------------
    getDom() {
      if (this._shouldSkipRender && this._shouldSkipRender()) {
        if (this.log) this.log(4, "RENDER", "Skipping getDom - Data and state unchanged");
        return this._lastDom;
      }
      this._applyThemeOverrides();
      const wrapper = document.createElement("div");
      wrapper.className = `spfl-league-table mmm-myteams-leaguetable-root density-${this.config.tableDensity || "normal"}`;
      wrapper.id = `mtlt-${this.identifier}`;
      const uefaLeagues = ["UEFA_CHAMPIONS_LEAGUE", "UEFA_EUROPA_LEAGUE", "UEFA_EUROPA_CONFERENCE_LEAGUE", "UCL", "UEL", "ECL"];
      if (this.currentLeague === "WORLD_CUP_2026") {
        wrapper.classList.add("league-mode-wc");
      } else if (uefaLeagues.includes(this.currentLeague)) {
        wrapper.classList.add("league-mode-uefa");
      } else {
        wrapper.classList.add("league-mode-national");
      }
      if (this.config.maxHeight) wrapper.style.maxHeight = this.config.maxHeight;
      if (this.config.maxWidth) wrapper.style.maxWidth = this.config.maxWidth;
      const offlineIndicator = this.createOfflineIndicator();
      if (offlineIndicator) wrapper.appendChild(offlineIndicator);
      const header = document.createElement("div");
      header.className = "league-header-container";
      const title = document.createElement("header");
      title.className = "league-title";
      const headerText = this.config.leagueHeaders[this.currentLeague] || LEAGUE_HEADERS[this.currentLeague] || this.currentLeague;
      title.textContent = headerText;
      header.appendChild(title);
      header.appendChild(this._createHeaderMetaInfo());
      wrapper.appendChild(header);
      if (this.isContentHidden) {
        this._lastDom = wrapper;
        return wrapper;
      }
      if (this.enabledLeagueCodes.length > 1 && this.config.showLeagueButtons !== false) {
        const tabContainer = document.createElement("div");
        tabContainer.className = "league-buttons-container";
        tabContainer.setAttribute("role", "tablist");
        tabContainer.setAttribute("aria-label", "League selection");
        this.enabledLeagueCodes.forEach((leagueCode) => {
          const tab = document.createElement("button");
          tab.className = "league-tab league-btn" + (this.currentLeague === leagueCode ? " active" : "");
          tab.setAttribute("data-league", leagueCode);
          tab.setAttribute("role", "tab");
          tab.setAttribute("aria-selected", this.currentLeague === leagueCode);
          const flagUrl = this.getLeagueFlag(leagueCode);
          if (flagUrl) {
            const flagImg = document.createElement("img");
            flagImg.className = "flag-image";
            flagImg.src = flagUrl;
            flagImg.alt = "";
            flagImg.onerror = () => {
              flagImg.style.display = "none";
            };
            tab.appendChild(flagImg);
          }
          if (this.config.showLeagueLabel === true) {
            const span = document.createElement("span");
            span.className = "league-abbr";
            span.textContent = LEAGUE_TABS[leagueCode] || leagueCode;
            tab.appendChild(span);
          }
          tab.onclick = () => {
            this.currentLeague = leagueCode;
            this.currentSubTab = null;
            this._lastRenderedKey = null;
            this.updateDom();
          };
          tabContainer.appendChild(tab);
        });
        this._addHorizontalScrollIndicators(tabContainer, wrapper);
      }
      const contentContainer = document.createElement("div");
      contentContainer.className = "league-content-container";
      if (!this.loaded[this.currentLeague]) {
        const loading = document.createElement("div");
        loading.className = "loading-message small dimmed";
        loading.innerHTML = this.translate("LOADING") + " " + (LEAGUE_HEADERS[this.currentLeague] || this.currentLeague) + "...";
        contentContainer.appendChild(loading);
        wrapper.appendChild(contentContainer);
        this._lastDom = wrapper;
        return wrapper;
      }
      const data = this.leagueData[this.currentLeague];
      const hasStandings = data && data.standings && (Object.keys(data.standings).length > 0 || Array.isArray(data.standings));
      const hasTeams = data && data.teams && Array.isArray(data.teams) && data.teams.length > 0;
      const hasGroups = data && data.groups && Object.keys(data.groups).length > 0;
      const hasFixtures = data && data.fixtures && data.fixtures.length > 0;
      if (!data || !hasStandings && !hasTeams && !hasGroups && !hasFixtures) {
        const noData = document.createElement("div");
        noData.className = "no-data-message small dimmed";
        noData.textContent = this.translate("NO_DATA_AVAILABLE");
        contentContainer.appendChild(noData);
      } else {
        if (this.currentLeague === "WORLD_CUP_2026") {
          contentContainer.appendChild(this._createWC2026View(data));
        } else if (EUROPEAN_LEAGUES2.includes(this.currentLeague)) {
          contentContainer.appendChild(this.createUEFAView(data));
        } else if (data.splitGroups && data.splitGroups.length > 0) {
          data.splitGroups.forEach((group) => {
            if (group.teams && group.teams.length > 0) {
              const groupLabel = document.createElement("div");
              groupLabel.className = "league-split-separator";
              groupLabel.textContent = group.label;
              contentContainer.appendChild(groupLabel);
              contentContainer.appendChild(this.createTable({ teams: group.teams }));
            }
          });
        } else {
          contentContainer.appendChild(this.createTable(data));
        }
      }
      wrapper.appendChild(contentContainer);
      wrapper.appendChild(this._renderFooterControls());
      const countdown = this._renderNextMatchCountdown();
      if (countdown) wrapper.appendChild(countdown);
      this._lastDom = wrapper;
      setTimeout(() => {
        this.updateTeamNameColumnWidth();
        this.updateScrollButtons();
        const root = document.getElementById(`mtlt-${this.identifier}`);
        const scrollEl = root ? root.querySelector(".league-body-scroll") || root.querySelector(".league-content-container") || root.querySelector(".uefa-section-scroll") : null;
        if (scrollEl && !scrollEl._mtltScrollListenerAttached) {
          scrollEl.addEventListener("scroll", () => this.updateScrollButtons());
          scrollEl._mtltScrollListenerAttached = true;
        }
      }, 50);
      return wrapper;
    },
    createTable(data) {
      const table = document.createElement("table");
      table.className = "spfl-table small";
      table.setAttribute("role", "table");
      table.setAttribute("aria-label", `${this.currentLeague} standings`);
      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");
      headerRow.appendChild(this.createTableHeader("#", "pos-cell"));
      headerRow.appendChild(this.createTableHeader("Team", "team-cell"));
      headerRow.appendChild(this.createTableHeader("P", "played-cell"));
      headerRow.appendChild(this.createTableHeader("W", "won-cell"));
      headerRow.appendChild(this.createTableHeader("D", "drawn-cell"));
      headerRow.appendChild(this.createTableHeader("L", "lost-cell"));
      headerRow.appendChild(this.createTableHeader("F", "gf-cell"));
      headerRow.appendChild(this.createTableHeader("A", "ga-cell"));
      headerRow.appendChild(this.createTableHeader("GD", "gd-cell"));
      headerRow.appendChild(this.createTableHeader("Pts", "points-cell"));
      if (this.config.showForm) {
        headerRow.appendChild(this.createTableHeader("Form", "form-cell"));
      }
      thead.appendChild(headerRow);
      table.appendChild(thead);
      const tbody = document.createElement("tbody");
      const standings = data.standings && data.standings.table ? data.standings.table : Array.isArray(data.standings) ? data.standings : data.teams || [];
      standings.forEach((team, idx) => {
        const tr = document.createElement("tr");
        tr.className = "team-row";
        tr.setAttribute("role", "row");
        tr.setAttribute("aria-rowindex", idx + 1);
        tr.setAttribute("data-team-name", team.name);
        if (this.config.highlightTeams && this.config.highlightTeams.includes(team.name)) {
          tr.classList.add("highlighted");
        }
        tr.appendChild(this.createTableCell(team.position, "pos-cell"));
        const teamCell = this.createTableCell("", "team-cell");
        let logoUrl = team.logo || this.getTeamLogoMapping(team.name);
        if (logoUrl && logoUrl.indexOf("http") !== 0 && logoUrl.indexOf("/") !== 0 && !logoUrl.startsWith("modules/")) {
          logoUrl = this.file(`images/${logoUrl}`);
        }
        if (logoUrl && this.config.showTeamLogos) {
          const img = document.createElement("img");
          img.className = "team-logo";
          img.alt = "";
          this.setupImageLazyLoading(img, logoUrl);
          teamCell.appendChild(img);
        }
        const nameSpan = document.createElement("span");
        nameSpan.className = "team-name";
        nameSpan.textContent = this.translateTeamName(team.name);
        teamCell.appendChild(nameSpan);
        tr.appendChild(teamCell);
        tr.appendChild(this.createTableCell(team.played, "played-cell"));
        tr.appendChild(this.createTableCell(team.won, "won-cell"));
        tr.appendChild(this.createTableCell(team.drawn, "drawn-cell"));
        tr.appendChild(this.createTableCell(team.lost, "lost-cell"));
        tr.appendChild(this.createTableCell(team.gf || team.goalsFor, "gf-cell"));
        tr.appendChild(this.createTableCell(team.ga || team.goalsAgainst, "ga-cell"));
        tr.appendChild(this.createTableCell(team.gd || team.goalDifference, "gd-cell"));
        tr.appendChild(this.createTableCell(team.points, "points-cell highlight"));
        if (this.config.showForm) {
          const formCell = this.createTableCell("", "form-cell");
          formCell.appendChild(this.createFormIndicator(team.form));
          tr.appendChild(formCell);
        }
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      const tableWrapper = document.createElement("div");
      tableWrapper.className = "league-body-scroll";
      tableWrapper.appendChild(table);
      return tableWrapper;
    },
    _renderFooterControls() {
      const footer = document.createElement("div");
      footer.className = "back-to-top-controls";
      const lastUpdate = document.createElement("div");
      lastUpdate.className = "last-updated xsmall dimmed";
      const date = /* @__PURE__ */ new Date();
      const data = this.leagueData[this.currentLeague];
      const source = data && (data.source || data.provider) || "";
      const sourceText = source ? ` (${source})` : "";
      const timeStr = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
      lastUpdate.textContent = this.translate("LAST_UPDATED") + ": " + timeStr + sourceText;
      footer.appendChild(lastUpdate);
      const controls = document.createElement("div");
      controls.className = "footer-buttons";
      const btt = document.createElement("button");
      btt.className = "back-to-top-btn";
      btt.title = "Back to Top";
      btt.appendChild(this.createIcon("fa fa-arrow-up"));
      const bttLabel = document.createElement("span");
      bttLabel.textContent = "Back To Top";
      btt.appendChild(bttLabel);
      btt.onclick = () => this.handleBackToTopClick();
      controls.appendChild(btt);
      footer.appendChild(controls);
      return footer;
    },
    createUEFAView(data) {
      const wrapper = document.createElement("div");
      wrapper.className = "uefa-view";
      const subTabNav = document.createElement("div");
      subTabNav.className = "sub-tab-navigation";
      const tabs = ["Table", "Fixtures", "Results"];
      tabs.forEach((tab) => {
        const btn = document.createElement("button");
        btn.className = "sub-tab-btn" + (this.currentSubTab === tab || !this.currentSubTab && tab === "Table" ? " active" : "");
        btn.textContent = this.translate(tab.toUpperCase());
        btn.onclick = () => {
          this.currentSubTab = tab;
          this._lastRenderedKey = null;
          this.updateDom();
        };
        subTabNav.appendChild(btn);
      });
      wrapper.appendChild(subTabNav);
      const currentTab = this.currentSubTab || "Table";
      if (currentTab === "Table") {
        wrapper.appendChild(this.createTable(data));
      } else {
        const fixturesWrapper = document.createElement("div");
        fixturesWrapper.className = "fixtures-scroll-container";
        const fixtures = currentTab === "Results" ? data.fixtures.filter((f) => ["FT", "AET", "PEN"].includes(f.status)).reverse() : data.fixtures.filter((f) => !["FT", "AET", "PEN"].includes(f.status));
        if (fixtures.length === 0) {
          const empty = document.createElement("div");
          empty.className = "no-fixtures small dimmed";
          empty.textContent = this.translate("NO_FIXTURES");
          fixturesWrapper.appendChild(empty);
        } else {
          const fixturesList = document.createElement("div");
          fixturesList.className = "fixtures-list";
          const grouped = {};
          fixtures.forEach((f) => {
            if (!grouped[f.date]) grouped[f.date] = [];
            grouped[f.date].push(f);
          });
          Object.entries(grouped).forEach(([date, dayFixtures]) => {
            const dayBlock = document.createElement("div");
            dayBlock.className = "fixture-day-block";
            const dateHeader = document.createElement("div");
            dateHeader.className = "fixture-date-header";
            dateHeader.textContent = date;
            dayBlock.appendChild(dateHeader);
            dayFixtures.forEach((f) => {
              const row = document.createElement("div");
              row.className = "fixture-row";
              const home = document.createElement("div");
              home.className = "home-team";
              const homeName = document.createElement("span");
              homeName.textContent = this.translateTeamName(f.homeTeam);
              home.appendChild(homeName);
              if (this.config.showTeamLogos) {
                const logo = document.createElement("img");
                logo.className = "team-logo";
                logo.src = this.file("images/" + this.getTeamLogoMapping(f.homeTeam));
                home.appendChild(logo);
              }
              row.appendChild(home);
              const status = document.createElement("div");
              status.className = "fixture-status";
              const score = document.createElement("div");
              const isFinished = ["FT", "AET", "PEN"].includes(f.status);
              score.className = isFinished || f.live ? "fixture-score" : "fixture-time";
              score.textContent = isFinished || f.live ? `${f.homeScore} - ${f.awayScore}` : f.time || "vs";
              status.appendChild(score);
              if (f.live) {
                const live = document.createElement("div");
                live.className = "live-badge";
                live.textContent = "LIVE";
                status.appendChild(live);
              }
              row.appendChild(status);
              const away = document.createElement("div");
              away.className = "away-team";
              if (this.config.showTeamLogos) {
                const logo = document.createElement("img");
                logo.className = "team-logo";
                logo.src = this.file("images/" + this.getTeamLogoMapping(f.awayTeam));
                away.appendChild(logo);
              }
              const awayName = document.createElement("span");
              awayName.textContent = this.translateTeamName(f.awayTeam);
              away.appendChild(awayName);
              row.appendChild(away);
              dayBlock.appendChild(row);
            });
            fixturesList.appendChild(dayBlock);
          });
          fixturesWrapper.appendChild(fixturesList);
        }
        wrapper.appendChild(fixturesWrapper);
      }
      return wrapper;
    },
    _createWC2026View(data) {
      const wrapper = document.createElement("div");
      wrapper.className = "wc2026-view";
      const subTabNav = document.createElement("div");
      subTabNav.className = "sub-tab-navigation wc2026-nav";
      const groups = this.config.showWC2026Groups || ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
      const knockoutStages = this.config.showWC2026Knockouts || ["Rd32", "Rd16", "QF", "SF", "TP", "Final"];
      const allTabs = [...groups, ...knockoutStages];
      if (!this.currentSubTab) this.currentSubTab = groups[0];
      allTabs.forEach((tab) => {
        const btn = document.createElement("button");
        btn.className = "sub-tab-btn" + (this.currentSubTab === tab ? " active" : "");
        btn.textContent = tab;
        btn.onclick = () => {
          this.currentSubTab = tab;
          this._lastRenderedKey = null;
          this.updateDom();
        };
        subTabNav.appendChild(btn);
      });
      this._addHorizontalScrollIndicators(subTabNav, wrapper);
      if (groups.includes(this.currentSubTab)) {
        wrapper.appendChild(this._createWC2026GroupTable(data, this.currentSubTab));
      } else {
        wrapper.appendChild(this._createWC2026KnockoutView(data, this.currentSubTab));
      }
      return wrapper;
    },
    _createFixturesTableV2(fixtures, stage = "") {
      const fixturesWrapper = document.createElement("div");
      fixturesWrapper.className = "fixtures-wrapper-v2";
      const scrollBody = document.createElement("div");
      scrollBody.className = "fixtures-body-scroll";
      if (stage === "Rd32" || stage === "GS") {
        scrollBody.classList.add("restricted-height");
      }
      const table = document.createElement("table");
      table.className = "wc-fixtures-table-v2";
      const tbody = document.createElement("tbody");
      fixtures.forEach((f) => {
        const tr = document.createElement("tr");
        tr.className = "fixture-row-v2";
        if (f.live) tr.classList.add("live");
        if (f.status === "FT") tr.classList.add("finished");
        const dateTd = document.createElement("td");
        dateTd.className = "fixture-date-v2";
        dateTd.textContent = f.date || "";
        tr.appendChild(dateTd);
        const homeTeamTd = document.createElement("td");
        homeTeamTd.className = "fixture-home-team-v2";
        homeTeamTd.textContent = this.translateTeamName(f.homeTeam);
        tr.appendChild(homeTeamTd);
        const homeLogoTd = document.createElement("td");
        homeLogoTd.className = "fixture-home-logo-v2";
        if (this.config.showTeamLogos) {
          const img = document.createElement("img");
          img.className = "fixture-logo-v2";
          const logoUrl = this.getTeamLogoMapping(f.homeTeam);
          if (logoUrl) img.src = logoUrl;
          homeLogoTd.appendChild(img);
        }
        tr.appendChild(homeLogoTd);
        const scoreTd = document.createElement("td");
        scoreTd.className = "fixture-score-v2";
        const scoreWrapper = document.createElement("div");
        scoreWrapper.className = "score-wrapper-v2";
        const mainScore = document.createElement("div");
        mainScore.className = "main-score-v2";
        if (f.live || f.status === "FT" || f.status === "AET" || f.status === "PEN") {
          mainScore.textContent = `${f.homeScore}-${f.awayScore}`;
        } else {
          mainScore.textContent = f.time || "vs";
        }
        scoreWrapper.appendChild(mainScore);
        scoreTd.appendChild(scoreWrapper);
        tr.appendChild(scoreTd);
        const awayLogoTd = document.createElement("td");
        awayLogoTd.className = "fixture-away-logo-v2";
        if (this.config.showTeamLogos) {
          const img = document.createElement("img");
          img.className = "fixture-logo-v2";
          const logoUrl = this.getTeamLogoMapping(f.awayTeam);
          if (logoUrl) img.src = logoUrl;
          awayLogoTd.appendChild(img);
        }
        tr.appendChild(awayLogoTd);
        const awayTeamTd = document.createElement("td");
        awayTeamTd.className = "fixture-away-team-v2";
        awayTeamTd.textContent = this.translateTeamName(f.awayTeam);
        tr.appendChild(awayTeamTd);
        const venueTd = document.createElement("td");
        venueTd.className = "fixture-location-v2";
        venueTd.textContent = f.venue || "";
        tr.appendChild(venueTd);
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      scrollBody.appendChild(table);
      fixturesWrapper.appendChild(scrollBody);
      return fixturesWrapper;
    },
    _createWC2026GroupTable(data, group) {
      const container = document.createElement("div");
      container.className = "wc-group-container";
      const groupData = data.groups && data.groups[group] ? data.groups[group] : data.standings && data.standings[group] ? data.standings[group] : [];
      if (groupData.length === 0) {
        const noData = document.createElement("div");
        noData.className = "no-data small dimmed";
        noData.textContent = "Group data not available yet";
        container.appendChild(noData);
        return container;
      }
      const table = document.createElement("table");
      table.className = "spfl-table wc-table small";
      const thead = document.createElement("thead");
      const hr = document.createElement("tr");
      ["#", "Team", "P", "W", "D", "L", "F", "A", "GD", "Pts"].forEach((h) => {
        const th = document.createElement("th");
        th.textContent = h;
        if (h === "#") th.className = "pos-cell";
        if (h === "Team") th.className = "team-cell";
        if (h === "P") th.className = "played-cell";
        if (h === "W") th.className = "won-cell";
        if (h === "D") th.className = "drawn-cell";
        if (h === "L") th.className = "lost-cell";
        if (h === "F") th.className = "gf-cell";
        if (h === "A") th.className = "ga-cell";
        if (h === "GD") th.className = "gd-cell";
        if (h === "Pts") th.className = "points-cell";
        hr.appendChild(th);
      });
      if (this.config.showForm) {
        const th = document.createElement("th");
        th.textContent = "Form";
        th.className = "form-cell";
        hr.appendChild(th);
      }
      thead.appendChild(hr);
      table.appendChild(thead);
      const tbody = document.createElement("tbody");
      groupData.forEach((team) => {
        const tr = document.createElement("tr");
        tr.appendChild(this.createTableCell(team.position, "pos-cell"));
        const teamCell = this.createTableCell("", "team-cell");
        let logoUrl = team.logo || this.getTeamLogoMapping(team.name);
        if (logoUrl && logoUrl.indexOf("http") !== 0 && logoUrl.indexOf("/") !== 0 && !logoUrl.startsWith("modules/")) {
          logoUrl = this.file(`images/${logoUrl}`);
        }
        if (logoUrl && this.config.showTeamLogos) {
          const img = document.createElement("img");
          img.className = "team-logo";
          img.alt = "";
          this.setupImageLazyLoading(img, logoUrl);
          teamCell.appendChild(img);
        }
        const span = document.createElement("span");
        span.textContent = this.translateTeamName(team.name);
        teamCell.appendChild(span);
        tr.appendChild(teamCell);
        tr.appendChild(this.createTableCell(team.played, "played-cell"));
        tr.appendChild(this.createTableCell(team.won, "won-cell"));
        tr.appendChild(this.createTableCell(team.drawn, "drawn-cell"));
        tr.appendChild(this.createTableCell(team.lost, "lost-cell"));
        tr.appendChild(this.createTableCell(team.goalsFor !== void 0 ? team.goalsFor : team.gf, "gf-cell"));
        tr.appendChild(this.createTableCell(team.goalsAgainst !== void 0 ? team.goalsAgainst : team.ga, "ga-cell"));
        tr.appendChild(this.createTableCell(team.goalDifference !== void 0 ? team.goalDifference : team.gd, "gd-cell"));
        tr.appendChild(this.createTableCell(team.points, "points-cell highlight"));
        if (this.config.showForm) {
          const formCell = this.createTableCell("", "form-cell");
          formCell.appendChild(this.createFormIndicator(team.form));
          tr.appendChild(formCell);
        }
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      container.appendChild(table);
      const fixtures = data.fixtures ? data.fixtures.filter((f) => (f.stage === "GS" || f.stage === group) && f.group === group) : [];
      if (fixtures.length > 0) {
        const fixHeader = document.createElement("div");
        fixHeader.className = "wc-fix-header xsmall dimmed";
        fixHeader.textContent = "Group Fixtures";
        container.appendChild(fixHeader);
        container.appendChild(this._createFixturesTableV2(fixtures, "GS"));
      }
      return container;
    },
    _createWC2026KnockoutView(data, stage) {
      const container = document.createElement("div");
      container.className = "wc-knockout-container";
      const stageMap = {
        "Rd32": ["Rd32", "RD32", "Round of 32"],
        "Rd16": ["Rd16", "RD16", "Round of 16"],
        "QF": ["QF", "Quarter-final", "Quarter"],
        "SF": ["SF", "Semi-final", "Semi"],
        "TP": ["TP", "Third Place", "3rd Place"],
        "Final": ["Final", "The Final"]
      };
      const allowedStages = stageMap[stage] || [stage];
      const fixtures = data.fixtures ? data.fixtures.filter(
        (f) => allowedStages.some((s) => f.stage === s || f.stage?.toUpperCase() === s.toUpperCase())
      ) : [];
      if (fixtures.length === 0) {
        const noData = document.createElement("div");
        noData.className = "no-data small dimmed";
        noData.textContent = "Fixtures not yet determined";
        container.appendChild(noData);
        return container;
      }
      container.appendChild(this._createFixturesTableV2(fixtures, stage));
      return container;
    }
  };

  // src/utils.js
  var utils = {
    /**
     * Enhanced logger for the frontend (DEBUG-02, DEBUG-04)
     * @param {number} level - 1=ERROR, 2=WARN, 3=INFO, 4=DEBUG
     * @param {string} subsystem - The subsystem (e.g., CORE, CACHE, PARSER)
     * @param {string} message - The message to log
     * @param {any} data - Optional data to log alongside the message
     */
    log(level, subsystem, message, data = null) {
      const debugLevel = this.config ? this.config.debugLevel !== void 0 ? this.config.debugLevel : this.config.debug ? 4 : 1 : 1;
      if (level > debugLevel) return;
      const levels = ["", "ERROR", "WARN", "INFO", "DEBUG"];
      const prefix = ` MMM-MyTeams-LeagueTable: [${subsystem}] [${levels[level]}]`;
      switch (level) {
        case 1:
          Log.error(`${prefix} ${message}`, data || "");
          break;
        case 2:
          Log.warn(`${prefix} ${message}`, data || "");
          break;
        case 3:
          Log.info(`${prefix} ${message}`, data || "");
          break;
        case 4:
          Log.info(`${prefix} ${message}`, data || "");
          break;
        default:
          Log.log(`${prefix} ${message}`, data || "");
          break;
      }
    },
    /**
     * Gets the current date, with optional override for testing.
     * Validates dateTimeOverride to prevent invalid date exploits.
     * @returns {Date} The current or overridden date
     */
    getCurrentDate() {
      if (this.config.dateTimeOverride) {
        const validated = this.validateDateTimeOverride(
          this.config.dateTimeOverride
        );
        if (validated) {
          this.log(
            3,
            "CORE",
            `Using validated date override: ${this.config.dateTimeOverride} -> ${validated.toISOString()}`
          );
          return validated;
        }
      }
      return /* @__PURE__ */ new Date();
    },
    /**
     * Security helper: Validates dateTimeOverride input to prevent invalid dates and exploits.
     * @param {string} dateString - The ISO date string to validate
     * @returns {Date|null} The validated Date object or null if invalid
     */
    validateDateTimeOverride(dateString) {
      if (!dateString || typeof dateString !== "string") {
        this.log(2, "CORE", `Invalid dateTimeOverride type: ${typeof dateString}`);
        return null;
      }
      const override = new Date(dateString);
      if (isNaN(override.getTime())) {
        this.log(2, "CORE", `Invalid dateTimeOverride format: ${dateString}`);
        return null;
      }
      const year = override.getFullYear();
      if (year < 1900 || year > 2100) {
        this.log(2, "CORE", `dateTimeOverride year out of range (1900-2100): ${dateString} (year: ${year})`);
        return null;
      }
      return override;
    },
    /**
     * Security helper: Validates CSS color values to prevent CSS injection.
     * Supports Hex, RGB, RGBA, and basic named colors.
     * @param {string} color - The color string to validate
     * @returns {boolean} True if valid
     */
    isValidColor(color) {
      if (!color || typeof color !== "string") return false;
      const hexRegex = /^#([A-Fa-f0-9]{3}){1,2}$|^#([A-Fa-f0-9]{4}){1,2}$/;
      const rgbRegex = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/;
      const rgbaRegex = /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([0-1]?\.?\d+)\s*\)$/;
      const namedColors = [
        "white",
        "black",
        "red",
        "green",
        "blue",
        "yellow",
        "orange",
        "purple",
        "grey",
        "gray",
        "transparent",
        "inherit",
        "initial",
        "unset"
      ];
      return hexRegex.test(color) || rgbRegex.test(color) || rgbaRegex.test(color) || namedColors.includes(color.toLowerCase());
    },
    getCurrentDateString() {
      return this.getCurrentDate().toLocaleDateString("en-CA");
    },
    /**
     * Standardize team names for mapping lookups (case-insensitive, whitespace-normalized, diacritics removed)
     * @param {string} name - The team name to normalize
     * @returns {string} The normalized team name
     */
    normalizeTeamName(name) {
      if (!name || typeof name !== "string") return "";
      let result = String(name).trim();
      result = result.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return result.toLowerCase().replace(/\([^)]*\)/g, "").replace(/\b(and|the|of|rep|republic)\b/g, "").replace(/&/g, " ").replace(/[-]/g, " ").replace(/\s+/g, " ").trim().replace(/[.,]/g, "");
    },
    /**
     * Fuzzy normalization for team names (removes all non-alphanumeric characters)
     * @param {string} str - The team name to normalize
     * @returns {string} The fuzzy normalized team name
     */
    fuzzyNormalizeTeamName(str) {
      const norm = this.normalizeTeamName(str);
      return norm.replace(/[^a-z0-9]/g, "");
    },
    /**
     * Dynamic script loader
     * @param {string} url - The URL of the script to load
     * @returns {Promise}
     */
    loadScript(url) {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${url}"]`)) return resolve();
        const script = document.createElement("script");
        script.src = url;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
        document.head.appendChild(script);
      });
    }
  };

  // src/accessibility.js
  var accessibility = {
    /**
     * Enhanced A11Y helper: Add keyboard navigation support to any element (A11Y-01).
     * Ensures the element is focusable and responds to Enter/Space keys.
     * @param {HTMLElement} element - The element to enhance
     * @param {Function} callback - The action to perform on activation
     */
    addKeyboardNavigation(element, callback) {
      if (!element) return;
      element.setAttribute("tabindex", "0");
      element.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
          e.preventDefault();
          if (callback) callback(e);
        }
      });
    },
    /**
     * A11Y helper: Save the currently focused element's state (A11Y-03).
     * Uses data attributes to identify the focused element across DOM updates.
     */
    saveFocusState() {
      const focusedElement = document.activeElement;
      if (focusedElement && focusedElement !== document.body) {
        this._lastFocusedPath = this._getElementPath(focusedElement);
        this.log(4, "A11Y", `Saving focus state: ${this._lastFocusedPath}`);
      }
    },
    /**
     * A11Y helper: Restore focus to the previously focused element after DOM update (A11Y-03).
     * Attempts to find the element by its saved path or a sensible fallback.
     */
    restoreFocusState() {
      if (!this._lastFocusedPath) return;
      setTimeout(() => {
        const elementToFocus = document.querySelector(this._lastFocusedPath);
        if (elementToFocus) {
          elementToFocus.focus();
          this.log(4, "A11Y", `Restored focus to: ${this._lastFocusedPath}`);
        }
        this._lastFocusedPath = null;
      }, 100);
    },
    /**
     * Private helper: Generate a unique selector path for an element.
     * @param {HTMLElement} el - The element
     * @returns {string} The CSS selector path
     */
    _getElementPath(el) {
      if (!el) return "";
      let path = el.tagName.toLowerCase();
      if (el.id) return `#${el.id}`;
      if (el.className) {
        path += `.${el.className.split(" ").join(".")}`;
      }
      if (el.getAttribute("data-league")) {
        path += `[data-league="${el.getAttribute("data-league")}"]`;
      }
      if (el.getAttribute("data-tab")) {
        path += `[data-tab="${el.getAttribute("data-tab")}"]`;
      }
      return path;
    },
    createAriaLiveRegion() {
      if (!this.ariaLiveRegion) {
        this.ariaLiveRegion = document.createElement("div");
        this.ariaLiveRegion.setAttribute("role", "status");
        this.ariaLiveRegion.setAttribute("aria-live", "polite");
        this.ariaLiveRegion.setAttribute("aria-atomic", "true");
        this.ariaLiveRegion.className = "sr-only";
        this.ariaLiveRegion.style.position = "absolute";
        this.ariaLiveRegion.style.left = "-10000px";
        this.ariaLiveRegion.style.width = "1px";
        this.ariaLiveRegion.style.height = "1px";
        this.ariaLiveRegion.style.overflow = "hidden";
        document.body.appendChild(this.ariaLiveRegion);
      }
    },
    announceToScreenReader(message, force = false) {
      if (!message) return;
      const now = Date.now();
      if (!force && now - this.lastAnnouncement < this.announcementThrottle) {
        this.log(4, "CORE", `[A11Y] Throttled announcement: ${message}`);
        return;
      }
      this.lastAnnouncement = now;
      if (!this.ariaLiveRegion) {
        this.createAriaLiveRegion();
      }
      this.ariaLiveRegion.textContent = "";
      setTimeout(() => {
        this.ariaLiveRegion.textContent = message;
        this.log(4, "CORE", `[A11Y] Screen reader announcement: ${message}`);
      }, 100);
    },
    announceDataUpdate(leagueName) {
      const message = `League data updated for ${leagueName}`;
      this.announceToScreenReader(message);
    },
    announceLiveMatch(homeTeam, awayTeam, homeScore, awayScore, status) {
      const message = `Live match: ${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}, ${status}`;
      this.announceToScreenReader(message);
    },
    announceMatchFinished(homeTeam, awayTeam, homeScore, awayScore) {
      const message = `Match finished: Final score ${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}`;
      this.announceToScreenReader(message);
    }
  };

  // src/index.js
  Module.register("MMM-MyTeams-LeagueTable", Object.assign({}, utils, state, accessibility, rendering, logos, {
    // Default module config
    defaults: {
      updateInterval: 30 * 60 * 1e3,
      retryDelay: 15e3,
      maxRetries: 3,
      animationSpeed: 2e3,
      fadeSpeed: 4e3,
      colored: true,
      maxTeams: 36,
      highlightTeams: ["Celtic", "Hearts"],
      scrollable: true,
      selectedLeagues: ["SCOTLAND_PREMIERSHIP"],
      legacyLeagueToggle: false,
      autoGenerateButtons: true,
      showLeagueButtons: true,
      autoFocusRelevantSubTab: true,
      showWC2026: false,
      showUEFAleagues: false,
      onlyShowWorldCup2026: false,
      showWC2026Groups: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"],
      showWC2026Knockouts: ["Rd32", "Rd16", "QF", "SF", "TP", "Final"],
      showUEFAnockouts: ["Playoff", "Rd16", "QF", "SF", "Final"],
      defaultWCSubTab: "A",
      displayAllTabs: false,
      useMockData: false,
      showSPFL: false,
      showSPFLC: false,
      showEPL: false,
      showUCL: false,
      showUEL: false,
      showECL: false,
      showPosition: true,
      showTeamLogos: true,
      showPlayedGames: true,
      showWon: true,
      showDrawn: true,
      showLost: true,
      showGoalsFor: true,
      showGoalsAgainst: true,
      showGoalDifference: true,
      showPoints: true,
      showForm: true,
      formMaxGames: 6,
      enhancedIndicatorShapes: true,
      highlightedColor: "rgba(255, 255, 255, 0.1)",
      tableDensity: "normal",
      fixtureDateFilter: null,
      theme: "auto",
      customTeamColors: {},
      autoCycle: false,
      cycleInterval: 15 * 1e3,
      wcSubtabCycleInterval: 15 * 1e3,
      autoCycleWcSubtabs: true,
      leagueHeaders: {
        SCOTLAND_PREMIERSHIP: "Scottish Premiership",
        SCOTLAND_CHAMPIONSHIP: "Scottish Championship",
        ENGLAND_PREMIER_LEAGUE: "English Premier League",
        Cymru_Premier_League: "Cymru Premier",
        GERMANY_BUNDESLIGA: "Bundesliga",
        FRANCE_LIGUE1: "Ligue 1",
        SPAIN_LA_LIGA: "La Liga",
        ITALY_SERIE_A: "Serie A",
        NETHERLANDS_EREDIVISIE: "Eredivisie",
        BELGIUM_PRO_LEAGUE: "Belgian Pro League",
        PORTUGAL_PRIMEIRA_LIGA: "Primeira Liga",
        TURKEY_SUPER_LIG: "Turkish Super Lig",
        GREECE_SUPER_LEAGUE: "Greek Super League",
        AUSTRIA_BUNDESLIGA: "Austrian Bundesliga",
        CZECH_LIGA: "Czech Liga",
        DENMARK_SUPERLIGAEN: "Superligaen",
        NORWAY_ELITESERIEN: "Eliteserien",
        SWEDEN_ALLSVENSKAN: "Allsvenskan",
        SWITZERLAND_SUPER_LEAGUE: "Swiss Super League",
        UKRAINE_PREMIER_LEAGUE: "Ukrainian Premier League",
        ROMANIA_LIGA_I: "Romanian Liga I",
        CROATIA_HNL: "Croatian HNL",
        SERBIA_SUPER_LIGA: "Serbian Super Liga",
        HUNGARY_NBI: "Hungarian NB I",
        POLAND_EKSTRAKLASA: "Ekstraklasa",
        BOLIVIA_LIGA_2: "Bolivia Sim\xF3n Bol\xEDvar",
        UEFA_EUROPA_CONFERENCE_LEAGUE: "UEFA Europa Conference League",
        UEFA_EUROPA_LEAGUE: "UEFA Europa League",
        UEFA_CHAMPIONS_LEAGUE: "UEFA Champions League",
        WORLD_CUP_2026: "WC26"
      },
      darkMode: null,
      fontColorOverride: "#FFFFFF",
      opacityOverride: null,
      debug: false,
      debugLevel: 1,
      provider: "auto",
      providerChain: [],
      parallelProviderRacing: false,
      dateTimeOverride: null,
      clearCacheButton: true,
      clearCacheOnStart: false,
      maxTableHeight: 600
    },
    requiresVersion: "2.1.0",
    getScripts() {
      return [
        "european-leagues.js"
      ];
    },
    getHeader() {
      if (this.config.onlyShowWorldCup2026 === true) {
        return "FIFA World Cup 2026";
      }
      return this.data.header || "League Standings";
    },
    start() {
      this.leagueData = {};
      this.loaded = {};
      this.log(3, "CORE", "Starting module");
      this.mergedTeamLogoMap = Object.assign({}, this.config.teamLogoMap || {});
      this.teamAliases = TEAM_ALIASES;
      this.normalizedTeamLogoMap = {};
      this.buildNormalizedTeamMap();
      this.determineEnabledLeagues();
      this.currentLeague = this.enabledLeagueCodes.length > 0 ? this.enabledLeagueCodes[0] : "SCOTLAND_PREMIERSHIP";
      this.enabledLeagueCodes.forEach((leagueCode) => {
        this.leagueData[leagueCode] = null;
        this.loaded[leagueCode] = false;
      });
      this.error = null;
      this.retryCount = 0;
      this.lastAnnouncement = Date.now();
      this.announcementThrottle = 3e3;
      this.createAriaLiveRegion();
      this.setupLazyLoading();
      this.isOnline = navigator.onLine;
      this.setupOfflineDetection();
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register(this.file("service-worker.js")).then(() => this.log(3, "CORE", "Service Worker registered")).catch((err) => this.log(1, "CORE", "Service Worker registration failed: " + err));
      }
      this.loadLogoMappings();
      const uefaLeagues = ["UEFA_CHAMPIONS_LEAGUE", "UEFA_EUROPA_LEAGUE", "UEFA_EUROPA_CONFERENCE_LEAGUE", "UCL", "UEL", "ECL"];
      if (this.currentLeague === "WORLD_CUP_2026") this.currentSubTab = this.config.defaultWCSubTab || "A";
      else if (uefaLeagues.includes(this.currentLeague)) this.currentSubTab = "Table";
      else this.currentSubTab = null;
      this.isScrolling = false;
      this.isContentHidden = false;
      this._lastRenderedKey = null;
      this._pinned = false;
      if (this.config.clearCacheOnStart === true) {
        this.log(3, "CACHE", "Clearing cache on start");
        this.sendSocketNotification("CACHE_CLEAR_ALL");
      }
      this.requestAllLeagueData();
      this.scheduleUpdate();
      if (this.config.autoCycle || this.config.onlyShowWorldCup2026) {
        if (this.config.onlyShowWorldCup2026) {
          this.config.cycleInterval = 30 * 1e3;
          this.config.formMaxGames = 3;
        }
        this.scheduleCycling();
        this.scheduleWorldCupSubtabCycling();
      }
    }
  }));
})();
