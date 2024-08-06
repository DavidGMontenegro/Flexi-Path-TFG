import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableHighlight } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { collection, deleteDoc, doc, setDoc } from "firebase/firestore"; // Firestore imports
import { useAuth } from "../../AuthContext"; // Authentication context import
import { FIRESTORE_DB } from "../../firebase-config"; // Firebase configuration
import RouteManager from "./RouteManager"; // Custom route manager
import * as Location from "expo-location"; // Expo location API

const GOOGLE_API_KEY = '---'; // Replace with your Google Maps API Key

/**
 * Component that displays details of a destination and allows actions like adding it to the route or marking as favorite.
 * @component
 * @param {Object} props - Component props.
 * @param {Object} props.destination - Destination details to display.
 * @param {string} props.destination.name - Name of the destination.
 * @param {string} props.destination.direction - Address of the destination.
 * @param {Object} props.destination.coords - Coordinates of the destination ({ lat, lng }).
 * @param {string} props.destination.type - Type of destination (optional).
 * @param {string} props.destination.image - URL of the destination's image (optional).
 * @param {string} props.destination.formatted_address - Formatted address of the destination.
 * @param {Function} props.onAddDestination - Function to add the destination to the route.
 * @param {Function} props.onAddBookmark - Function to add or remove the destination as a bookmark.
 * @returns {JSX.Element}
 */
const Destination = ({ destination, onAddDestination, onAddBookmark }) => {
  const { name, direction, coords, type, image, formatted_address } = destination || {}; // Extract destination properties
  const { uid } = useAuth(); // Get authenticated user's UID from context
  const [isBookmark, setIsBookmark] = useState(null); // State to indicate if destination is bookmarked
  const [photoUrl, setPhotoUrl] = useState(null); // State for destination photo URL

  useEffect(() => {
    setIsBookmark(!!type); // Set bookmarked state based on whether type exists
    const coords = destination.geometry ? destination.geometry.location : destination.coords; // Destination coordinates
    if (image){
      setPhotoUrl(image); // If there's a specific image for the destination, set the image URL
    } else if (destination.photos?.[0]?.photo_reference) {
      setPhotoUrl(getPhotoUrl(destination.photos?.[0]?.photo_reference)); // Get place photo URL from photo reference
    } else {
      setPhotoUrl(getStreetViewUrl(coords.lat, coords.lng)); // Get Street View URL if no specific photo exists
    }
  }, [destination]);

  /**
   * Function to toggle bookmark status of the destination.
   * If not bookmarked, calls function to add the destination as a bookmark.
   * If bookmarked, removes the destination from bookmarks in Firestore.
   */
  const toggleBookmark = async () => {
    if (!isBookmark) {
      onAddBookmark(destination); // Call function to add destination as bookmark
    } else {
      // Remove destination from bookmarks in Firestore
      const bookmarksCollectionRef = collection(FIRESTORE_DB, 'users', uid, type);
      await deleteDoc(doc(bookmarksCollectionRef, name));
    }
    setIsBookmark(!isBookmark); // Toggle bookmarked state
  };

  /**
   * Function to handle adding the destination to the route.
   * If route is empty, tries to get user's current location and adds it as the first destination.
   * Then adds the selected destination to the route.
   */
  const handleAddDestination = async () => {
    if (RouteManager.route.length === 0) {
      try {
        // Get user's current location
        const { coords, ...locationData } = await Location.getCurrentPositionAsync({});
        const address = await Location.reverseGeocodeAsync(coords);
        const street = address.length > 0 ? address[0].street || "Street name not found" : "";

        const { latitude: lat, longitude: lng } = coords;

        // Add current location as first destination if route is empty
        RouteManager.addDestination({
          name: "Current Location",
          coords: { lat, lng },
          direction: `${street}`,
        });
      } catch (error) {
        console.error("Error getting current location:", error);
      }
    }
    // Add selected destination to the route
    RouteManager.addDestination({ name: destination.name, direction: destination.formatted_address, coords: destination.coords ? destination.coords : destination.geometry.location });
    onAddDestination(); // Call function to add destination to route
  };

  /**
   * Function to fetch and display street name from coordinates of the destination.
   * @param {Object} coords - Coordinates of the destination ({ lat, lng }).
   */
  const reverseGeocodeLocation = async (coords) => {
    try {
      const address = await Location.reverseGeocodeAsync(coords);
      if (address.length > 0) {
        const street = address[0].street || "Street name not found";
        setStreetName(street);
      }
    } catch (error) {
      console.error("Error fetching street name:", error);
    }
  };

  /**
   * Function to get the URL of the photo using its reference and optional maximum width.
   * @param {string} photoReference - Reference of the photo.
   * @param {number} maxWidth - Maximum width of the photo (optional).
   * @returns {string} - URL of the photo.
   */
  const getPhotoUrl = (photoReference, maxWidth = 400) => {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${GOOGLE_API_KEY}`;
  };

  /**
   * Function to get the URL of Street View image from coordinates.
   * @param {number} lat - Latitude of the location.
   * @param {number} lng - Longitude of the location.
   * @param {number} width - Width of the image (optional).
   * @param {number} height - Height of the image (optional).
   * @returns {string} - URL of the Street View image.
   */
  const getStreetViewUrl = (lat, lng, width = 400, height = 300) => {
    return `https://maps.googleapis.com/maps/api/streetview?size=${width}x${height}&location=${lat},${lng}&key=${GOOGLE_API_KEY}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.destinationContainer}>
        <View style={styles.destinationInfo}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.image} />
          ) : (
            <Ionicons name="people-circle-outline" size={50} color="#1F1F1F" />
          )}
          <View style={styles.textContainer}>
            <Text style={{ color: "white", fontSize: 26, marginBottom: 10 }}>{name}</Text>
            <Text style={{ color: "white", fontSize: 16, fontWeight: "300" }}>{formatted_address}</Text>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <View />
          <TouchableHighlight
            onPress={handleAddDestination}
            underlayColor="#2E86C1"
            style={styles.button}
          >
            <Text style={{ color: "white", fontSize: 18, fontWeight: "400" }}>Add to Route</Text>
          </TouchableHighlight>
          <TouchableHighlight
            onPress={toggleBookmark}
            underlayColor="#2E86C1"
          >
            <Ionicons name={isBookmark ? "bookmark" : "bookmark-outline"} size={24} color="#2E86C1" />
          </TouchableHighlight>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  destinationContainer: {
    height: "38%",
    justifyContent: "space-evenly"
  },
  destinationInfo: {
    flexDirection: "row",
    alignItems: "center"
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    marginLeft: 10
  },
  image: {
    height: 120,
    aspectRatio: 1,
    borderRadius: 25,
  },
  button: {
    backgroundColor: "#FFA500",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
});

export default Destination;
