import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../AuthContext";
import RouteManager from "../newRoute/RouteManager"

/**
 * Component for rendering the header navigation bar.
 * @component
 * @param {Object} props - Component props.
 * @param {string} props.streetName - Name of the current street displayed.
 * @param {Function} props.onPressText - Function to handle text press action.
 * @param {Function} props.toggleMenu - Function to toggle the user menu.
 * @param {Function} props.onCloseRoute - Function to close the route.
 * @returns {JSX.Element} Header navigation bar component.
 */
const HeaderNav = ({ streetName, onPressText, toggleMenu, onCloseRoute }) => {
  const navigation = useNavigation();
  const { isLoggedIn } = useAuth();
  const [showRoute, setShowRoute] = useState(RouteManager.optimizedRoute.length > 0);

  useEffect(() => {
    setShowRoute(RouteManager.optimizedRoute.length > 0)
  }, [RouteManager.optimizedRoute.length]);

  /**
   * Handles user button press action.
   * If user is logged in, toggles the user menu.
   * If user is not logged in, navigates to the login screen.
   */
  const handleUserButton = () => {
    if (isLoggedIn) {
      toggleMenu();
    } else {
      navigation.navigate("LogIn");
    }
  };

  /**
   * Handles closing the route and hiding the route display.
   */
  const handleClose = () => {
    setShowRoute(false)
    onCloseRoute()
  }

  return (
    <View style={styles.header}>
      {
        showRoute &&
        <TouchableOpacity style={styles.button} onPress={handleClose}>
          <Ionicons name="close" size={32} color="#FFF"></Ionicons>
        </TouchableOpacity>
      }
      <TouchableOpacity onPress={onPressText} style={styles.textContainer}>
        <Text style={styles.text}>{streetName}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleUserButton}>
        <Ionicons name="person" size={32} color="#FFF"></Ionicons>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#2E86C2',
    opacity: 0.95,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  textContainer: {
    width: '65%',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  button: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HeaderNav;
