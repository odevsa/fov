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

const CARS = {
    drift: {
        ref: 'drift',
        image: `img/drift.png`,
        car: { width: 169, height: 129, length: 452 },
        scale: 1.75,
        offset: {
            horizontal: { x: 250, y: 140 },
            vertical: { x: 250, y: 105 },
        },
    },
    gt3: {
        ref: 'gt3',
        image: `img/gt3.png`,
        car: { width: 185.2, height: 127.9, length: 457.3 },
        scale: 1.725,
        offset: {
            horizontal: { x: 240, y: 65 },
            vertical: { x: 240, y: 105 },
        },
    },
    f1: {
        ref: 'f1',
        image: `img/f1.png`,
        scale: 1.45,
        car: { width: 190, height: 110, length: 545.0 },
        offset: {
            horizontal: { x: 270, y: 100 },
            vertical: { x: 270, y: 85 },
        },
    },
}

function parseRatio(ratio) {
    if (!ratio) return null;

    const parts = ratio.trim().split(':');
    if (parts.length !== 2) return;

    const h = parseFloat(parts[0]);
    const v = parseFloat(parts[1]);
    
    if(isNaN(h) || isNaN(v) || h <= 0 || v <= 0) return;

    return { h, v };
}

function getDistance(distance, unit) {
    if (!distance || isNaN(distance)) return;
    
    return unit === 'inch' ? distance * INCH_TO_CM : distance;
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
        curved: form.curved,
        radius: form.radius / 10,
        bezel: form.bezel / 10,
    });

    updateForm(form);
    updateResults(fov);
    updateDraw({
        ratio,
        size: form.size,
        horizontal: fov.horizontal, 
        vertical: fov.vertical,
        screenAmount: form.screens,
        tripleScreenAngle: fov.angle,
        curvedScreenRadius: form.curved ? form.radius / 10 : undefined,
        distance: distance,
        carType: CARS[form.car],
    });
}

function getForm() {
    return {
        ratio: document.getElementById('screenRatio').value,
        size: parseFloat(document.getElementById('screenSize').value),
        distanceUnit: document.getElementById('distanceUnit').value,
        distance: parseFloat(document.getElementById('distance').value),
        screens: document.getElementById('tripleScreen').checked ? 3 : 1,
        curved: parseInt(document.getElementById('curvedScreenRadius').value) >= 500,
        radius: parseInt(document.getElementById('curvedScreenRadius').value),
        bezel: parseInt(document.getElementById('bezelThickness').value),
        car: document.getElementById('carType').value,
    };
}

function updateForm(form) {
    document.getElementById('screenSizeOutput').textContent = form.size.toFixed(1);
    document.getElementById('distanceOutput').textContent = form.distance;
    document.getElementById('curvedScreenRadiusOutput').textContent = form.radius;
    document.getElementById('bezelThicknessOutput').textContent = form.bezel;

    document.getElementById('curvedScreenRadiusOutput').style = `display: ${form.radius >= 500 ? 'inline' : 'none'};`;
    document.getElementById('curvedScreenRadiusOutputFlat').style = `display: ${form.radius < 500 ? 'inline' : 'none'};`;        
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
    document.getElementById('tripleScreen').addEventListener('change', toggleBezel);
    document.getElementById('singleScreen').addEventListener('change', toggleBezel);
    document.getElementById('distanceUnit').addEventListener('change', convertDistanceUnit);
    document.getElementById('screenRatio').addEventListener('change', calculateFOV);
    document.getElementById('carType').addEventListener('change', calculateFOV);

    document.getElementById('screenSize').addEventListener('input', calculateFOV);
    document.getElementById('distance').addEventListener('input', calculateFOV);
    document.getElementById('curvedScreenRadius').addEventListener('input', calculateFOV);
    document.getElementById('bezelThickness').addEventListener('input', calculateFOV);

    calculateFOV();
});
