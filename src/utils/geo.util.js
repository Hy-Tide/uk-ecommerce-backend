/**
 * Helper to generate a Polygon approximation of a circle
 * @param {Number} centerLng 
 * @param {Number} centerLat 
 * @param {Number} radiusInMeters 
 * @param {Number} numPoints Number of points to generate (more points = smoother circle)
 * @returns {Array} Coordinates array for GeoJSON Polygon (array of rings)
 */
exports.getCirclePolygon = (centerLng, centerLat, radiusInMeters, numPoints = 64) => {
    const coordinates = [];
    const earthRadius = 6378137; // Earth's equatorial radius in meters

    for (let i = 0; i < numPoints; i++) {
        const bearing = (i * 360) / numPoints;
        const bearingRad = (bearing * Math.PI) / 180;
        const latRad = (centerLat * Math.PI) / 180;
        const lngRad = (centerLng * Math.PI) / 180;

        const newLatRad = Math.asin(
            Math.sin(latRad) * Math.cos(radiusInMeters / earthRadius) +
            Math.cos(latRad) * Math.sin(radiusInMeters / earthRadius) * Math.cos(bearingRad)
        );

        const newLngRad = lngRad + Math.atan2(
            Math.sin(bearingRad) * Math.sin(radiusInMeters / earthRadius) * Math.cos(latRad),
            Math.cos(radiusInMeters / earthRadius) - Math.sin(latRad) * Math.sin(newLatRad)
        );

        const newLat = (newLatRad * 180) / Math.PI;
        const newLng = (newLngRad * 180) / Math.PI;

        coordinates.push([newLng, newLat]);
    }
    
    // Close the polygon ring
    coordinates.push(coordinates[0]);

    return [coordinates]; // Return as array of rings
};
