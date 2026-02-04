const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;
const INCH_TO_CM = 2.54;
const MM_TO_CM = 10;

function parseRatio(ratioStr) {
    const parts = ratioStr.trim().split(':');
    if (parts.length !== 2) return null;

    const w = parseFloat(parts[0]);
    const h = parseFloat(parts[1]);
    
    return (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) ? null : { w, h };
}

function getScreenDimensions() {
    const ratio = document.getElementById('screenRatio').value;
    const screenSize = parseFloat(document.getElementById('screenSize').value);

    if (!ratio || !screenSize) return null;

    const r = parseRatio(ratio);
    if (!r) return null;

    const diagonal = screenSize;
    const scale = diagonal / Math.sqrt(r.w * r.w + r.h * r.h);
    
    return { width: r.w * scale, height: r.h * scale };
}

function getDistance() {
    const distance = parseFloat(document.getElementById('distance').value);
    const unit = document.getElementById('distanceUnit').value;
    
    if (!distance || isNaN(distance)) return null;
    
    return unit === 'inch' ? distance * INCH_TO_CM : distance;
}

function calcTriangularAngle(baseInCm, distanceCm) {
    return Math.atan2(baseInCm / 2, distanceCm) * 2;
}

function calcCurvedAngle(baseInCm, radiusMm, distanceCm) {
    const radiusCm = radiusMm / MM_TO_CM;
    const arcAngle = baseInCm / radiusCm;
    const b = radiusCm * (1 - Math.cos(arcAngle / 2));
    const c = Math.sqrt((2 * radiusCm * b) - (b * b));
    
    return 2 * Math.atan2(c, distanceCm - b);
}

function calculateFOV() {
    const dimensions = getScreenDimensions();
    const distance = getDistance();

    if (!dimensions || distance === null) {
        alert(t('errorRequired'));
        return;
    }

    const isCurved = document.getElementById('curvedScreen').checked;
    const radiusMm = parseInt(document.getElementById('curveRadius').value) || 1500;
    const isTriple = document.getElementById('tripleScreen').checked;
    const numScreens = isTriple ? 3 : 1;
    const bezelThickness = (parseFloat(document.getElementById('bezelThickness').value) || 0) / 10 * 2;

    const width = (dimensions.width * INCH_TO_CM) + (isTriple ? bezelThickness : 0);
    const height = dimensions.height * INCH_TO_CM;

    const hAngle = isCurved 
        ? calcCurvedAngle(width, radiusMm, distance)
        : calcTriangularAngle(width, distance);

    const ratio = parseRatio(document.getElementById('screenRatio').value);
    const vAngle = 2 * Math.atan2(Math.tan(hAngle / 2) * ratio.h, ratio.w);

    const horizontalFOV = (hAngle * numScreens) * RAD_TO_DEG;
    const verticalFOV = vAngle * RAD_TO_DEG;

    updateResults(horizontalFOV, verticalFOV);
}

function updateResults(horizontalFOV, verticalFOV) {
    document.getElementById('horizontalFOV').textContent = Math.round(horizontalFOV) + '°';
    document.getElementById('verticalFOV').textContent = Math.round(verticalFOV) + '°';
    document.getElementById('resultsSection').style.display = 'block';
}

function toggleCurveRadius() {
    const isCurved = document.getElementById('curvedScreen').checked;
    document.getElementById('radiusGroup').classList.toggle('hidden', !isCurved);
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

    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') calculateFOV();
    });

    calculateFOV();
});
