import { DistanceService } from '../DistanceService'; // Importa el servicio DistanceService para calcular distancias

/**
 * NearestNeighbour es un objeto que proporciona una solución para optimizar una ruta utilizando el algoritmo del Vecino Más Cercano.
 * @namespace
 */
const NearestNeighbour = {
  /**
   * Optimiza la ruta dada utilizando el algoritmo del Vecino Más Cercano.
   * @param {Object[]} route - El array de destinos a visitar.
   * @param {Object} route[].coords - Coordenadas del destino.
   * @param {number} route[].coords.lat - Latitud del destino.
   * @param {number} route[].coords.lng - Longitud del destino.
   * @param {string} mode - El modo de optimización ('time' o 'distance').
   * @param {string} transportMethod - El método de transporte preferido ('driving', 'walking', 'bicycling', 'transit', 'shuffle').
   * @returns {Promise<{optimizedRoute: Object[], totalDistance: number, totalTime: number, optimizedRouteMethod: string[]}>} - La ruta optimizada, distancia total, tiempo total y métodos utilizados.
   */
  async nearestNeighbourSolution(route, mode, transportMethod) {
    let currentCityIndex = 0; // Índice de la ciudad actual
    const visitedCities = new Set(); // Conjunto para almacenar ciudades visitadas
    visitedCities.add(currentCityIndex); // Añade la ciudad actual al conjunto de ciudades visitadas

    let totalDistance = 0; // Distancia total inicializada en 0
    let totalTime = 0; // Tiempo total inicializado en 0
    const optimizedRoute = [route[currentCityIndex]]; // Array para almacenar la ruta optimizada, comienza con la ciudad actual
    const optimizedRouteMethod = ["none"]; // Array para almacenar los métodos de transporte utilizados, comienza con "none" para la ciudad actual

    // Mientras no se hayan visitado todas las ciudades
    while (visitedCities.size < route.length) {
      let minDistance = Infinity; // Inicializa la distancia mínima como infinito
      let nearestCityIndex = -1; // Índice de la ciudad más cercana, inicializado como -1
      let minDuration = Infinity; // Duración mínima inicializada como infinito
      let bestMethod = null; // Mejor método de transporte inicializado como nulo

      // Itera sobre todas las ciudades en la ruta
      for (let i = 0; i < route.length; i++) {
        // Verifica si la ciudad no es la actual y no ha sido visitada
        if (i !== currentCityIndex && !visitedCities.has(i)) {
          // Obtiene los datos de distancia y duración utilizando el servicio DistanceService
          const distanceData = await DistanceService.getDistance(route[currentCityIndex].coords, route[i].coords, transportMethod, mode);
          if (distanceData) {
            // Compara y actualiza la distancia y duración mínima según el modo (distancia o tiempo)
            if (mode === 'distance' && distanceData.distanceValue < minDistance) {
              minDistance = distanceData.distanceValue;
              minDuration = distanceData.durationValue;
              nearestCityIndex = i;
              bestMethod = distanceData.transportMethod;
            } else if (mode === 'time' && distanceData.durationValue < minDuration) {
              minDistance = distanceData.distanceValue;
              minDuration = distanceData.durationValue;
              nearestCityIndex = i;
              bestMethod = distanceData.transportMethod;
            }
          }
        }
      }

      // Si se encontró una ciudad más cercana válida
      if (nearestCityIndex !== -1) {
        visitedCities.add(nearestCityIndex); // Añade la ciudad más cercana al conjunto de ciudades visitadas
        optimizedRoute.push(route[nearestCityIndex]); // Añade la ciudad más cercana a la ruta optimizada
        optimizedRouteMethod.push(bestMethod); // Añade el método de transporte óptimo utilizado
        totalDistance += minDistance; // Suma la distancia mínima a la distancia total
        totalTime += minDuration; // Suma la duración mínima al tiempo total
        currentCityIndex = nearestCityIndex; // Actualiza el índice de la ciudad actual
      }
    }

    // Retorna la ruta optimizada, distancia total, tiempo total y métodos de transporte utilizados
    return { optimizedRoute, totalDistance, totalTime, optimizedRouteMethod };
  },
};

export default NearestNeighbour; // Exporta el objeto NearestNeighbour
