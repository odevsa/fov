const canvas = document.getElementById('draw');
const ctx = canvas.getContext('2d');
const carImageCache = {};

const SETTINGS = {
    debug: false,
    debugColor: 'rgba(255, 0, 0, 0.15)',
    userColor: 'rgb(255, 255, 0)',
    measurementColor: 'rgb(255, 255, 255)',
    measurementFontSize: 18,
    measurementStrokeColor: 'rgba(0, 0, 0, 0.5)',
    measurementStrokeSize: 5,
    userRadius: 10,
    screenThickness: 10,
    screenColor: 'rgb(255, 255, 0)',
    fovBackground: 'rgba(0, 255, 0, 0.15)',
    fovMultiplier: 10,
    fovLines: 'rgb(0, 255, 0)',
    fovLinesThickness: 2,
    fontSize: 22,
    carOpacity: 1,
};

function updateDraw(params) {
    const { ratio, size, horizontal, vertical, tripleScreenAngle, screenAmount, curvedScreenRadius, distance, carType } = params;    
    const carPosition = getCarPosition(carType);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if(!carImageCache[carType.ref]){
        const image = new Image();
        image.src = carType.image;
        image.onload = function() {
            carImageCache[carType.ref] = image;
            updateDraw(params);
        };
    }

    drawCarImage(carType);
    drawHorizontalFov(ratio, size, carPosition, carType, horizontal, distance, screenAmount, tripleScreenAngle, curvedScreenRadius);
    drawVerticalFov(ratio, size, carPosition, carType, vertical, distance);
    
    
    if(SETTINGS.debug) {
        console.log(carType);
        drawCarBox(carPosition);
    }
}

function saveDraw() {
    const image = canvas.toDataURL("image/png");
    
    const link = document.createElement('a');
    link.download = 'fov-calculator-setup.png';
    link.href = image;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function drawCarImage(carType) {
    if(!carImageCache[carType.ref]) return;

    const image = carImageCache[carType.ref];
    const imageWidth = image.naturalWidth;
    const imageHeight = image.naturalHeight;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const scale = Math.min(canvasWidth / imageWidth, canvasHeight / imageHeight);
    
    const x = (canvasWidth - imageWidth * scale) / 2;
    const y = (canvasHeight - imageHeight * scale) / 2;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0); 
    ctx.globalAlpha = SETTINGS.carOpacity;
    ctx.globalCompositeOperation = 'destination-over';
    ctx.drawImage(image, x, y, imageWidth * scale, imageHeight * scale);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = 'rgb(127, 127, 127)';
    ctx.textAlign = "right";
    ctx.font = `${SETTINGS.fontSize}px Arial`;
    ctx.fillText("https://odevsa.github.io/fov", canvas.width - 10, canvas.height - 10);
    ctx.restore();

}

function drawHorizontalFov(ratio, size, carPosition, carType, fov, distance, screenAmount, tripleScreenAngle, curvedScreenRadius) {
    const position = {
        x: carPosition.x + (carType.offset.horizontal.x * carType.scale),
        y: carPosition.topY - (carType.offset.horizontal.y * carType.scale)
    };
    const rotation = -Math.PI / 2;

    drawView(
        position,
        fov, 
        distance, 
        screenAmount, 
        tripleScreenAngle, 
        curvedScreenRadius,
        carType.scale,
        rotation
    );

    drawMeasurements(position, ratio, size, fov, distance, carType.scale, rotation);
    drawViewLabel('Horizontal FOV', { x: 10, y: 30 });
}

function drawVerticalFov(ratio, size, carPosition, carType, fov, distance) {
    const position = {
        x: carPosition.x + (carType.offset.vertical.x * carType.scale),
        y: carPosition.bottomY - (carType.offset.vertical.y * carType.scale)
    };
    const rotation = -Math.PI / 2;

    drawView(
        position,
        fov, 
        distance, 
        1,
        0,
        undefined,
        carType.scale,
        rotation
    );

    drawMeasurements(position, ratio, size, fov, distance, carType.scale, rotation);
    drawViewLabel('Vertical FOV', { x: 10, y: canvas.height /2 + 30 });
}

function drawView(center, fov, distance, screenAmount, tripleScreenAngle, curvedScreenRadius, scale, rotation) {
    const scaledDistance = distance * scale;
    const scaledRadius = curvedScreenRadius * scale;
    
    ctx.save();
    ctx.translate(center.x, center.y);
    if (rotation) ctx.rotate(rotation);
    
    drawFOV(fov, scaledDistance, screenAmount == 3);
    drawScreens(screenAmount, tripleScreenAngle, scaledDistance, scaledRadius, fov, scale);
    drawUserPosition();
    ctx.restore();
}

function drawViewLabel(label, position) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(position.x - 10, position.y - 30, 170, 45);
    ctx.fillRect(position.x - 10, position.y - 30, canvas.width, 2);
    
    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.font = `${SETTINGS.fontSize}px Arial`;
    ctx.fillText(label, position.x, position.y);
    ctx.restore();
}

function drawMeasurements(position, ratio, size, fov, distance, scale, rotation) {
    ctx.save();
    ctx.translate(position.x, position.y);
    if (rotation) ctx.rotate(rotation + Math.PI / 2);

    ctx.strokeStyle = SETTINGS.measurementColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-distance*scale, 0);
    ctx.stroke();
    ctx.setLineDash([]);


    ctx.font = `${SETTINGS.measurementFontSize}px Arial`;
    ctx.strokeStyle = SETTINGS.measurementStrokeColor;
    ctx.lineWidth = SETTINGS.measurementStrokeSize;
    ctx.lineJoin = "round";
    ctx.fillStyle = SETTINGS.measurementColor;
    
    const textDistanceWidth = 35;
    const fovText = `FOV: ${fov.toFixed(1)}°`;
    ctx.strokeText(fovText, 30, SETTINGS.measurementFontSize/3);
    ctx.fillText(fovText, 30, SETTINGS.measurementFontSize/3);

    ctx.textAlign = "center";
    const distanceValue = `${distance} cm`;
    ctx.strokeText(distanceValue, (- distance / 2) * scale, 15 * scale);
    ctx.fillText(distanceValue, (- distance / 2) * scale, 15 * scale);

    ctx.textAlign = "right";
    const screenLabel = `Screen`;
    ctx.strokeText(screenLabel, (- distance - 10)  * scale, -SETTINGS.measurementFontSize/3);
    ctx.fillText(screenLabel, (- distance - 10)  * scale, -SETTINGS.measurementFontSize/3);
    const sizeValue = `${size}" (${ratio.h}:${ratio.v})`;
    ctx.strokeText(sizeValue, (- distance - 10)  * scale, SETTINGS.measurementFontSize);
    ctx.fillText(sizeValue, (- distance - 10)  * scale, SETTINGS.measurementFontSize);

    ctx.restore();
}

function drawFOV(fov, distance, isTripleScree) {
    const fovPerScreen = isTripleScree ? fov / 3 : fov;
    const fovRadians = (fovPerScreen * Math.PI) / 180;
    const baseX = distance * Math.tan(fovRadians / 2);
    const drawX = baseX * SETTINGS.fovMultiplier;
    const drawDistance = distance * SETTINGS.fovMultiplier;

    ctx.fillStyle = SETTINGS.fovBackground;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-drawX, -drawDistance);
    ctx.lineTo(drawX, -drawDistance);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = SETTINGS.fovLines;
    ctx.lineWidth = SETTINGS.fovLinesThickness;
    ctx.setLineDash([5, 5]);
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-drawX, -drawDistance);
    ctx.moveTo(0, 0);
    ctx.lineTo(drawX, -drawDistance);
    ctx.stroke();
    
    if(isTripleScree){
        const fovRadians = (fov * Math.PI) / 180;
        const baseTripleX = drawDistance * Math.tan(fovRadians / 2);
        const direction = fov > 180 ? 1 : -1;

        ctx.strokeStyle = 'RGB(255, 255, 255)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-baseTripleX, direction * drawDistance);
        ctx.moveTo(0, 0);
        ctx.lineTo(baseTripleX, direction * drawDistance);
        ctx.stroke();
    }
    
    ctx.setLineDash([]);
}

function drawScreens(amount, sideAngle, distance, curvedScreenRadius, fov, scale) {
    ctx.strokeStyle = SETTINGS.screenColor;
    ctx.lineWidth = SETTINGS.screenThickness;
    
    if (amount === 3) {
        const radCenter = ((fov / 3) * Math.PI) / 180;
        const screenWidth = 2 * distance * Math.tan(radCenter / 2);
        const halfWidth = screenWidth / 2;
        const sideRad = (sideAngle * Math.PI) / 180;
        
        drawScreenSegment(0, -distance, screenWidth, curvedScreenRadius);
        
        ctx.save();
        ctx.translate(-halfWidth, -distance);
        ctx.rotate(-sideRad);
        drawScreenSegment(-halfWidth, 0, screenWidth, curvedScreenRadius);
        ctx.restore();
        
        ctx.save();
        ctx.translate(halfWidth, -distance);
        ctx.rotate(sideRad);
        drawScreenSegment(halfWidth, 0, screenWidth, curvedScreenRadius);
        ctx.restore();
    } else {
        const rad = (fov * Math.PI) / 180;
        const screenWidth = 2 * distance * Math.tan(rad / 2);
        drawScreenSegment(0, -distance, screenWidth, curvedScreenRadius);
        
        if(SETTINGS.debug)
            console.log('Screen Size', screenWidth / scale)
    }
}

function drawScreenSegment(xCenter, yCenter, width, r) {
    const halfWidth = width / 2;
    ctx.beginPath();

    if (r && r > halfWidth) {
        const theta = Math.asin(halfWidth / r);
        const startAngle = -Math.PI / 2 - theta;
        const endAngle = -Math.PI / 2 + theta;
        ctx.arc(xCenter, yCenter + r, r, startAngle, endAngle);
    } else {
        ctx.moveTo(xCenter - halfWidth, yCenter);
        ctx.lineTo(xCenter + halfWidth, yCenter);
    }
    ctx.stroke();
}

function drawUserPosition() {
    ctx.fillStyle = SETTINGS.userColor;
    ctx.beginPath();
    ctx.arc(0, 0, SETTINGS.userRadius, 0, Math.PI * 2);
    ctx.fill();
}

function drawCarBox(carPosition) {
    ctx.fillStyle = SETTINGS.debugColor;
    ctx.fillRect(carPosition.x, carPosition.topY - carPosition.width, carPosition.length, carPosition.width);
    ctx.fillRect(carPosition.x, carPosition.bottomY - carPosition.height, carPosition.length, carPosition.height);
}

function getCarPosition(carType) {
    const width = carType.car.width * carType.scale;
    const height = carType.car.height * carType.scale;
    const length = carType.car.length * carType.scale;
    return {
        x: (canvas.width - length) / 2,
        topY: (canvas.height * 0.25) + (width / 2),
        bottomY: canvas.height * 0.75 + (height / 2),
        width,
        height,
        length,
    }
}