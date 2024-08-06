import axios from "axios";

// Clave de la API de Google Maps
const GOOGLE_MAPS_API_KEY = "---";

/**
 * DistanceService is an object that provides methods to calculate distances and durations between locations using the Google Maps Distance Matrix API.
 * @namespace DistanceService
 * @description Objeto que proporciona métodos para calcular distancias y duraciones entre ubicaciones utilizando la API de Google Maps Distance Matrix.
 */
export const DistanceService = {
  /**
   * Obtiene la distancia y duración entre dos ubicaciones utilizando la API de Google Maps Distance Matrix.
   * @async
   * @param {Object} origin - La ubicación de inicio.
   * @param {number} origin.lat - Latitud del origen.
   * @param {number} origin.lng - Longitud del origen.
   * @param {Object} destination - La ubicación de destino.
   * @param {number} destination.lat - Latitud del destino.
   * @param {number} destination.lng - Longitud del destino.
   * @param {string} method - El método de transporte preferido (por ejemplo, 'driving', 'walking', 'bicycling', 'transit', 'shuffle').
   * @param {string} mode - El modo de optimización ('time' o 'distance').
   * @returns {Promise<{distanceValue: number, durationValue: number, transportMethod: string} | null>} - La mejor distancia, duración y método de transporte o null si no se encuentra un resultado válido.
   */
  async getDistance(origin, destination, method, mode) {
    console.log("Origin:", origin);
    console.log("Destination:", destination);
    console.log("Method:", method);
    console.log("Mode:", mode);

    // Determine transport methods based on 'method' parameter or default to 'driving'
    const transportMethods = method === "shuffle"
      ? ["driving", "walking", "bicycling", "transit"]
      : [method.toLowerCase()];

    console.log("Transport methods:", transportMethods);

    // Initialize variables to track the best route
    let bestDistance = Infinity;
    let bestDuration = Infinity;
    let bestMethod = null;

    // Iterate through each transport method to find the optimal route
    for (let currentMethod of transportMethods) {
      try {
        console.log(`Fetching route for method: ${currentMethod}`);

        // Get distance and duration using the Distance Matrix API
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&mode=${currentMethod}&key=${GOOGLE_MAPS_API_KEY}`
        );

        console.log(`Response for method ${currentMethod}:`, response.data);

        if (response.data && response.data.rows && response.data.rows.length > 0) {
          const element = response.data.rows[0].elements[0];

          if (element.status === "OK") {
            const distance = element.distance.value; // distance in meters
            const duration = element.duration.value; // duration in seconds

            console.log(`Distance for method ${currentMethod}: ${distance}`);
            console.log(`Duration for method ${currentMethod}: ${duration}`);

            // Update best route based on optimization mode
            if (mode === "time" && duration < bestDuration) {
              console.log(`Updating best method to ${currentMethod} based on time`);
              bestDistance = distance;
              bestDuration = duration;
              bestMethod = currentMethod;
            } else if (mode !== "time" && distance < bestDistance) {
              console.log(`Updating best method to ${currentMethod} based on distance`);
              bestDistance = distance;
              bestDuration = duration;
              bestMethod = currentMethod;
            }
          } else {
            console.log(`No valid data for method ${currentMethod}`);
          }
        }
      } catch (error) {
        console.error(`Error fetching distance with method ${currentMethod}:`, error);
      }
    }

    // Return the best route information or null if no valid route found
    if (bestMethod) {
      console.log("Best method found:", bestMethod);
      return {
        distanceValue: bestDistance,
        durationValue: bestDuration,
        transportMethod: bestMethod,
      };
    } else {
      console.log("No valid method found");
      return null;
    }
  },
};
