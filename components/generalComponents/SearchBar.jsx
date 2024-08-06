import React, { useState, useEffect } from "react";
import { StyleSheet, TextInput, View, TouchableHighlight } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SearchBar = ({ onSearch }) => {
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    onSearch(searchText);
  }, [searchText]);

  const handleClearSearch = () => {
    setSearchText("");
  };

  return (
    <View style={styles.searchContainer}>
      <Ionicons name="search-outline" size={24} color="white" style={styles.searchIcon} />
      <TextInput
        placeholder="Search"
        placeholderTextColor="#FFFFFF90"
        style={styles.searchInput}
        keyboardType="default"
        returnKeyType="search"
        onChangeText={(text) => setSearchText(text)}
        value={searchText}
      />
      {searchText.length > 0 && (
        <TouchableHighlight
          onPress={handleClearSearch}
          underlayColor="transparent"
          style={styles.searchIcon}
        >
          <Ionicons name="close-outline" size={24} color="white" />
        </TouchableHighlight>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#808080",
    borderRadius: 5,
    margin: 20,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 15,
  },
  searchInput: {
    flex: 1,
    color: "white",
    fontSize: 18,
  },
});

export default SearchBar;
