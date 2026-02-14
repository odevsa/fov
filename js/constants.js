const HALF_PI = Math.PI / 2;
const DOUBLE_PI = Math.PI * 2;
const INCH_TO_CM = 2.54;

const LOCALES = [
  "en",
  "pt-BR",
  "es",
  "fr",
  "de",
  "it",
  "ja",
  "zh-CN",
  "ru",
  "ko",
];

const GAMES = {
  horizontal: [
    { name: "iRacing", factor: 1, digits: 0, unit: "°" },
    { name: "Automobilista 2", factor: 1, digits: 0, unit: "°" },
    { name: "RaceRoom Racing Experience", factor: 1, digits: 1, unit: "°" },
    { name: "BeamNG.drive", factor: 1, digits: 1, unit: "°" },
    { name: "Project CARS 1/2/3", factor: 1, digits: 0, unit: "°" },
    { name: "Euro Truck Simulator", factor: 1, digits: 0, unit: "°" },
    { name: "American Truck Simulator", factor: 1, digits: 0, unit: "°" },
    { name: "F1 2016~2018", type: "f1", factor: 0.05, digits: 2, unit: "" },
    { name: "F1 2019~2020", type: "f1", factor: 0.1, digits: 1, unit: "" },
    { name: "F1 2021+", type: "f1", factor: 1, digits: 0, unit: "" },
  ],
  vertical: [
    { name: "Assetto Corsa", factor: 1, digits: 1, unit: "°" },
    { name: "Assetto Corsa Competizione", factor: 1, digits: 1, unit: "°" },
    { name: "Assetto Corsa EVO", factor: 1, digits: 1, unit: "°" },
    { name: "Automobilista", factor: 1, digits: 0, unit: "°" },
    { name: "Game Stock Car", factor: 1, digits: 0, unit: "°" },
    { name: "Game Stock Car Extreme", factor: 1, digits: 0, unit: "°" },
    { name: "Stock Car Extreme", factor: 1, digits: 0, unit: "°" },
    { name: "rFactor 1/2", factor: 1, digits: 0, unit: "°" },
    {
      name: "Live for Speed",
      type: "multiplier",
      factor: 2,
      digits: 0,
      unit: "°",
    },
    {
      name: "GRID Autosport",
      type: "multiplier",
      factor: 2,
      digits: 0,
      unit: "°",
    },
    { name: "DiRT Rally 1/2", factor: 2, digits: 0, unit: "°" },
    { name: "Le Mans Ultimate", factor: 1, digits: 0, unit: "°" },
    { name: "WRC", factor: 1, digits: 0, unit: "°" },
    { name: "GTR 2", type: "divider", factor: 58, digits: 1, unit: "x" },
    { name: "Race07", type: "divider", factor: 58, digits: 1, unit: "x" },
    {
      name: "Richard Burns Rally",
      type: "rbr",
      factor: 1,
      digits: 6,
      unit: "rad",
    },
  ],
};

const CARS = {
  drift: {
    ref: "drift",
    image: `img/drift.png`,
    car: { width: 169, height: 129, length: 452 },
    scale: 1.75,
    offset: {
      horizontal: { x: 250, y: 140, shift: 0 },
      vertical: { x: 250, y: 105, shift: 0 },
    },
  },
  gt3: {
    ref: "gt3",
    image: `img/gt3.png`,
    car: { width: 185.2, height: 127.9, length: 457.3 },
    scale: 1.725,
    offset: {
      horizontal: { x: 240, y: 65, shift: 0 },
      vertical: { x: 240, y: 105, shift: 0 },
    },
  },
  f1: {
    ref: "f1",
    image: `img/f1.png`,
    scale: 1.45,
    car: { width: 190, height: 110, length: 545.0 },
    offset: {
      horizontal: { x: 270, y: 100, shift: 0 },
      vertical: { x: 270, y: 85, shift: 0 },
    },
  },
  truck: {
    ref: "truck",
    image: `img/truck.png`,
    scale: 1.25,
    car: { width: 247, height: 354, length: 630 },
    offset: {
      horizontal: { x: 110, y: 80, shift: 250 },
      vertical: { x: 110, y: 240, shift: 0 },
    },
  },
};

const DRAW = {
  debug: false,
  debugColor: "rgba(255, 0, 0, 0.25)",
  userColor: "rgb(255, 255, 0)",
  measurementColor: "rgb(255, 255, 255)",
  measurementFontSize: 18,
  measurementStrokeColor: "rgba(75, 75, 75, 1)",
  measurementStrokeSize: 8,
  userRadius: 10,
  screenThickness: 10,
  screenColor: "rgb(255, 255, 0)",
  fovBackground: "rgba(0, 255, 0, 0.15)",
  fovMultiplier: 10,
  fovLines: "rgb(0, 255, 0)",
  fovLinesThickness: 2,
  fontSize: 22,
  carOpacity: 1,
};
