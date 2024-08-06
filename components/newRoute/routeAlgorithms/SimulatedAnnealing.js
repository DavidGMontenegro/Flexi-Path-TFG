import { DistanceService } from "../DistanceService";

const SimulatedAnnealing = {
  distanceCache: {}, // Cache for calculated distances

  /**
   * Optimizes the given route using the Simulated Annealing algorithm
   * @param {Object[]} route - The array of destinations to visit.
   * @param {Object} route[].coords - Coordinates of the destination.
   * @param {number} route[].coords.lat - Latitude of the destination.
   * @param {number} route[].coords.lng - Longitude of the destination.
   * @param {string} mode - The optimization mode ('time' or 'distance').
   * @param {string} transportMethod - The preferred transport method ('driving', 'walking', 'bicycling', 'transit', 'shuffle').
   * @returns {Promise<{ optimizedRoute: Object[], totalDistance: number, totalTime: number, optimizedRouteMethod: string[] }>} - The optimized route, total distance, total time, and methods used.
   */
  async simulatedAnnealingSolution(route, mode, transportMethod) {
    if (!route || route.length === 0) {
      throw new Error("Route is undefined or empty");
    }

    let currentSolution = route.slice();
    let bestSolution = route.slice();
    let currentDistance = await this.calculateTotalDistance(currentSolution, mode, transportMethod);
    let bestDistance = currentDistance;
    let bestTime = await this.calculateTotalTime(bestSolution, transportMethod);
    let optimizedRoute = currentSolution.map(city => city.name); // Array to store the names of the destinations
    let optimizedRouteMethods = currentSolution.map(() => null); // Array initialized with null

    // Initialize optimizedRouteMethods with the optimal transport methods for the first segment
    optimizedRouteMethods[0] = "";
    for (let i = 0; i < currentSolution.length - 1; i++) {
      const startCoords = currentSolution[i].coords;
      const endCoords = currentSolution[i + 1].coords;
      const distanceData = await this.getOptimalDistance(startCoords, endCoords, transportMethod, mode);
      if (distanceData && distanceData.transportMethod) {
        optimizedRouteMethods[i + 1] = distanceData.transportMethod;
      } else {
        console.error(`No optimal transport method found for ${currentSolution[i].name} to ${currentSolution[i + 1].name}`);
      }
    }

    let temperature = 10000;
    const coolingRate = 0.003;

    while (temperature > 1) {
      let newSolution = currentSolution.slice();
      const swapIndex1 = Math.floor(Math.random() * newSolution.length);
      const swapIndex2 = (swapIndex1 + Math.floor(Math.random() * (newSolution.length - 1)) + 1) % newSolution.length;

      [newSolution[swapIndex1], newSolution[swapIndex2]] = [newSolution[swapIndex2], newSolution[swapIndex1]];

      const newDistance = await this.calculateTotalDistance(newSolution, mode, transportMethod);

      if (this.acceptanceProbability(currentDistance, newDistance, temperature) > Math.random()) {
        currentSolution = newSolution;
        currentDistance = newDistance;
      }

      if (currentDistance < bestDistance) {
        bestSolution = currentSolution.slice();
        bestDistance = currentDistance;
        optimizedRoute = bestSolution.map(city => city.name);

        // Update optimizedRouteMethods with the optimal transport methods for the best solution
        optimizedRouteMethods = [""];
        bestTime = 0; // Reset bestTime
        for (let i = 0; i < bestSolution.length - 1; i++) {
          const startCoords = bestSolution[i].coords;
          const endCoords = bestSolution[i + 1].coords;
          const distanceData = await this.getOptimalDistance(startCoords, endCoords, transportMethod, mode);
          if (distanceData && distanceData.transportMethod) {
            optimizedRouteMethods.push(distanceData.transportMethod);
            bestTime += distanceData.durationValue;
          } else {
            optimizedRouteMethods.push(null); // Handle case with no data
          }
        }
      }

      temperature *= 1 - coolingRate;
    }

    const totalTime = bestTime;

    // Print route data and transport methods
    console.log("Optimized Route:");
    for (let i = 0; i < optimizedRoute.length; i++) {
      console.log(`${optimizedRoute[i]} - ${optimizedRouteMethods[i] || 'Unknown'}`);
    }
    console.log("Total Distance:", bestDistance);
    console.log("Total Time:", totalTime);

    return {
      optimizedRoute: bestSolution,
      totalDistance: bestDistance,
      totalTime: totalTime,
      optimizedRouteMethod: optimizedRouteMethods
    };
  },

  /**
   * Calculates the total distance of the given route.
   * @param {Object[]} route - The array of destinations to visit.
   * @param {string} mode - The optimization mode ('time' or 'distance').
   * @param {string[]} transportMethod - The preferred transport method for each segment of the route.
   * @returns {Promise<number>} - The total calculated distance.
   */
  async calculateTotalDistance(route, mode, transportMethod) {
    let totalDistance = 0;
    for (let i = 0; i < route.length - 1; i++) {
      const startCoords = route[i].coords;
      const endCoords = route[i + 1].coords;

      if (!startCoords || !endCoords) {
        console.error(`Invalid coordinates for cities: ${route[i].name} or ${route[i + 1].name}`);
        totalDistance += Infinity;
        continue;
      }

      // Get the distance for each pair of cities using the optimal transport method
      const distanceData = await this.getOptimalDistance(startCoords, endCoords, transportMethod, mode);
      if (distanceData) {
        totalDistance += distanceData.distanceValue;
      } else {
        console.error(`Failed to get distance data between ${route[i].name} and ${route[i + 1].name}`);
        totalDistance += Infinity;
      }
    }
    console.log("Total distance calculated:", totalDistance);
    return totalDistance;
  },

  /**
   * Gets the optimal distance data between two points using the DistanceService.
   * @param {Object} startCoords - Coordinates of the starting point.
   * @param {Object} endCoords - Coordinates of the destination.
   * @param {string} transportMethod - The preferred transport method for the segment.
   * @param {string} mode - The optimization mode ('time' or 'distance').
   * @returns {Promise<Object|null>} - The optimal distance data (distance value, duration value, transport method) or null if it fails.
   */
  async getOptimalDistance(startCoords, endCoords, transportMethod, mode) {
    const key = `${startCoords.lat},${startCoords.lng}-${endCoords.lat},${endCoords.lng}`;

    if (this.distanceCache[key] && this.distanceCache[key][transportMethod]) {
      return this.distanceCache[key][transportMethod];
    }

    try {
      const distanceData = await DistanceService.getDistance(startCoords, endCoords, transportMethod, mode);

      if (distanceData) {
        if (!this.distanceCache[key]) {
          this.distanceCache[key] = {};
        }
        this.distanceCache[key][transportMethod] = {
          distanceValue: distanceData.distanceValue,
          durationValue: distanceData.durationValue,
          transportMethod: distanceData.transportMethod
        };
        return this.distanceCache[key][transportMethod];
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Error fetching distance data: ${error.message}`);
      return null;
    }
  },

  /**
   * Calculates the total time of the given route.
   * @param {Object[]} route - The array of destinations to visit.
   * @param {string[]} transportMethods - The preferred transport methods for each segment of the route.
   * @returns {Promise<number>} - The total calculated time.
   */
  async calculateTotalTime(route, transportMethods) {
    console.log("Calculating total time for route");
    let totalTime = 0;

    for (let i = 0; i < route.length - 1; i++) {
      const startCoords = route[i].coords;
      const endCoords = route[i + 1].coords;

      // Calculate the time using the optimal transport method
      const key = `${startCoords.lat},${startCoords.lng}-${endCoords.lat},${endCoords.lng}`;
      const transportMethod = transportMethods[i + 1];
      if (this.distanceCache[key] && this.distanceCache[key][transportMethod]) {
        const durationValue = this.distanceCache[key][transportMethod].durationValue;
        if (durationValue !== undefined && durationValue !== null) {
          totalTime += durationValue;
        } else {
          console.error(`No duration value found in cache for ${route[i].name} to ${route[i + 1].name}`);
          totalTime += Infinity;
        }
      } else {
        totalTime += Infinity;
      }
    }

    console.log("Total time calculated:", totalTime);
    return totalTime;
  },

  /**
   * Calculates the acceptance probability for Simulated Annealing.
   * @param {number} currentDistance - The current distance of the solution.
   * @param {number} newDistance - The distance of the proposed new solution.
   * @param {number} temperature - The current temperature of the system.
   * @returns {number} - The acceptance probability.
   */
  acceptanceProbability(currentDistance, newDistance, temperature) {
    if (newDistance < currentDistance) {
      return 1.0;
    }
    const probability = Math.exp((currentDistance - newDistance) / temperature);
    console.log("Acceptance probability:", probability);
    return probability;
  }
};

export default SimulatedAnnealing;
