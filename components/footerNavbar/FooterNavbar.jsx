import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableHighlight } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../AuthContext";
import RouteManager from "../newRoute/RouteManager";
import LottieView from "lottie-react-native";
import VoiceCommandController from "./VoiceCommandController";

/**
 * Footer navigation bar component with bookmark and voice command functionality.
 * @component
 * @param {object} props - Component props
 * @param {function} props.onNewRoutePress - Function to handle new route press event.
 * @returns {JSX.Element}
 */
const FooterNavbar = ({ onNewRoutePress }) => {
  const navigator = useNavigation();
  const { isLoggedIn } = useAuth();
  const [isMicActive, setIsMicActive] = useState(false);

  /**
   * Handles mic button press to toggle voice command activation.
   * Starts or stops voice recognition based on current state.
   * @function handleMicPress
   */
  const handleMicPress = () => {
    if (isMicActive) {
      VoiceCommandController.stopListening();
      setIsMicActive(false);
    } else {
      VoiceCommandController.startListening();
      setIsMicActive(true);
    }
  };

  return (
    <>
      <View style={styles.header}>
        {!isMicActive && (
          <TouchableHighlight
            onPress={() =>
              isLoggedIn
                ? navigator.navigate("BookmarkPage")
                : navigator.navigate("LogIn")
            }
            underlayColor="#88800"
          >
            <Ionicons name="bookmark-outline" size={32} color="#2E86C1" />
          </TouchableHighlight>
        )}
        {isMicActive && (
          <LottieView
            source={require("../../assets/animations/audioListening.json")}
            autoPlay
            loop
            style={styles.loadingAnimation}
          />
        )}
        <View style={styles.centralButton} />
        <TouchableHighlight onPress={handleMicPress} underlayColor="#88800">
          <Ionicons
            name={isMicActive ? "close" : "mic-outline"}
            size={32}
            color="#2E86C1"
          />
        </TouchableHighlight>
      </View>
      {!isMicActive && (
        <View style={styles.centralButtonIcon}>
          <TouchableHighlight onPress={onNewRoutePress} underlayColor="#88800">
            {RouteManager.route.length > 0 ? (
              <View
                style={{
                  borderRadius: 50,
                  backgroundColor: "#808080",
                  padding: 10,
                  borderColor: "#252525",
                  borderWidth: 3,
                }}
              >
                <Ionicons name="map" size={40} color="#FFA500" />
              </View>
            ) : (
              <View>
                <Ionicons
                  name="add-circle"
                  size={75}
                  color="#FFA500"
                  style={{ position: "absolute" }}
                />
                <Ionicons name="add-circle-outline" size={75} color="#252525" />
              </View>
            )}
          </TouchableHighlight>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#252525",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 40,
    alignItems: "center",
  },
  centralButton: {
    width: 100,
  },
  centralButtonIcon: {
    position: "absolute",
    top: -38,
  },
  loadingAnimation: {
    width: 50,
    height: 50,
    position: "absolute",
    left: "15%"
  },
});

export default FooterNavbar;
