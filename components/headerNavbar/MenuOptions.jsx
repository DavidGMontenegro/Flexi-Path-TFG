import React from "react";
import { View, Text, StyleSheet, TouchableHighlight } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

/**
 * Component for rendering a menu with various options.
 * @component
 * @param {Object} props - Component props.
 * @param {Function} props.onSelectOption - Function to handle selection of menu option.
 * @returns {JSX.Element} Menu options component.
 */
const MenuOptions = ({ onSelectOption }) => {
  const navigator = useNavigation();
  
  return (
    <>
      <TouchableHighlight
        onPress={() => onSelectOption("EditProfile")}
        underlayColor="#88800"
        style={styles.button}
      >
        <View style={styles.itemContainer}>
          <View style={{ flexDirection: "row", alignItems: "center"}}>
            <Ionicons name="create-outline" size={28} color="#FFF"></Ionicons>
            <Text style={{ color: "#FFF", fontSize: 17, marginLeft: 10 }}>
              Edit profile
            </Text>
          </View>
          <Ionicons
            name="chevron-forward-outline"
            size={22}
            color="#FFF"
          ></Ionicons>
        </View>
      </TouchableHighlight>
      <TouchableHighlight
        onPress={() => onSelectOption("NotificationSettings")}
        underlayColor="#88800"
        style={styles.button}
      >
        <View style={styles.itemContainer}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color="#FFF"
            ></Ionicons>
            <Text style={{ color: "#FFF", fontSize: 17, marginLeft: 10 }}>
              Notifications
            </Text>
          </View>
          <Ionicons
            name="chevron-forward-outline"
            size={24}
            color="#FFF"
          ></Ionicons>
        </View>
      </TouchableHighlight>
      <TouchableHighlight
        onPress={() => navigator.navigate("RouteHistory")}
        underlayColor="#88800"
        style={styles.button}
      >
        <View style={styles.itemContainer}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="albums-outline" size={24} color="#FFF"></Ionicons>
            <Text style={{ color: "#FFF", fontSize: 17, marginLeft: 10 }}>
              Route history
            </Text>
          </View>
          <Ionicons
            name="chevron-forward-outline"
            size={24}
            color="#FFF"
          ></Ionicons>
        </View>
      </TouchableHighlight>
      <TouchableHighlight
        onPress={() => onSelectOption("Stats")}
        underlayColor="#88800"
        style={styles.button}
      >
        <View style={styles.itemContainer}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="trending-up" size={24} color="#FFF"></Ionicons>
            <Text style={{ color: "#FFF", fontSize: 17, marginLeft: 10 }}>
              Travel statistics
            </Text>
          </View>
          <Ionicons
            name="chevron-forward-outline"
            size={24}
            color="#FFF"
          ></Ionicons>
        </View>
      </TouchableHighlight>
      <View style={styles.horizontalLine} />
      <TouchableHighlight
        onPress={() => onSelectOption("LocationRequests")}
        underlayColor="#88800"
        style={styles.button}
      >
        <View style={styles.itemContainer}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons
              name="mail-outline"
              size={24}
              color="#FFF"
            ></Ionicons>
            <Text style={{ color: "#FFF", fontSize: 17, marginLeft: 10 }}>
              Location requests
            </Text>
          </View>
          <Ionicons
            name="chevron-forward-outline"
            size={24}
            color="#FFF"
          ></Ionicons>
        </View>
      </TouchableHighlight>
      <TouchableHighlight
        onPress={() => onSelectOption("FriendsLocation")}
        underlayColor="#88800"
        style={styles.button}
      >
        <View style={styles.itemContainer}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="location-outline" size={24} color="#FFF"></Ionicons>
            <Text style={{ color: "#FFF", fontSize: 17, marginLeft: 10 }}>
              Send request
            </Text>
          </View>
          <Ionicons
            name="chevron-forward-outline"
            size={24}
            color="#FFF"
          ></Ionicons>
        </View>
      </TouchableHighlight>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#808080",
    opacity: 0.9,
    borderRadius: 15,
    marginTop: 10,
    paddingVertical: 10,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  horizontalLine: {
    borderBottomColor: "white",
    borderBottomWidth: 1,
    marginVertical: 10,
    marginTop: 20
  },
});

export default MenuOptions;
