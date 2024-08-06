import React, { useState }  from "react";
import { View, Text, StyleSheet, TouchableHighlight } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import MenuOptions from "./MenuOptions";
import EditProfile from "./editProfile/EditProfile";
import ChangePassword from "./editProfile/ChangePassword";
import NotificationSettings from "./notifications/NotificationSettings";
import { signOut } from "firebase/auth";
import { FIREBASE_AUTH } from "../../firebase-config";
import { useAuth } from "../../AuthContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import StatsScreen from "./stats/StatsScreen";
import FriendsLocation from "./friendsLocation/FriendsLocation";
import LocationRequests from "./locationRequests/LocationRequests";

/**
 * Component for rendering the header menu with user information and options.
 * @component
 * @param {Object} props - Component props.
 * @param {Function} props.onBackPress - Function to handle back button press.
 * @returns {JSX.Element} Header menu component.
 */
const HeaderMenu = ({ onBackPress }) => {
  const navigation = useNavigation();
  const [selectedOption, setSelectedOption] = useState("none");
  const { username, name, setIsLoggedIn, setUsername, setName, setEmail, setUid } = useAuth();
  const auth = FIREBASE_AUTH;

  /**
   * Handles the selection of a menu option.
   * @param {string} option - Selected menu option.
   */
  const handleSelectOption = async (option) => {
    setSelectedOption(option);
  };

  /**
   * Handles the logout process.
   * Clears user data from AsyncStorage and resets authentication state.
   * Navigates back to the login screen.
   */
  const logOut = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('user');
      setIsLoggedIn(false);
      setUsername('');
      setName('');
      setEmail('');
      setUid('');
      setSelectedOption("none");
      onBackPress();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      navigation.navigate("LogIn");
    }
  };

  return (
    <View style={styles.header}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <TouchableHighlight onPress={onBackPress} underlayColor="#88800">
          <Ionicons name="chevron-back-outline" size={28} color="#FFA500" />
        </TouchableHighlight>
        <TouchableHighlight onPress={logOut} underlayColor="#88800">
          <Ionicons name="log-out-outline" size={28} color="#FFA500" />
        </TouchableHighlight>
      </View>
      
      <View style={styles.menuContainer}>
        <Ionicons name="person" size={100} color="#FFF" />
        <Text style={styles.userText}>@{username}</Text>
        <Text style={styles.userText}>{name}</Text>
      </View>
      <View style={styles.horizontalLine} />
      {selectedOption === "none" &&  <MenuOptions onSelectOption={handleSelectOption} />}
      {selectedOption === "EditProfile" && <EditProfile onSelectOption={handleSelectOption} onDeleteAccount={logOut} />}
      {selectedOption === "ChangePassword" && <ChangePassword onBackPress={onBackPress} />}
      {selectedOption === "NotificationSettings" && <NotificationSettings onBackPress={onBackPress} />}
      {selectedOption === "Stats" && <StatsScreen />}
      {selectedOption === "LocationRequests" && <LocationRequests />}
      {selectedOption === "FriendsLocation" && <FriendsLocation />}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "column",
    backgroundColor: "#2E86C2",
    opacity: 0.9,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 15,
    width: "87%",
  },
  menuContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  userText: {
    color: "white",
    fontSize: 18,
    paddingVertical: 5,
    fontWeight: "300"
  },
  horizontalLine: {
    borderBottomColor: "white",
    borderBottomWidth: 1,
    marginVertical: 10,
  },
});

export default HeaderMenu;
