import axios from 'axios';
import NearestNeighbour from './routeAlgorithms/NearestNeighbour';
import SimulatedAnnealing from './routeAlgorithms/SimulatedAnnealing';

const GOOGLE_MAPS_API_KEY = '---';

/**
 * @typedef {Object} Destination
 * @property {number} lat - Latitude of the destination.
 * @property {number} lng - Longitude of the destination.
 * @property {string} name - Name of the destination.
 */

/**
 * RouteManager is an object that manages the route, optimizes it, and calculates distances.
 * @namespace RouteManager
 */
const RouteManager = {
  /**
   * @type {Destination[]}
   * @description List of destinations in the route.
   */
  route: [],

  /**
   * @type {Destination[]}
   * @description List of optimized destinations in the route.
   */
  optimizedRoute: [],

  /**
   * @type {string[]}
   * @description List of methods used for optimizing the route.
   */
  optimizedRouteMethod: [],

  /**
   * @type {number}
   * @description Total distance of the route in meters.
   */
  totalDistance: 0,

  /**
   * @type {number}
   * @description Total time of the route in seconds.
   */
  totalTime: 0,

  /**
   * @type {number}
   * @description Index of the current destination in the route.
   */
  currentDestination: 1,

  /**
   * @type {string}
   * @description Optimization mode ('time' or 'distance').
   */
  mode: 'time',

  /**
   * @type {string}
   * @description Method of transport for the route ('shuffle' or specific method).
   */
  transportMethod: 'shuffle',

  /**
   * @type {boolean}
   * @description Flag indicating if the route has started.
   */
  routeStarted: false,

  /**
   * Adds a destination to the route.
   * @param {Destination} destination - The destination to add.
   */
  addDestination(destination) {
    this.route.push(destination);
    console.log(this.route);
  },

  /**
   * Removes a destination from the route by index.
   * @param {number} index - The index of the destination to remove.
   */
  removeDestination(index) {
    if (index >= 0 && index < this.route.length) {
      console.log('Removing: ' + this.route[index].name);
      this.route.splice(index, 1);
    }
  },

  /**
   * Clears the current route and resets all related properties.
   */
  clearRoute() {
    this.route = [];
    this.optimizedRoute = [];
    this.optimizedRouteMethod = [];
    this.totalDistance = 0;
    this.totalTime = 0;
    this.mode = 'time';
    this.transportMethod = 'shuffle';
    this.currentDestination = 1;
  },

  /**
   * Optimizes the current route using the Nearest Neighbour or Simulated Annealing algorithm.
   * If the route has fewer than 2 destinations, it will log a message and not optimize.
   * @returns {Promise<void>}
   */
  async optimizeRoute() {
    if (this.route.length > 1) {
      try {
        console.log("Optimizing route...");

        let optimizedResult;

        if (this.route[0].name === "Current Location") {
          // Use Nearest Neighbour for the current location as the starting point
          optimizedResult = await NearestNeighbour.nearestNeighbourSolution(this.route, this.mode, this.transportMethod);
        } else {
          // Use Simulated Annealing for general optimization
          optimizedResult = await SimulatedAnnealing.simulatedAnnealingSolution(this.route, this.mode, this.transportMethod);
        }

        const { optimizedRoute, totalDistance, totalTime, optimizedRouteMethod } = optimizedResult;

        if (optimizedRoute && totalDistance !== undefined && totalTime !== undefined && optimizedRouteMethod) {
          this.optimizedRoute = optimizedRoute;
          this.totalDistance = totalDistance;
          this.totalTime = totalTime;
          this.optimizedRouteMethod = optimizedRouteMethod;
        } else {
          console.error("Optimization result is missing required properties.");
        }

      } catch (error) {
        console.error("Error during route optimization:", error);
      }
    } else {
      console.log("Not enough destinations to optimize.");
    }

    console.log('Optimized Route:', this.optimizedRoute);
    console.log('Optimized Methods:', this.optimizedRouteMethod);
    console.log('Total Distance:', this.totalDistance / 1000, 'km');
    console.log('Total Time:', this.totalTime / 60, 'minutes');
  },

  /**
   * Gets the distance and duration between two locations using Google Maps Distance Matrix API.
   * @param {Destination} origin - The starting location.
   * @param {Destination} destination - The ending location.
   * @param {string} method - The transport method (e.g., 'driving', 'walking').
   * @returns {Promise<{distanceValue: number, durationValue: number, transportMethod: string} | null>} - The best distance, duration, and transport method or null if no valid result is found.
   */
  async getDistance(origin, destination, method) {
    let bestDistance = Infinity;
    let bestDuration = Infinity;

    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&key=${GOOGLE_MAPS_API_KEY}`
      );

      if (response.data && response.data.rows && response.data.rows[0] && response.data.rows[0].elements && response.data.rows[0].elements[0]) {
        const distanceData = response.data.rows[0].elements[0];
        if (distanceData.status !== "NOT_FOUND") {
          bestDistance = distanceData.distance.value;
          bestDuration = distanceData.duration.value;
        }
      }
    } catch (error) {
      console.error(`Error fetching distance with method ${method}:`, error);
    }

    if (bestDuration < Infinity) {
      return { distanceValue: bestDistance, durationValue: bestDuration, transportMethod: method };
    } else {
      return null;
    }
  }
};

export default RouteManager;
