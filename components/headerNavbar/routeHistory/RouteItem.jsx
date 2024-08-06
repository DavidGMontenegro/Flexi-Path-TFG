import React from "react";
import { View, Text, TouchableHighlight, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * Component representing an item in the route history list.
 * Displays route details such as time, origin, distance, and duration.
 * @param {Object} props - Component props.
 * @param {string} props.hora - Time of the route in 24-hour format.
 * @param {string} props.origen - Origin location of the route.
 * @param {string} props.distancia - Distance of the route formatted as kilometers.
 * @param {string} props.tiempo - Duration of the route formatted as "Xh Ymin".
 * @param {function} props.onPress - Function to handle press event on the item.
 * @returns {JSX.Element} RouteItem component.
 */
const RouteItem = ({ hora, origen, distancia, tiempo, onPress }) => {
  // Shortens the origin location if it's longer than 13 characters
  const destinoCortado = origen.length > 13 ? origen.substring(0, 11) + '...' : origen;

  return (
    <View style={styles.routeItem}>
      {/* Display time of the route */}
      <Text style={styles.routeItemText}>{hora}</Text>
      <View>
        {/* Display origin location with shortened text */}
        <Text style={styles.routeItemText}>Ruta desde {destinoCortado}</Text>
        <View style={styles.routeItemDetails}>
          {/* Display route details: distance and duration */}
          <Text style={styles.routeItemDetailText}>{distancia}</Text>
          <Text style={styles.routeItemDetailText}>{tiempo}</Text>
        </View>
      </View>
      {/* Button/icon to view detailed route information */}
      <TouchableHighlight
        onPress={onPress}
        underlayColor="#2E86C100"
      >
        <Ionicons name="arrow-redo-outline" size={30} color="#FFA500" />
      </TouchableHighlight>
    </View>
  );
};

const styles = StyleSheet.create({
  routeItem: {
    backgroundColor: "#808080",
    padding: 15,
    paddingHorizontal: 20,
    margin: 10,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  routeItemText: {
    fontSize: 20,
    color: "white"
  },
  routeItemDetails: {
    flexDirection: "row",
    justifyContent: "center"
  },
  routeItemDetailText: {
    fontSize: 16,
    color: "white",
    marginHorizontal: 15
  }
});

export default RouteItem;
