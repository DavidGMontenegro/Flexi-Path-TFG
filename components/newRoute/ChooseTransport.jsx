import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableHighlight } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import RouteManager from "./RouteManager";

// Array of transport methods and corresponding icon names
const transportMethods = ["shuffle", "DRIVING", "TRANSIT", "BICYCLING", "WALKING"];
const transportIcons = ["shuffle", "car", "train", "bicycle", "walk"];

/**
 * Component for selecting transport method and route optimization mode.
 * @component
 * @param {Object} props - Component props.
 * @param {Function} props.onGoBack - Function to handle navigation back action.
 * @returns {JSX.Element}
 */
const ChooseTransport = ({ onGoBack }) => {
  const [transportMethod, setTransportMethod] = useState(RouteManager.transportMethod); // State for selected transport method
  const [optimizationMode, setOptimizationMode] = useState(RouteManager.mode); // State for selected optimization mode

  useEffect(() => {
    // Initialize states from RouteManager when component mounts
    setTransportMethod(RouteManager.transportMethod);
    setOptimizationMode(RouteManager.mode);
  }, []);

  /**
   * Function to handle selection of transport method.
   * Updates RouteManager's transport method and state.
   * @param {string} transport - Selected transport icon name.
   */
  const handleTransportSelection = (transport) => {
    const selectedMethod = transportMethods[transportIcons.indexOf(transport)];
    RouteManager.transportMethod = selectedMethod;
    setTransportMethod(transport);
  };

  /**
   * Function to handle selection of optimization mode (time or distance).
   * Updates RouteManager's mode and state.
   * @param {string} mode - Selected mode ("time" or "distance").
   */
  const handleModeSelection = (mode) => {
    RouteManager.mode = mode;
    setOptimizationMode(mode);
  };

  return (
    <View style={styles.container}>
      {/* Button to navigate back */}
      <TouchableHighlight
        onPress={() => onGoBack()}
        underlayColor="transparent"
      >
        <Ionicons name="chevron-back-outline" size={24} color="#2E86C1" />
      </TouchableHighlight>

      <View style={styles.buttonContainer}>
        {/* Mapping transport methods and their icons */}
        {transportIcons.map((transport) => (
          <TouchableHighlight
            key={transport}
            onPress={() => handleTransportSelection(transport)}
            underlayColor="transparent"
          >
            <View style={[styles.transportIcon, transportMethod === transport && styles.selectedTransportIcon]}>
              <Ionicons name={transport} size={32} color="#FFA500" />
            </View>
          </TouchableHighlight>
        ))}
        
        {/* Divider */}
        <View
          style={{ backgroundColor: "#252525", width: 2, height: 32, marginHorizontal: 5 }}
        ></View>

        {/* Buttons to select mode (time or distance) */}
        <TouchableHighlight
          onPress={() => handleModeSelection("time")}
          underlayColor="transparent"
        >
          <View style={[styles.transportIcon, optimizationMode === "time" && styles.selectedTransportIcon]}>
            <Ionicons name="time" size={32} color="#2E86C1" />
          </View>
        </TouchableHighlight>

        <TouchableHighlight
          onPress={() => handleModeSelection("distance")}
          underlayColor="transparent"
        >
          <View style={[styles.transportIcon, optimizationMode === "distance" && styles.selectedTransportIcon]}>
            <Ionicons name="analytics-outline" size={32} color="#2E86C1" />
          </View>
        </TouchableHighlight>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#535353",
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 10,
    marginLeft: 10
  },
  transportIcon: {
    backgroundColor: "#535353",
    borderRadius: 10,
    padding: 5
  },
  selectedTransportIcon: {
    backgroundColor: "#252525"
  },
});

export default ChooseTransport;
