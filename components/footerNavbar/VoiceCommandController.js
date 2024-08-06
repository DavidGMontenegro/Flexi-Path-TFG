import Voice from '@react-native-voice/voice';
import RouteManager from '../newRoute/RouteManager';
import axios from 'axios';
import Tts from 'react-native-tts';

const GOOGLE_MAPS_API_KEY = '---';

// Configurar TTS para español
Tts.setDefaultLanguage('es-ES');
Tts.setDefaultVoice('default'); 

/**
 * Voice command controller for handling speech recognition and navigation commands.
 * @namespace VoiceCommandController
 */
const VoiceCommandController = {
  /**
   * Starts listening for voice commands.
   * @memberof VoiceCommandController
   * @function startListening
   */
  startListening() {
    Voice.onSpeechError = this.onSpeechError;
    Voice.onSpeechResults = this.onSpeechResults;
    Voice.start("es-ES");
  },

  /**
   * Stops listening for voice commands.
   * @memberof VoiceCommandController
   * @function stopListening
   */
  stopListening() {
    Voice.removeAllListeners();
    Voice.stop();
  },

  /**
   * Callback function for speech recognition results.
   * Identifies the command and delegates further actions.
   * @memberof VoiceCommandController
   * @function onSpeechResults
   * @param {object} result - Speech recognition result object.
   */
  onSpeechResults(result) {
    const command = result.value[0].toLowerCase();
    console.log("Command detected:", command);
    VoiceCommandController.identifyCommand(command);
  },

  /**
   * Callback function for speech recognition errors.
   * Logs the error to the console.
   * @memberof VoiceCommandController
   * @function onSpeechError
   * @param {string} error - Speech recognition error message.
   */
  onSpeechError(error) {
    console.log("Speech recognition error:", error);
  },

  /**
   * Identifies and executes commands based on the recognized speech command.
   * @memberof VoiceCommandController
   * @function identifyCommand
   * @param {string} command - Recognized speech command.
   */
  identifyCommand(command) {
    if (command.includes("añade el destino")) {
      const destinationName = command.replace("añade el destino", "").trim();
      VoiceCommandController.addDestination(destinationName);
    } else if (command.includes("elimina el destino")) {
      const destinationName = command.replace("elimina el destino", "").trim();
      VoiceCommandController.removeDestination(destinationName);
    } else if (command.includes("optimiza la ruta")) {
      VoiceCommandController.optimizeRoute();
    } else {
      console.log("Comando no reconocido");
      Tts.speak("Comando no reconocido");
    }
  },

  /**
   * Adds a destination to the route based on the provided address.
   * @memberof VoiceCommandController
   * @async
   * @function addDestination
   * @param {string} destinationName - Name or address of the destination to add.
   */
  async addDestination(destinationName) {
    if (destinationName) {
      console.log(destinationName);
      const newDestination = await VoiceCommandController.getGeocodingData(destinationName);
      if (newDestination) {
        RouteManager.addDestination(newDestination);
        console.log("Añadiendo destino:", destinationName);
        Tts.speak("Destino añadido");
      } else {
        console.log("No se pudo obtener la información del destino.");
        Tts.speak("No se pudo obtener la información del destino.");
      }
    } else {
      console.log("No se especificó un destino para añadir.");
      Tts.speak("No se especificó un destino para añadir.");
    }
  },

  /**
   * Removes a destination from the route based on the provided name or address.
   * @memberof VoiceCommandController
   * @function removeDestination
   * @param {string} destinationName - Name or address of the destination to remove.
   */
  removeDestination(destinationName) {
    if (destinationName) {
      const index = RouteManager.route.findIndex(dest => dest.name.toLowerCase().includes(destinationName));
      if (index !== -1) {
        RouteManager.removeDestination(index);
        console.log("Eliminando destino:", destinationName);
        Tts.speak("Destino eliminado.");
      } else {
        console.log("Destino no encontrado:", destinationName);
        Tts.speak("Destino no encontrado.");
      }
    } else {
      console.log("No se especificó un destino para eliminar.");
      Tts.speak("No se especificó un destino para eliminar.");
    }
  },

  /**
   * Optimizes the route using the current destinations.
   * @memberof VoiceCommandController
   * @async
   * @function optimizeRoute
   */
  async optimizeRoute() {
    console.log("Optimizando ruta...");
    Tts.speak("Optimizando ruta.");
    await RouteManager.optimizeRoute();
    Tts.speak("Ruta optimizada.");
  },

  /**
   * Retrieves geocoding data for the specified address using Google Maps API.
   * @memberof VoiceCommandController
   * @async
   * @function getGeocodingData
   * @param {string} address - Address to geocode.
   * @returns {Promise<object|null>} Geocoding data (coordinates, direction, name) or null if not found.
   */
  async getGeocodingData(address) {
    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`);
      if (response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location;
        const formattedAddress = response.data.results[0].formatted_address;
        return { coords: location, direction: formattedAddress, name: address };
      } else {
        console.log("No se encontraron resultados para la dirección proporcionada.");
        Tts.speak("No se encontraron resultados para la dirección proporcionada.");
        return null;
      }
    } catch (error) {
      console.error("Error al obtener datos de geocodificación:", error);
      Tts.speak("Error al obtener datos de geocodificación.");
      return null;
    }
  }
};

export default VoiceCommandController;
