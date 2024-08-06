import React from "react";
import { StyleSheet, View, Text, ScrollView, TouchableHighlight, ToastAndroid } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { FIRESTORE_DB } from "../../../firebase-config";
import { deleteDoc, doc } from "firebase/firestore";
import { useAuth } from "../../../AuthContext";
import RouteManager from "../../newRoute/RouteManager";

/**
 * Component for displaying detailed information and map view of a selected route.
 * Allows navigation and deletion of the route from user's history.
 * @param {Object} route - The route object containing route details and coordinates.
 * @param {Object[]} route.route - Array of stops with coordinates on the route.
 * @param {string} route.route[].name - Name of the stop.
 * @param {string} route.route[].direction - Direction or description of the stop.
 * @param {string} route.fecha - Date string of when the route was created.
 * @param {string} route.createdAt - Timestamp of when the route was created.
 * @param {string} route.id - ID of the route document in Firestore.
 * @returns {JSX.Element} RouteDataView component.
 */
const RouteDataView = ({ route }) => {
  const { route: selectedRoute } = route.params;
  const navigation = useNavigation();
  const { uid } = useAuth();

  const initialRegion = {
    latitude: selectedRoute.route[0].coords.lat,
    longitude: selectedRoute.route[0].coords.lng,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  /**
   * Sets the selected route as the user's current route using RouteManager.
   */
  const handleSetRoute = () => {
    RouteManager.route = selectedRoute.route;
    navigation.navigate("Home");
  };

  /**
   * Navigates back to the RouteHistory screen.
   */
  const handleGoBack = () => {
    navigation.navigate("RouteHistory");
  };

  /**
   * Handles the deletion of the selected route from user's history in Firestore.
   * Shows a toast message upon successful deletion.
   */
  const handleRemove = async () => {
    try {
      const routeRef = doc(FIRESTORE_DB, "users", uid, "RouteHistory", selectedRoute.id);
      await deleteDoc(routeRef);
      console.log("Route deleted from history:", selectedRoute.name);
      ToastAndroid.show("History route deleted correctly", ToastAndroid.SHORT);
      navigation.navigate("Home");
    } catch (error) {
      console.error("Error deleting route:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header section with navigation buttons and route information */}
      <View style={styles.headerContainer}>
        <TouchableHighlight
          onPress={handleGoBack}
          underlayColor="#2E86C100"
        >
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableHighlight>
        <Text style={styles.routeName}>{selectedRoute.fecha}</Text>
        <TouchableHighlight
          onPress={handleRemove}
          underlayColor="#2E86C100"
        >
          <Ionicons name="trash" size={26} color="#fff" />
        </TouchableHighlight>
      </View>

      {/* Map view showing markers for each stop on the route */}
      <MapView style={styles.map} initialRegion={initialRegion}>
        {selectedRoute.route.map((stop, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: stop.coords.lat,
              longitude: stop.coords.lng,
            }}
            title={stop.name}
            description={`Stop ${index + 1}`}
          />
        ))}
      </MapView>

      {/* Additional route details and list of stops */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", paddingHorizontal: "5%" }}>
        <Text style={styles.routeDetails}>{selectedRoute.createdAt}</Text>
        <Text style={styles.routeDetails}>{selectedRoute.route.length} stops</Text>
      </View>
      <ScrollView style={styles.detailsContainer}>
        {selectedRoute.route.map((stop, index) => (
          <View key={index} style={styles.stopContainer}>
            <Text style={styles.stopName}>{stop.name}</Text>
            <Text style={styles.stopCoords}>{stop.direction}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Button to set the selected route as the user's current route */}
      <TouchableHighlight
        onPress={handleSetRoute}
        underlayColor="#2E86C100"
        style={{
          backgroundColor: "#FFA500",
          paddingVertical: 5,
          borderRadius: 10,
          alignItems: "center",
          margin: "auto",
          marginBottom: "3%",
          paddingHorizontal: 20,
          paddingVertical: 10
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="locate" size={26} color="#2E86C1" />
          <Text style={{ fontSize: 16, fontWeight: "300" }}> Set as route</Text>
        </View>
      </TouchableHighlight>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#252525",
  },
  headerContainer: {
    paddingTop: 60,
    paddingBottom: 10,
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#2E86C1",
    flexDirection: "row",
    padding: "5%",
  },
  map: {
    height: 400,
    margin: "5%",
    marginBottom: 0,
    height: "35%",
  },
  detailsContainer: {
    marginTop: 0,
    margin: "5%",
  },
  routeName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  routeDetails: {
    fontSize: 14,
    color: "white",
    marginBottom: 5,
    fontWeight: "300",
  },
  stopContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#333333",
    borderRadius: 8,
    alignContent: "space-evenly",
  },
  stopName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginVertical: "2%",
  },
  stopCoords: {
    fontSize: 14,
    color: "#808080",
  },
});

export default RouteDataView;
