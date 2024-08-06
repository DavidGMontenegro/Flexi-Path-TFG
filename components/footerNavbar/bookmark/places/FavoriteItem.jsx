
import React from "react";
import { View, Text, TouchableHighlight, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * FavoriteItem component.
 * @param {object} props - Component props containing name, image, and onPress function.
 * @returns {JSX.Element} JSX element representing a favorite item.
 */
const FavoriteItem = ({ name, image, onPress }) => {
  return (
    <TouchableHighlight
      onPress={onPress}
      underlayColor="#FFF00"
      style={styles.favoriteItem}
    >
      <View style={styles.itemContainer}>
        <View style={styles.leftContainer}>
          {image ? (
            <Image source={{ uri: image }} style={styles.favoriteImage} />
          ) : (
            <Ionicons name="people-circle-outline" size={50} color="#1F1F1F" />
          )}
          <View style={styles.textContainer}>
            <Text style={styles.favoriteItemText} numberOfLines={1}>
              {name}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward-outline" size={30} color="#FFA500" />
      </View>
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  favoriteItem: {
    backgroundColor: "#808080",
    marginVertical: 10,
    marginHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 6,
    paddingHorizontal: 10
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  textContainer: {
    marginLeft: 5,
    width: "75%"
  },
  favoriteItemText: {
    color: "white",
    fontSize: 18
  },
  favoriteImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10
  },
});

export default FavoriteItem;
