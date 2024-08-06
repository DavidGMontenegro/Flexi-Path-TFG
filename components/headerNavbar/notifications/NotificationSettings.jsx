import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Switch } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../../AuthContext";
import { deleteFollowMaster, registerFollowMasterID } from "native-notify";

/**
 * Component for managing notification settings.
 * Allows users to toggle receiving notifications and updates settings in AsyncStorage.
 * Utilizes AsyncStorage for persisting user settings and native-notify for notification registration.
 * @returns {JSX.Element} NotificationSettings component.
 */
const NotificationSettings = () => {
  const [receiveNotifications, setReceiveNotifications] = useState(false);
  const { uid } = useAuth();

  // Load initial notification setting state on component mount
  useEffect(() => {
    const fetchNotificationSetting = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData !== null) {
          const parsedUserData = JSON.parse(userData);
          setReceiveNotifications(parsedUserData.allowNotifications || false);
        }
      } catch (error) {
        console.error("Error fetching notification settings:", error);
      }
    };

    fetchNotificationSetting();
  }, []);

  /**
   * Toggles the state of receiveNotifications and updates AsyncStorage accordingly.
   * Registers or deletes the user's notification ID with native-notify based on the toggle.
   */
  const toggleReceiveNotifications = async () => {
    setReceiveNotifications((prev) => !prev);

    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData !== null) {
        const parsedUserData = JSON.parse(userData);
        if (parsedUserData.allowNotifications) {
          deleteFollowMaster(21031, "6y2Y9hdgxLHvd9DtOgZxwW", uid);
        } else {
          registerFollowMasterID(uid, 21031, "6y2Y9hdgxLHvd9DtOgZxwW");
        }
        // Update AsyncStorage with the new notification state
        await AsyncStorage.setItem(
          "user",
          JSON.stringify({ ...parsedUserData, allowNotifications: !parsedUserData.allowNotifications })
        );
      }
    } catch (error) {
      console.error("Error toggling notification settings:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.option}>
        {/* Text indicating the option to receive notifications */}
        <Text style={styles.optionText}>Receive Notifications</Text>
        {/* Switch component to toggle notifications */}
        <Switch
          trackColor={{ false: "#767577", true: "#FFA500" }}
          thumbColor={receiveNotifications ? "#f4f3f4" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleReceiveNotifications}
          value={receiveNotifications}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#252525",
    borderRadius: 15,
    marginTop: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  optionText: {
    color: "#FFF", // Adjust text color based on your app's design
    fontSize: 16,
  },
});

export default NotificationSettings;
