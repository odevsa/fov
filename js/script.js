function parseRatio(ratio) {
  if (!ratio) return null;

  const parts = ratio.trim().split(":");
  if (parts.length !== 2) return;

  const h = parseFloat(parts[0]);
  const v = parseFloat(parts[1]);

  if (isNaN(h) || isNaN(v) || h <= 0 || v <= 0) return;

  return { h, v };
}

function getDistance(distance, unit) {
  if (!distance || isNaN(distance)) return;

  return unit === "inch" ? distance * INCH_TO_CM : distance;
}

function calculateFOV() {
  const form = getForm();
  const ratio = parseRatio(form.ratio);
  const distance = getDistance(form.distance, form.distanceUnit);

  const fov = FOV.calculate({
    ratio,
    size: form.size,
    distance,
    screens: form.screens,
    screenRadius: form.screenRadius ? form.screenRadius / 10 : undefined,
    bezel: form.bezel / 10,
  });

  updateForm(form);
  updateResults(fov);
  updateDraw({
    ratio: fov.ratio,
    size: fov.size,
    width: fov.width,
    height: fov.height,
    horizontal: fov.horizontal,
    tripleScreen: fov.tripleScreen,
    vertical: fov.vertical,
    screenAmount: fov.screens,
    tripleScreenAngle: fov.angle,
    screenRadius: fov.screenRadius,
    bezel: fov.bezel,
    distance: distance,
    unit: form.distanceUnit,
    carType: CARS[form.car],
  });
}

function getForm() {
  return {
    ratio: document.querySelector('input[name="screenRatio"]:checked').value,
    size: parseFloat(document.getElementById("screenSize").value),
    distanceUnit: document.getElementById("distanceUnit").value,
    distance: parseFloat(document.getElementById("distance").value),
    screens: parseInt(
      document.querySelector('input[name="screenType"]:checked').value,
    ),
    screenRadius:
      parseInt(document.getElementById("curvedScreenRadius").value) >= 500
        ? parseInt(document.getElementById("curvedScreenRadius").value)
        : undefined,
    bezel: parseInt(document.getElementById("bezelThickness").value),
    car: document.querySelector('input[name="carType"]:checked').value,
  };
}

function updateForm(form) {
  document.getElementById("screenSizeOutput").textContent =
    form.size.toFixed(1);
  document.getElementById("distanceOutput").textContent = form.distance;
  document.getElementById("curvedScreenRadiusOutput").textContent =
    form.screenRadius;
  document.getElementById("bezelThicknessOutput").textContent = form.bezel;

  document.getElementById("curvedScreenRadiusOutput").style =
    `display: ${!!form.screenRadius ? "inline" : "none"};`;
  document.getElementById("curvedScreenRadiusOutputFlat").style =
    `display: ${!form.screenRadius ? "inline" : "none"};`;
}

function gameHtml(label, value) {
  const divContainer = document.createElement("div");
  divContainer.className = "result-item";

  const divLabel = document.createElement("div");
  divLabel.className = "result-label";
  divLabel.textContent = label;

  const divValue = document.createElement("div");
  divValue.className = "result-value";
  divValue.textContent = value;

  divContainer.appendChild(divLabel);
  divContainer.appendChild(divValue);
  return divContainer;
}

function updateResults(fov) {
  const voidSimbol = "∞";
  document.getElementById("horizontalFOV").textContent = isNaN(
    fov.tripleScreen ?? fov.horizontal,
  )
    ? voidSimbol
    : (fov.tripleScreen ?? fov.horizontal).toFixed(1) + "°";
  document.getElementById("verticalFOV").textContent = isNaN(fov.vertical)
    ? voidSimbol
    : fov.vertical.toFixed(1) + "°";
  document.getElementById("tripleScreenAngle").textContent = isNaN(fov.angle)
    ? voidSimbol
    : fov.angle.toFixed(2) + "°";

  const horizontalGamesDiv = document.getElementById("horizontal-games");
  horizontalGamesDiv.innerHTML = "";
  GAMES.horizontal.forEach((game) => {
    const value = isNaN(fov.horizontal)
      ? voidSimbol
      : fovValue(
          game.type,
          fov,
          "horizontal",
          game.factor ?? 1,
          game.digits ?? 1,
        ) + (game.unit ?? "");
    horizontalGamesDiv.appendChild(gameHtml(game.name, value));
  });

  const verticalGamesDiv = document.getElementById("vertical-games");
  verticalGamesDiv.innerHTML = "";
  GAMES.vertical.forEach((game) => {
    const value = isNaN(fov.vertical)
      ? voidSimbol
      : fovValue(
          game.type,
          fov,
          "vertical",
          game.factor ?? 1,
          game.digits ?? 1,
        ) + (game.unit ?? "");
    verticalGamesDiv.appendChild(gameHtml(game.name, value));
  });
}

function fovValue(type, fov, fovSide, factor, digits) {
  switch (type) {
    case "multiplier":
      return FOV.calculateMultiplier(fov[fovSide], factor).toFixed(digits);
    case "divider":
      return FOV.calculateDivider(fov[fovSide], factor).toFixed(digits);
    case "f1":
      return FOV.calculateF1(fov[fovSide], factor).toFixed(digits);
    case "rbr":
      return FOV.calculateRBR(fov.width, fov.distance, fov.ratio).toFixed(
        digits,
      );
    default:
      return fov[fovSide].toFixed(digits);
  }
}

function toggleBezel() {
  const isTriple = document.getElementById("tripleScreen").checked;
  document.getElementById("bezelGroup").classList.toggle("hidden", !isTriple);
}

function convertDistanceUnit() {
  const distanceInput = document.getElementById("distance");
  const unitSelect = document.getElementById("distanceUnit");

  const currentValue = parseFloat(distanceInput.value);
  if (!currentValue || isNaN(currentValue)) return;

  const newUnit = unitSelect.value;
  let convertedValue;

  if (newUnit === "inch") {
    convertedValue = currentValue / INCH_TO_CM;
    distanceInput.min = 10;
    distanceInput.max = 80;
  } else {
    distanceInput.min = 25;
    distanceInput.max = 200;
    convertedValue = currentValue * INCH_TO_CM;
  }

  distanceInput.value = Math.round(convertedValue);
  calculateFOV();
}

function increase(id) {
  const range = document.getElementById(id);
  range.value = parseFloat(range.value) + parseFloat(range.step ?? 1);

  const event = new Event("input", { bubbles: true });
  range.dispatchEvent(event);
}

function decrease(id) {
  const range = document.getElementById(id);
  range.value = parseFloat(range.value) - parseFloat(range.step ?? 1);

  const event = new Event("input", { bubbles: true });
  range.dispatchEvent(event);
}

function resize() {
  const videoSection = document.getElementById("video-section");
  const videoSectionParent = videoSection.parentElement;

  if (window.innerWidth <= 768) {
    if (videoSectionParent.id === "right-column") return;
    document.getElementById("right-column").appendChild(videoSection);
    return;
  }

  if (videoSectionParent.id === "left-column") return;
  document.getElementById("left-column").appendChild(videoSection);
}

document.addEventListener("DOMContentLoaded", () => {
  window.addEventListener("load", resize);
  window.addEventListener("resize", resize);

  document.querySelectorAll('input[name="screenRatio"]').forEach((radio) => {
    radio.addEventListener("change", calculateFOV);
  });
  document.querySelectorAll('input[name="screenType"]').forEach((radio) => {
    radio.addEventListener("change", toggleBezel);
    radio.addEventListener("change", calculateFOV);
  });
  document.querySelectorAll('input[name="carType"]').forEach((radio) => {
    radio.addEventListener("change", calculateFOV);
  });

  document
    .getElementById("distanceUnit")
    .addEventListener("change", convertDistanceUnit);

  document.getElementById("screenSize").addEventListener("input", calculateFOV);
  document.getElementById("distance").addEventListener("input", calculateFOV);
  document
    .getElementById("curvedScreenRadius")
    .addEventListener("input", calculateFOV);
  document
    .getElementById("bezelThickness")
    .addEventListener("input", calculateFOV);

  calculateFOV();
});
