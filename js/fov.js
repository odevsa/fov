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
		 * @param {boolean} [options.curved=false] - Is monitor curved
		 * @param {number} options.radius - Curve radius in centimeters (required if curved=true)
		 * @param {number} options.bezel - Bezel thickness in millimeters (required)
		 * @returns {Object} Object with calculated FOV values
		 * @returns {number} returns.horizontalFov - Horizontal FOV in degrees
		 * @returns {number} returns.verticalFov - Vertical FOV in degrees
		 * @returns {number} returns.tripleScreenAngle - Single screen angle in degrees
		 */
		FOVCalculator.prototype.calculate = function({
			ratio,
			size,
			distance,
			screens = 1,
			curved = false,
			radius,
			bezel,
		}) {
			const screensizeDiagonal = size * this.INCHES_TO_CM;
			const bezelCalculated = bezel * 2;
			const aspectRatioToSize = Math.sqrt((screensizeDiagonal * screensizeDiagonal) / ((ratio.h * ratio.h) + (ratio.v * ratio.v)));
			const width = (ratio.h * aspectRatioToSize) + (screens > 1 ? bezelCalculated : 0);
			const hActualAngle = this._calcTriangularAngle(width, distance);
			const hAngle = curved
				? this._calcCurvedAngle(width, radius, distance)
				: this._calcTriangularAngle(width, distance);
			const vAngle = 2 * Math.atan2(Math.tan(hActualAngle / 2) * ratio.v, ratio.h);
			
			return {
				horizontal: parseFloat((this.ARC_CONSTANT * (hAngle * screens)).toFixed(2)),
				vertical: parseFloat((this.ARC_CONSTANT * vAngle).toFixed(2)),
				angle: parseFloat((this.ARC_CONSTANT * hAngle).toFixed(2))
			};
		};

		/**
		 * Calculates viewing angle for flat monitors using right triangle geometry.
		 * @private
		 * @param {number} base - Screen width in centimeters
		 * @param {number} distance - Distance from observer to screen in centimeters
		 * @returns {number} Viewing angle in radians
		 */
		FOVCalculator.prototype._calcTriangularAngle = function(base, distance) {
			return Math.atan2(base / 2, distance) * 2;
		};

		/**
		 * Calculates viewing angle for curved monitors accounting for arc geometry.
		 * @private
		 * @param {number} base - Screen width in centimeters (arc length)
		 * @param {number} radius - Curve radius in centimeters (smaller = more curved)
		 * @param {number} distance - Distance from observer to screen in centimeters
		 * @returns {number} Viewing angle in radians
		 */
		FOVCalculator.prototype._calcCurvedAngle = function(base, radius, distance) {
			const arcAngleAtRadius = base / radius;
			const b = radius * (1 - Math.cos(arcAngleAtRadius / 2));
			const c = Math.sqrt((2 * radius * b) - (b * b));
			return 2 * Math.atan2(c, distance - b);
		};

		return FOVCalculator;

	})();

	FOV = new FOVCalculator();

	(typeof module !== "undefined" && module !== null ? module.exports = FOV : void 0) || (this.FOV = FOV);

}).call(this);