/* ────────────────────────────────────────────────────────────
   Red Bull fan tribute — content data
   Fan project. Not affiliated with Red Bull GmbH.
   ──────────────────────────────────────────────────────────── */

export const BRAND = {
  slogan: "Gives You Wiiings",
  disclaimer:
    "Unofficial fan tribute. Not affiliated with, sponsored or endorsed by Red Bull GmbH. All trademarks belong to their respective owners.",
  credits:
    "3D models rebuilt for this tribute (Sketchfab: yashwanthantony9542 — CC-BY-4.0). Photography via Wikimedia Commons under CC licenses; podium photo © Erik Junius / Motorsport.com. Individual credits in the footer.",
};

/* ── hero ticker ───────────────────────────────────────────── */
export const BRAND_TICKER = [
  "EST. 1987",
  "FUSCHL AM SEE · AUSTRIA",
  "SOLD IN 170+ COUNTRIES",
  "80 MG CAFFEINE PER 250 ML",
  "TAURINE + B-VITAMINS",
  "GIVES YOU WIIINGS",
];

/* world ticker — where the energy lives */
export const WORLD_TICKER = [
  "ORACLE RED BULL RACING",
  "RED BULL RING · SPIELBERG",
  "RB22 · 2026 CHALLENGER",
  "50/50 POWER SPLIT",
  "100% SUSTAINABLE FUEL",
  "ACTIVE AERO",
];

/* ── The Can ───────────────────────────────────────────────── */
export type FlavorId = "original" | "sugarfree" | "watermelon" | "tropical";

export interface Flavor {
  id: FlavorId;
  name: string;
  tagline: string;
  body: string; // can body hex
  band: string; // band hex
  sun: string; // sun/emblem hex
  ink: string; // text color on label
  accent: string;
  kcal: string;
  caffeine: string;
}

export const FLAVORS: Flavor[] = [
  {
    id: "original",
    name: "Original",
    tagline: "The classic wings",
    body: "#0A1B8F",
    band: "#C9CBDD",
    sun: "#FFD300",
    ink: "#F5F7FA",
    accent: "#DB0840",
    kcal: "110 kcal / 250 ml",
    caffeine: "80 mg caffeine",
  },
  {
    id: "sugarfree",
    name: "Sugarfree",
    tagline: "Zero sugar. Full wings.",
    body: "#101733",
    band: "#9BA6C4",
    sun: "#C0BFBF",
    ink: "#F5F7FA",
    accent: "#7FD1FF",
    kcal: "3 kcal / 250 ml",
    caffeine: "80 mg caffeine",
  },
  {
    id: "watermelon",
    name: "Watermelon Edition",
    tagline: "Summer limited drop",
    body: "#8F1030",
    band: "#F2B8C6",
    sun: "#FF6D7E",
    ink: "#FFF3F5",
    accent: "#FFD300",
    kcal: "110 kcal / 250 ml",
    caffeine: "80 mg caffeine",
  },
  {
    id: "tropical",
    name: "Tropical Edition",
    tagline: "Exotic energy",
    body: "#B4650E",
    band: "#FFE3A3",
    sun: "#FFC906",
    ink: "#FFF8EC",
    accent: "#F4801F",
    kcal: "110 kcal / 250 ml",
    caffeine: "80 mg caffeine",
  },
];

/* single canonical ingredient list */
export const INGREDIENTS = [
  { name: "Taurine", value: "1000 mg", note: "An amino acid naturally occurring in the human body." },
  { name: "Caffeine", value: "80 mg", note: "About the same amount as in a cup of filtered coffee." },
  { name: "B-Vitamins", value: "B3 · B5 · B6 · B12", note: "Contribute to normal energy-yielding metabolism." },
  { name: "Alpine Water", value: "Sourced", note: "Fresh Alpine water of the highest quality." },
  { name: "Sugars", value: "27 g", note: "The Original's quick fuel — or zero, in Sugarfree." },
];

/* explode layer chips — positioned around the can (kept below the heading) */
export const CAN_LAYERS = [
  {
    label: "Aluminium shell",
    note: "infinitely recyclable",
    pos: "left-[6%] top-[42%] md:left-[15%] md:top-[44%]",
    dot: "bg-rb-silver",
  },
  {
    label: "Liquid core",
    note: "taurine + caffeine + b-vitamins",
    pos: "right-[8%] top-[38%] md:right-[20%] md:top-[40%]",
    dot: "bg-rb-yellow",
  },
  {
    label: "Stay-on tab",
    note: "one flick, one hiss",
    pos: "left-[8%] bottom-[26%] md:left-[18%] md:bottom-[28%]",
    dot: "bg-rb-ice",
  },
  {
    label: "Chassis dome",
    note: "pressurised to ~2 bar",
    pos: "right-[9%] bottom-[22%] md:right-[17%] md:bottom-[26%]",
    dot: "bg-rb-red",
  },
];

/* ── Formula 1 — Oracle Red Bull Racing ────────────────────── */
export interface F1Driver {
  name: string;
  number: number;
  code: string;
  country: string;
  photo?: string;
  titles: number;
  wins: number;
  podiums: number;
  quote: string;
  stat: string;
}

/* 2026 Oracle Red Bull Racing line-up — verified against season coverage */
export const F1_DRIVERS: F1Driver[] = [
  {
    name: "Max Verstappen",
    number: 3,
    code: "VER",
    country: "Netherlands",
    photo: "/images/verstappen-card.jpg",
    titles: 4,
    wins: 71,
    podiums: 131,
    quote: "I just want to win every single race.",
    stat: "Four consecutive world championships 2021–2024 · 2025 runner-up by 2 points",
  },
  {
    name: "Isack Hadjar",
    number: 6,
    code: "HAD",
    country: "France",
    photo: "/images/hadjar-card.jpg",
    titles: 0,
    wins: 0,
    podiums: 1,
    quote: "The step up is where the real learning starts.",
    stat: "First F1 podium at the 2025 Dutch GP — fifth-youngest in history",
  },
];

export const F1_TIMELINE = [
  { year: "2005", title: "Born from Jaguar", text: "Red Bull buys the Jaguar Racing team and enters the grid with its own energy." },
  { year: "2010", title: "First crowns", text: "Vettel and Newey begin the era — four consecutive doubles, 2010–2013." },
  { year: "2021", title: "Last-lap crown", text: "Verstappen takes his first title on the final lap of the season in Abu Dhabi." },
  { year: "2023", title: "RB19 — near perfection", text: "21 wins from 22 races. The most dominant season in F1 history." },
  { year: "2026", title: "The RB22 era", text: "New engine rules, active aero, sustainable fuel — a whole new fight begins." },
];

/* 2026 technical-era feature cards, timed across the pinned showcase */
export const RB22_FEATURES = [
  {
    id: 1,
    tag: "X-MODE",
    name: "Active Aero",
    note: "On the straights front and rear wings flatten out — minimal drag, maximum top speed.",
    side: "left",
  },
  {
    id: 2,
    tag: "Z-MODE",
    name: "Cornering Trim",
    note: "Braking from 350 km/h the aero snaps to a high-downforce trim in under a second.",
    side: "right",
  },
  {
    id: 3,
    tag: "50 / 50",
    name: "Power Unit",
    note: "A V6 turbo and a 350 kW electric motor share the work evenly. The MGU-H is gone.",
    side: "left",
  },
  {
    id: 4,
    tag: "E-FUEL",
    name: "Sustainable Fuel",
    note: "100% drop-in sustainable fuel — same scream, radically cleaner supply chain.",
    side: "right",
  },
];

export const MACHINE_STATS = [
  { l: "POWER SPLIT", v: "50 / 50" },
  { l: "ELECTRIC MOTOR", v: "350 KW" },
  { l: "MIN WEIGHT", v: "770 KG" },
  { l: "TOP SPEED", v: "350+ KM/H" },
];

export const F1_SEASON_STATS = [
  { label: "Wins in one season — RB19, 2023", value: 21, suffix: "/22", decimals: 0 },
  { label: "Constructors' titles", value: 6, suffix: "", decimals: 0 },
  { label: "Drivers' titles", value: 8, suffix: "", decimals: 0 },
  { label: "Verstappen career wins", value: 71, suffix: "", decimals: 0 },
];

export const RED_BULL_RING = {
  name: "Red Bull Ring",
  location: "Spielberg, Styria — Austria",
  lengthKm: 4.318,
  turns: 10,
  drsZones: 3,
  altitudeM: 677,
  lapRecord: "1:05.619",
  lapRecordHolder: "Carlos Sainz, 2020",
};

/* ── brand scale (NumbersBand) ─────────────────────────────── */
export interface BrandNumber {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export const BRAND_NUMBERS: BrandNumber[] = [
  { label: "group turnover, FY 2025", value: 12.2, prefix: "€", suffix: "B", decimals: 1 },
  { label: "countries & territories", value: 171, suffix: "+", decimals: 0 },
  { label: "employees worldwide", value: 21924, suffix: "", decimals: 0 },
  { label: "years of energy — since 1987", value: 39, suffix: "", decimals: 0 },
];

/* photography — Wikimedia Commons credits (CC BY / CC BY-SA) */
export const IMAGE_CREDITS = [
  {
    file: "/images/f1-car-track.jpg",
    title: "FIA F1 Austria 2026 Nr. 3 Verstappen",
    author: "Lukas Raich",
    source: "https://commons.wikimedia.org/wiki/File:FIA_F1_Austria_2026_Nr._3_Verstappen_(3).jpg",
    license: "CC BY-SA 4.0",
  },
  {
    file: "/images/f1-podium-2021.webp",
    title: "Abu Dhabi GP podium, 2021 — Verstappen crowned World Champion",
    author: "Erik Junius / Motorsport.com",
    source: "https://cdn.motorsport.com/images/mgl/6D1nZOG0/s1200/podium-race-winner-and-2021-f1-1.webp",
    license: "© Erik Junius / Motorsport.com",
  },
  {
    file: "/images/verstappen-card.jpg",
    title: "Max Verstappen, 2024 British GP",
    author: "Jen Ross",
    source: "https://commons.wikimedia.org/wiki/File:2024_British_Grand_Prix,_Verstappen_(3).jpg",
    license: "CC BY 2.0",
  },
  {
    file: "/images/hadjar-card.jpg",
    title: "Isack Hadjar, 2026 Chinese GP",
    author: "Liauzh",
    source: "https://commons.wikimedia.org/wiki/File:2026_Chinese_GP_-_Red_Bull_-_Isack_Hadjar_-_Sprint_Qualifying.jpg",
    license: "CC BY 4.0",
  },
  {
    file: "/images/crowd-fans.jpg",
    title: "Verstappen supporters at the 2017 Malaysian GP",
    author: "Morio",
    source: "https://commons.wikimedia.org/wiki/File:Max_Verstappen_supporters_running_to_the_podium_2017_Malaysia.jpg",
    license: "CC BY-SA 4.0",
  },
  {
    file: "/images/can-classic.jpg",
    title: "Red Bull energy drink cans",
    author: "Oto Zapletal",
    source: "https://commons.wikimedia.org/wiki/File:Red_Bull_energy_drinks.jpg",
    license: "CC BY-SA 4.0",
  },
  {
    file: "/images/ring-aerial.jpg",
    title: "Red Bull Ring from orbit (SkySat)",
    author: "Planet Labs, Inc.",
    source: "https://commons.wikimedia.org/wiki/File:Red_Bull_Ring,_April_18,_2018_SkySat.jpg",
    license: "CC BY-SA 4.0",
  },
];

/* ── Beyond F1 — the wider Red Bull universe ───────────────── */
export const UNIVERSE_CARDS = [
  {
    key: "4 CLUBS · 3 CONTINENTS",
    title: "Football",
    text: "A football family spanning Europe and the Americas — one playing philosophy, four badges.",
    items: ["RB Leipzig — Bundesliga", "New York Red Bulls — MLS", "FC Red Bull Salzburg", "Red Bull Bragantino"],
  },
  {
    key: "ICEHL + DEL",
    title: "Ice Hockey",
    text: "Two perennial contenders in Europe's strongest leagues, both famous for their academies.",
    items: ["EC Red Bull Salzburg — ICEHL", "EHC Red Bull München — DEL"],
  },
  {
    key: "GRAND PRIX LADDER",
    title: "Motorcycles",
    text: "From the junior squad all the way to the premier class — riders climb the Red Bull KTM ladder.",
    items: ["Red Bull KTM Factory Racing — MotoGP", "Red Bull KTM Ajo — Moto2 / Moto3"],
  },
  {
    key: "2003 – 2019",
    title: "Air Race",
    text: "The Air Race World Championship: raceplanes threading inflatable pylons at up to 370 km/h across six continents.",
    items: ["14 seasons", "Six continents", "Challenger + Master classes"],
  },
  {
    key: "SINCE 2000",
    title: "Street & Mountain",
    text: "Home-made soapboxes, human-powered flying machines, breaking battles and freeride drops.",
    items: ["Soapbox Race — 2000", "Rampage — 2001", "BC One — 2004", "Flugtag", "Cliff Diving — 2009"],
  },
  {
    key: "EST. 2007",
    title: "Media House",
    text: "The in-house studio behind the brand's films, series and documentaries — plus The Red Bulletin magazine.",
    items: ["Films & docs", "Original series", "The Red Bulletin"],
  },
];

export const UNIVERSE_TICKER = [
  "RB LEIPZIG",
  "NEW YORK RED BULLS",
  "FC SALZBURG",
  "BRAGANTINO",
  "KTM FACTORY RACING",
  "AIR RACE",
  "BC ONE",
  "RAMPAGE",
  "FLUGTAG",
  "CLIFF DIVING",
  "THE RED BULLETIN",
];

/* ── Nav ─────────────────────────────────────────────────────
   "machine" is the pinned RB22 wind-tunnel block inside #racing —
   scrollToSection resolves it through its ScrollTrigger.
   "pilots" anchors the drivers block in the #racing outro. */
export const NAV_SECTIONS = [
  { id: "hero", label: "Home", n: "00" },
  { id: "can", label: "The Can", n: "01" },
  { id: "racing", label: "Racing", n: "02" },
  { id: "machine", label: "The Machine", n: "03" },
  { id: "pilots", label: "The Pilots", n: "04" },
  { id: "universe", label: "Universe", n: "05" },
  { id: "numbers", label: "Scale", n: "06" },
  { id: "manifesto", label: "Manifesto", n: "07" },
];
