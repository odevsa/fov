(function() {
	var FOVCalculator, FOV;

	FOVCalculator = (function() {
		function FOVCalculator() {
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
			const bezelCalculated = bezel * 2;
			const aspectRatioToSize = Math.sqrt((screensizeDiagonal * screensizeDiagonal) / ((ratio.h * ratio.h) + (ratio.v * ratio.v)));
			const actualWidth = (ratio.h * aspectRatioToSize);
			const actualHeight = (ratio.v * aspectRatioToSize);
			const horizontalActualAngle = this._getAngularSize(actualWidth, distance);
			const width = ratio.h * aspectRatioToSize;
			const widthTripleScreen = (ratio.h * aspectRatioToSize) + bezelCalculated;
			const halfPi = Math.PI / 2;
			const calculatedHorizontalAngle = !!screenRadius
				? this._getArcAngularSize(width, screenRadius, distance)
				: this._getAngularSize(width, distance);
			const calculatedTripleHorizontalAngle = !!screenRadius
				? this._getArcAngularSize(widthTripleScreen, screenRadius, distance)
				: this._getAngularSize(widthTripleScreen, distance);
			const horizontalAngle = Math.min(calculatedHorizontalAngle, halfPi);
			const verticalAngle = 2 * Math.atan2(Math.tan(horizontalActualAngle / 2) * ratio.v, ratio.h);

			return {
				ratio,
				size,
				distance,
				screens,
				screenRadius,
				bezel,
				width: actualWidth,
				height: actualHeight,
				horizontal: Math.min(parseFloat((this.ARC_CONSTANT * calculatedHorizontalAngle).toFixed(2)), 180),
				tripleScreenFov: Math.min(parseFloat((this.ARC_CONSTANT * (calculatedTripleHorizontalAngle + (horizontalAngle * 2))).toFixed(2)), 360),
				vertical: Math.min(parseFloat((this.ARC_CONSTANT * verticalAngle).toFixed(2)), 180),
				angle: Math.min(parseFloat((this.ARC_CONSTANT * horizontalAngle).toFixed(2)), 90)
			};
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
     * @param {number} ratio - Horizontal aspect ratio (e.g., { h: 16, v: 9 })
     */
    FOVCalculator.prototype.calculateRBR = function(width, distance, ratio) {
			return this._getAngularSize(width / ratio.h * ratio.v / 3 * 4, distance);
		}

		/**
		 * Calculates viewing angle for flat monitors using right triangle geometry.
		 * @private
		 * @param {number} width - Screen width in centimeters
		 * @param {number} distance - Distance from observer to screen in centimeters
		 * @returns {number} Viewing angle in radians
		 */
		FOVCalculator.prototype._getAngularSize = function(width, distance) {
			return Math.atan2(width / 2, distance) * 2;
		};

		/**
		 * Calculates viewing angle for curved monitors accounting for arc geometry.
		 * @private
		 * @param {number} width - Screen width in centimeters (arc length)
		 * @param {number} radius - Curve radius in centimeters (smaller = more curved)
		 * @param {number} distance - Distance from observer to screen in centimeters
		 * @returns {number} Viewing angle in radians
		 */
		FOVCalculator.prototype._getArcAngularSize = function(width, radius, distance) {
			const centralAngle = width / radius;
			const sagitta = radius * (1 - Math.cos(centralAngle / 2));
			const halfChord = Math.sqrt((2 * radius * sagitta) - (sagitta * sagitta));
			return 2 * Math.atan2(halfChord, distance - sagitta);
		};

		return FOVCalculator;

	})();

	FOV = new FOVCalculator();

	(typeof module !== "undefined" && module !== null ? module.exports = FOV : void 0) || (this.FOV = FOV);

}).call(this);