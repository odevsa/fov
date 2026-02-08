const canvas = document.getElementById('draw');
const ctx = canvas.getContext('2d');

const SETTINGS = {
    debug: false,
    debugColor: 'rgba(255, 0, 0, 0.15)',
    userColor: 'rgb(255, 255, 0)',
    userRadius: 20,
    screenThickness: 10,
    screenColor: 'rgb(255, 255, 0)',
    fovBackground: 'rgba(0, 255, 0, 0.15)',
    fovMultiplier: 10,
    fovLines: 'rgb(0, 255, 0)',
    fovLinesThickness: 3,
    fontSize: 22,
    carOpacity: 1,
};

function updateDraw(params) {
    const { horizontal, vertical, tripleScreenAngle, screenAmount, screenCurveRadius, distance, carType } = params;    
    const car = carPosition(carType);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if(carType) drawCar(carType.image);

    drawView(
        'Horizontal FOV',
        { x: 10, y: 30 }, 
        {
            x: car.x + (carType.offset.horizontal.x * carType.scale),
            y: car.topY - (carType.offset.horizontal.y * carType.scale)
        },
        horizontal, 
        distance, 
        screenAmount, 
        tripleScreenAngle, 
        screenCurveRadius,
        carType.scale,
        -Math.PI / 2
    );
    
    drawView(
        'Vertical FOV', 
        { x: 10, y: canvas.height /2 + 30 }, 
        {
            x: car.x + (carType.offset.vertical.x * carType.scale),
            y: car.bottomY - (carType.offset.vertical.y * carType.scale)
        },
        vertical, 
        distance, 
        1,
        0,
        undefined,
        carType.scale,
        -Math.PI / 2
    );

    if(SETTINGS.debug) {
        console.log(carType);
        drawCarBox(car);
    }
}

function drawView(label, labelPos, centerPos, fov, distance, screenAmount, tripleScreenAngle, screenCurveRadius, scale, rotation) {
    const scaledDistance = distance * scale;
    const scaledRadius = screenCurveRadius * scale;
    
    ctx.save();
    ctx.translate(centerPos.x, centerPos.y);
    if (rotation) ctx.rotate(rotation);
    
    drawFOV(fov, scaledDistance);
    drawScreens(screenAmount, tripleScreenAngle, scaledDistance, scaledRadius, fov, scale);
    drawUserPosition();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(labelPos.x - 10, labelPos.y - 30, 170, 45);
    ctx.fillRect(labelPos.x - 10, labelPos.y - 30, canvas.width, 2);

    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.font = `${SETTINGS.fontSize}px Arial`;
    ctx.fillText(label, labelPos.x, labelPos.y);
    ctx.restore();
}


function drawCar(imageUrl) {
    const carImage = new Image();
    carImage.src = imageUrl;

    carImage.onload = () => {
        const imageWidth = carImage.naturalWidth;
        const imageHeight = carImage.naturalHeight;
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        const scale = Math.min(canvasWidth / imageWidth, canvasHeight / imageHeight);
        
        const x = (canvasWidth - imageWidth * scale) / 2;
        const y = (canvasHeight - imageHeight * scale) / 2;

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0); 
        ctx.globalAlpha = SETTINGS.carOpacity;
        ctx.globalCompositeOperation = 'destination-over';
        ctx.drawImage(carImage, x, y, imageWidth * scale, imageHeight * scale);
        ctx.restore();        
    };
}

function drawFOV(fov, distance) {
    const fovRadians = (fov * Math.PI) / 180;
    const halfFovRadians = fovRadians / 2;
    const baseX = distance * Math.tan(halfFovRadians);
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
    
    ctx.setLineDash([]);
}

function drawScreens(amount, sideAngle, distance, screenCurveRadius, fov, scale) {
    ctx.strokeStyle = SETTINGS.screenColor;
    ctx.lineWidth = SETTINGS.screenThickness;
    
    if (amount === 3) {
        const radCenter = ((fov / 3) * Math.PI) / 180;
        const screenWidth = 2 * distance * Math.tan(radCenter / 2);
        const halfWidth = screenWidth / 2;
        const sideRad = (sideAngle * Math.PI) / 180;
        
        drawScreenSegment(0, -distance, screenWidth, screenCurveRadius);
        
        ctx.save();
        ctx.translate(-halfWidth, -distance);
        ctx.rotate(-sideRad);
        drawScreenSegment(-halfWidth, 0, screenWidth, screenCurveRadius);
        ctx.restore();
        
        ctx.save();
        ctx.translate(halfWidth, -distance);
        ctx.rotate(sideRad);
        drawScreenSegment(halfWidth, 0, screenWidth, screenCurveRadius);
        ctx.restore();
    } else {
        const rad = (fov * Math.PI) / 180;
        const screenWidth = 2 * distance * Math.tan(rad / 2);
        drawScreenSegment(0, -distance, screenWidth, screenCurveRadius);
        
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

function carPosition(carType) {
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