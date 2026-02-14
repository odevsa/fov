(function() {
	var FOVCalculator, FOV;
	
	FOVCalculator = (function() {
		function FOVCalculator() {
			this.HALF_PI = Math.PI / 2;
			this.DOUBLE_PI = Math.PI * 2;
			this.INCHES_TO_CM = 2.54;
			this.ARC_CONSTANT = 180 / Math.PI;
		}

		/**
		 * Calculates horizontal, vertical and triple screen viewing angles.
		 * @param {Object} options - Configuration parameters
		 * @param {Object} options.ratio - Screen aspect ratio (required)
		 * @param {number} options.ratio.h - Horizontal ratio (e.g., 16)
		 * @param {number} options.ratio.v - Vertical ratio (e.g., 9)
		 * @param {number} options.size - Diagonal screen size in inches (required)
		 * @param {number} options.distance - Distance to screen in centimeters (required)
		 * @param {number} [options.screens=1] - Number of screens
		 * @param {number} options.screenRadius - Curve radius in centimeters
		 * @param {number} options.bezel - Bezel thickness in millimeters (required)
		 * @returns {Object} Object with calculated FOV values
		 */
		FOVCalculator.prototype.calculate = function({
			ratio,
			size,
			distance,
			screens = 1,
			screenRadius,
			bezel,
		}) {
			const screensizeDiagonal = size * this.INCHES_TO_CM;
			const aspectRatioToSize = Math.sqrt((screensizeDiagonal * screensizeDiagonal) / ((ratio.h * ratio.h) + (ratio.v * ratio.v)));
			const isTripleScreen = screens == 3;
			
			const actualWidth = (ratio.h * aspectRatioToSize);
			const actualHeight = (ratio.v * aspectRatioToSize);
			const calculatedWidth = (ratio.h * aspectRatioToSize) + (isTripleScreen ? bezel : 0);
		
			const calculatedHorizontalAngle = this.getAngularSize(calculatedWidth, distance, screenRadius);
			const horizontalAngle = Math.min(calculatedHorizontalAngle, this.HALF_PI);

			const horizontalActualAngle = this.getAngularSize(actualWidth, distance);
			const verticalAngle = 2 * Math.atan2(Math.tan(horizontalActualAngle / 2) * ratio.v, ratio.h);
			
			let calculatedTripleHorizontalAngle;
			if (calculatedHorizontalAngle > this.HALF_PI) {
				const sagitta = screenRadius ? screenRadius * (1 - Math.cos((actualWidth / screenRadius) / 2)) : 0;
				const invertedDistance = actualWidth - distance + sagitta;
				calculatedTripleHorizontalAngle = this.DOUBLE_PI - this.getAngularSize(calculatedWidth - ((isTripleScreen ? bezel : 0)), invertedDistance);
			} else {
				const halfFOV = calculatedHorizontalAngle / 2;
				calculatedTripleHorizontalAngle = isTripleScreen 
					? 2 * (horizontalAngle + halfFOV)
					: calculatedHorizontalAngle * 3;
			}

			return {
				ratio,
				size,
				distance,
				screens,
				screenRadius,
				bezel,
				width: actualWidth,
				height: actualHeight,
				horizontal: Math.min(this.radianToDegree(calculatedHorizontalAngle), 180),
				tripleScreen: isTripleScreen ? Math.min(this.radianToDegree(calculatedTripleHorizontalAngle), 360) : undefined,
				vertical: Math.min(this.radianToDegree(verticalAngle), 180),
				angle: isTripleScreen ? Math.min(this.radianToDegree(horizontalAngle), 90) : undefined
			};
		};

		/**
		 * Calculates viewing angle for flat or curved monitors accounting for arc geometry.
		 * @param {number} width - Screen width in centimeters (arc length)
		 * @param {number} [radius] - Curve radius in centimeters (smaller = more curved)
		 * @param {number} distance - Distance from observer to screen in centimeters
		 * @returns {number} Viewing angle in radians
		 */
		FOVCalculator.prototype.getAngularSize = function(width, distance, radius = undefined) {
			if(!radius) return Math.atan2(width / 2, distance) * 2;

			const centralAngle = width / radius;
			const sagitta = radius * (1 - Math.cos(centralAngle / 2));
			const halfChord = Math.sqrt((2 * radius * sagitta) - (sagitta * sagitta));
			return 2 * Math.atan2(halfChord, distance - sagitta);
		};

		/**
		 * Convert radians to degrees.
		 * @param {number} radian - Value in radians
		 * @returns {number} Angle in degrees
		 */
		FOVCalculator.prototype.radianToDegree = function(radian) {
			return parseFloat((radian * this.ARC_CONSTANT).toFixed(2));
		};

		/**
     * Calculates FOV based on a linear multiplier.
     * Common for Live for Speed or GRID Autosport (vFOV * 2).
     * @param {number} fov - Base FOV in degrees
     * @param {number} factor - Multiplication/Scale factor
     */
		FOVCalculator.prototype.calculateMultiplier = function(fov, factor) {
			return (fov * factor);
		} 

		/**
     * Calculates FOV using a divisor.
     * Common for GTR2 or RaceRoom (vFOV / 58)
     * @param {number} fov - Base FOV in degrees
     * @param {number} factor - Division factor
     */
		FOVCalculator.prototype.calculateDivider = function(fov, factor) {
			return (fov / factor);
		}

		/**
     * Converts vFOV to the slider value for Codemasters/EA F1 games.
     * Scale logic based on a neutral offset (approx. 77 degrees).
     * @param {number} fov - FOV in degrees
     * @param {number} factor - Scaling factor
     */
		FOVCalculator.prototype.calculateF1 = function(fov, factor) {
			return ((fov - 77) / 2 * factor);
		} 

		/**
     * Calculates vFOV in radians specifically for Richard Burns Rally (RBR).
     * RBR uses a specific vertical FOV calculation in radians.
     * @param {number} width - Screen width in centimeters
     * @param {number} distance - Distance to screen in centimeters
     * @param {Object} ratio - Horizontal aspect ratio (e.g., { h: 16, v: 9 })
     */
    FOVCalculator.prototype.calculateRBR = function(width, distance, ratio) {
			return this.getAngularSize(width / ratio.h * ratio.v / 3 * 4, distance);
		}

		return FOVCalculator;

	})();

	FOV = new FOVCalculator();

	(typeof module !== "undefined" && module !== null ? module.exports = FOV : void 0) || (this.FOV = FOV);

}).call(this);