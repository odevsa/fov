const INCH_TO_CM = 2.54;
const GAMES = {
    horizontal: [
        { name: 'Euro Truck Simulator', factor: 1, digits: 0, unit: '°' },
        { name: 'RaceRoom Racing Experience', factor: 1, digits: 1, unit: '°' },
    ],
    vertical: [
        { name: 'Assetto Corsa', factor: 1, digits: 1, unit: '°' },
        { name: 'Assetto Corsa Competizione', factor: 1, digits: 1, unit: '°' },
        { name: 'rFactor', factor: 1, digits: 0, unit: '°' },
    ]
}

function parseRatio(ratioStr) {
    const parts = ratioStr.trim().split(':');
    if (parts.length !== 2) return;

    const h = parseFloat(parts[0]);
    const v = parseFloat(parts[1]);
    
    if(isNaN(h) || isNaN(v) || h <= 0 || v <= 0) return;

    return { h, v };
}

function getRatio() {
    const ratio = document.getElementById('screenRatio').value;
    if (!ratio || !screenSize) return null;
    return parseRatio(ratio);
}

function getSize() {
    return parseFloat(document.getElementById('screenSize').value);
}

function getDistance() {
    const distance = parseFloat(document.getElementById('distance').value);
    const unit = document.getElementById('distanceUnit').value;
    
    if (!distance || isNaN(distance)) return;
    
    return unit === 'inch' ? distance * INCH_TO_CM : distance;
}


function calculateFOV() {
    const ratio = getRatio();
    const size = getSize();
    const distance = getDistance();
    const screens = document.getElementById('tripleScreen').checked ? 3 : 1;
    const curved = document.getElementById('curvedScreen').checked;
    const radius = parseInt(document.getElementById('curveRadius').value) / 10;
    const bezel = (parseFloat(document.getElementById('bezelThickness').value) || 0) / 10;
    const carType = document.getElementById('carType').value;

    const fov = FOV.calculate({ratio, size, distance, screens, curved, radius, bezel});
    updateResults(fov);
    updateDraw({
        horizontal: fov.horizontal, 
        vertical: fov.vertical,
        screenAmount: screens,
        tripleScreenAngle: fov.angle,
        screenCurveRadius: curved ? radius : undefined,
        distance: distance,
        car: `img/${carType}.png`
    });
}

function gameHtml(label, value) {
    const divContainer = document.createElement('div');
    divContainer.className = 'result-item';

    const divLabel = document.createElement('div');
    divLabel.className = 'result-label';
    divLabel.textContent = label;
    
    const divValue = document.createElement('div');
    divValue.className = 'result-value';
    divValue.textContent = value;

    divContainer.appendChild(divLabel);
    divContainer.appendChild(divValue);
    return divContainer;
}

function updateResults(fov) {
    const voidSimbol = '∞';
    document.getElementById('horizontalFOV').textContent = isNaN(fov.horizontal) ? voidSimbol: Math.round(fov.horizontal) + '°';
    document.getElementById('verticalFOV').textContent = isNaN(fov.vertical) ? voidSimbol: Math.round(fov.vertical) + '°';
    document.getElementById('tripleScreenAngle').textContent =  isNaN(fov.angle) ? voidSimbol: fov.angle.toFixed(2) + '°';


    const horizontalGamesDiv = document.getElementById('horizontal-games');
    horizontalGamesDiv.innerHTML = '';
    GAMES.horizontal.forEach(game => {
        const value = isNaN(fov.horizontal) ? voidSimbol : (fov.horizontal * game.factor).toFixed(game.digits) + game.unit;
        horizontalGamesDiv.appendChild(gameHtml(game.name, value));
    });

    const verticalGamesDiv = document.getElementById('vertical-games');
    verticalGamesDiv.innerHTML = '';
    GAMES.vertical.forEach(game => {
        const value = isNaN(fov.vertical) ? voidSimbol : (fov.vertical * game.factor).toFixed(game.digits) + game.unit;
        verticalGamesDiv.appendChild(gameHtml(game.name, value));
    });
}

function toggleCurveRadius() {
    const isCurved = document.getElementById('curvedScreen').checked;
    document.getElementById('radiusGroup').classList.toggle('hidden', !isCurved);
    calculateFOV();
}

function toggleBezel() {
    const isTriple = document.getElementById('tripleScreen').checked;
    document.getElementById('bezelGroup').classList.toggle('hidden', !isTriple);
    calculateFOV();
}

function convertDistanceUnit() {
    const distanceInput = document.getElementById('distance');
    const unitSelect = document.getElementById('distanceUnit');
    
    const currentValue = parseFloat(distanceInput.value);
    if (!currentValue || isNaN(currentValue)) return;
    
    const newUnit = unitSelect.value;
    let convertedValue;
    
    if (newUnit === 'inch') {
        convertedValue = currentValue / INCH_TO_CM;
    } else {
        convertedValue = currentValue * INCH_TO_CM;
    }
    
    distanceInput.value = Math.round(convertedValue);
    calculateFOV();
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('curvedScreen').addEventListener('change', toggleCurveRadius);
    document.getElementById('tripleScreen').addEventListener('change', toggleBezel);
    document.getElementById('singleScreen').addEventListener('change', toggleBezel);
    document.getElementById('distanceUnit').addEventListener('change', convertDistanceUnit);
    document.getElementById('curveRadius').addEventListener('input', toggleCurveRadius);
    
    document.getElementById('screenRatio').addEventListener('change', calculateFOV);
    document.getElementById('screenSize').addEventListener('input', calculateFOV);
    document.getElementById('distance').addEventListener('input', calculateFOV);
    document.getElementById('curveRadius').addEventListener('input', calculateFOV);
    document.getElementById('bezelThickness').addEventListener('input', calculateFOV);
    document.getElementById('carType').addEventListener('change', calculateFOV);

    calculateFOV();
});
