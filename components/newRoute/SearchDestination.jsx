import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import GoogleSearchBar from "../generalComponents/GoogleSearchBar";
import { useNavigation } from "@react-navigation/native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { FIRESTORE_DB } from "../../firebase-config";
import { useAuth } from "../../AuthContext";
import MainModal from "./MainModal";

/**
 * Component for searching and displaying a destination on a map.
 * @component SearchDestination
 * @returns {JSX.Element} SearchDestination component
 */
const SearchDestination = () => {
  const navigation = useNavigation();
  const [destination, setDestination] = useState(null);
  const [initialRegion, setInitialRegion] = useState(null);
  const mapRef = useRef(null);
  const { uid } = useAuth();
  const createRouteRef = useRef(null);

  /**
   * Fetches location permissions and sets the initial region for the map.
   * @method
   */
  useEffect(() => {
    const getPermissionAndLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Please grant location permissions");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setInitialRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.045,
        longitudeDelta: 0.02,
      });
    };

    getPermissionAndLocation();
  }, []);

  /**
   * Animates the map to the selected destination when `destination` state updates.
   * @method
   */
  useEffect(() => {
    if (destination && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: destination.geometry.location.lat,
        longitude: destination.geometry.location.lng,
        latitudeDelta: 0.045,
        longitudeDelta: 0.02,
      });
    }
  }, [destination]);

  /**
   * Handles the location searched in the GoogleSearchBar and updates the Firestore database.
   * @param {Object} location - The location object returned from GoogleSearchBar.
   * @param {Object} location.geometry - The geometry object containing location coordinates.
   * @param {Object} location.geometry.location - The location coordinates.
   * @param {number} location.geometry.location.lat - The latitude of the location.
   * @param {number} location.geometry.location.lng - The longitude of the location.
   * @param {string} location.name - The name of the location.
   * @param {string} location.formatted_address - The formatted address of the location.
   * @method
   */
  const handleSearchedLocation = async (location) => {
    if (uid) {
      try {
        const searchHistoryRef = collection(
          FIRESTORE_DB,
          "users",
          uid,
          "SearchHistory"
        );
        await setDoc(doc(searchHistoryRef, location.name), {
          name: location.name,
          coords: location?.geometry.location,
          formatted_address: location.formatted_address,
          timestamp: new Date().getTime(),
        });

        const searchHistorySnapshot = await getDocs(
          query(searchHistoryRef, orderBy("timestamp", "desc"))
        );

        if (searchHistorySnapshot.size > 7) {
          const oldestDoc = searchHistorySnapshot.docs.pop();
          console.log("Oldest item to delete:", oldestDoc.data().name);
          await deleteDoc(oldestDoc.ref);
        }
      } catch (error) {
        console.error("Error adding search to history:", error);
      }
    }

    setDestination(location);
    createRouteRef.current?.present();
  };

  return (
    <View style={styles.container}>
      {/* GoogleSearchBar for location search */}
      <View style={styles.searchBarContainer}>
        <GoogleSearchBar
          searchedLocation={(location) => handleSearchedLocation(location)}
          goBack={() => navigation.navigate("Home")}
        />
      </View>

      {/* MapView to display the selected destination */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          showsUserLocation
          showsMyLocationButton={false}
          initialRegion={initialRegion}
          ref={mapRef}
        >
          {/* Display marker for selected destination if available */}
          {destination && (
            <Marker
              coordinate={{
                latitude: destination.geometry.location.lat,
                longitude: destination.geometry.location.lng,
              }}
              title={destination.name}
              description={destination.formatted_address}
            />
          )}
        </MapView>
      </View>

      {/* Modal component for creating routes */}
      <MainModal ref={createRouteRef} destination={destination} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#252525",
  },
  searchBarContainer: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default SearchDestination;
