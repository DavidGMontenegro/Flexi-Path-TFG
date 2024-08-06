import React, { useState } from "react";
import { StyleSheet, Input, View, TouchableHighlight } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

const GoogleSearchBar = ({searchedLocation, goBack, style }) => {

  return (
    <View style={styles.searchContainer}>
      <TouchableHighlight
      onPress={() => goBack()}
      underlayColor="#2E86C100"
      style={{marginTop: 10}}
      >
        <Ionicons name="close" size={24} color={"#808080"}/>
      </TouchableHighlight>
      <GooglePlacesAutocomplete
        enablePoweredByContainer={false} 
        fetchDetails={true}
        placeholder="Search..."
        onFail={(err) => { console.log("GooglePlacesAutocomplete - error -> ", err); }}
        onPress={(data, details = null) => {
          console.log(details)
          searchedLocation(details);
        }}
          query={{
            key: '---',
            language: 'es',
            components: 'country:es',
          }}
          textInputProps={{
            InputComp: Input,
            leftIcon: { type: 'font-awesome', name: 'chevron-left' },
            errorStyle: { color: 'red' },
          }}
        />
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 5,
    margin: 20,
    paddingHorizontal: 10,
  }
});

export default GoogleSearchBar;
