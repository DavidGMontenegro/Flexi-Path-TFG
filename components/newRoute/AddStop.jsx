import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableHighlight } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import RecentSearchs from "./RecentSearchs"; // Component for recent searches
import { useAuth } from "../../AuthContext"; // User authentication context
import { collection, doc, getDocs, setDoc } from "firebase/firestore"; // Firestore imports for data handling
import { FIRESTORE_DB } from "../../firebase-config"; // Firebase configuration
import FirstBookmarksView from "./FirstBookmarks"; // Component for first bookmarks

/**
 * Component for adding stops to routes and managing personal locations.
 * @component
 * @param {Object} props - Component props.
 * @param {Object} props.navigatorObject - Navigation object for navigation actions.
 * @param {Function} props.handleSearch - Function to handle search action.
 * @param {Function} props.handleDestinationSelected - Function to handle destination selection.
 * @returns {JSX.Element}
 */
const AddStop = ({ navigatorObject, handleSearch, handleDestinationSelected }) => {
  const { uid } = useAuth(); // User authentication context
  const navigator = navigatorObject; // Navigation object for navigation actions

  /**
   * Handles adding a personal location based on location type.
   * Checks if location exists and calls handleDestinationSelected if found.
   * @param {string} locationType - Type of personal location (e.g., "Home", "Work").
   */
  const handleAddPersonalLocation = async (locationType) => {
    try {
      const userDocRef = doc(FIRESTORE_DB, "users", uid); // User document reference
      const collectionRef = collection(userDocRef, "PersonalLocations"); // Reference to personal locations collection
      const querySnapshot = await getDocs(collectionRef); // Gets a snapshot of documents in the collection
      const categoriesData = querySnapshot.docs.map((doc) => doc.data()); // Maps data from documents

      // Find existing location by type
      const existingLocation = categoriesData.find((data) => data.name === locationType);

      if (existingLocation) {
        // If existing location found, call function to select destination
        handleDestinationSelected({ destination: existingLocation, type: locationType });
      }
    } catch (error) {
      console.error("Error checking location:", error);
    }
  };

  return (
    <View style={styles.contentContainer}>
      {/* Search input */}
      <TouchableHighlight onPress={handleSearch} underlayColor="#2E86C100">
        <Text style={styles.search}>Search...</Text>
      </TouchableHighlight>

      {/* Conditional rendering based on user authentication */}
      {uid ? (
        // Authenticated user
        <>
          {/* Saved places section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Saved places</Text>
            <TouchableHighlight
              onPress={() => navigator.navigate("BookmarkPage")} // Navigate to bookmark page
              underlayColor="#2E86C100"
            >
              <Text style={styles.seeAll}>See All</Text>
            </TouchableHighlight>
          </View>

          {/* Divider */}
          <View style={styles.horizontalLine} />

          {/* Buttons to add Home and Work locations */}
          <View style={styles.buttonContainer}>
            <TouchableHighlight
              onPress={() => handleAddPersonalLocation("Home")}
              underlayColor="#2E86C100"
              style={styles.topButton}
            >
              <View style={styles.topButtonContent}>
                <Ionicons name="home-outline" size={22} color="#000" />
                <Text style={styles.topButtonText}>Home</Text>
                <Ionicons name="add-outline" size={22} color="#FFA500" />
              </View>
            </TouchableHighlight>

            <TouchableHighlight
              onPress={() => handleAddPersonalLocation("Work")}
              underlayColor="#2E86C100"
              style={styles.topButton}
            >
              <View style={styles.topButtonContent}>
                <Ionicons name="storefront-outline" size={22} color="#000" />
                <Text style={styles.topButtonText}>Work</Text>
                <Ionicons name="add-outline" size={22} color="#FFA500" />
              </View>
            </TouchableHighlight>
          </View>

          {/* Divider */}
          <View style={[styles.horizontalLine, { width: "50%" }]} />

          {/* First bookmarks view */}
          <FirstBookmarksView onDestinationSelected={handleDestinationSelected} />

          {/* Divider */}
          <View style={[styles.horizontalLine, { width: "50%" }]} />

          {/* Recent searches component */}
          <View style={{ width: "100%" }}>
            <RecentSearchs onDestinationSelected={handleDestinationSelected} />
          </View>
        </>
      ) : (
        // Unauthenticated user
        <View style={styles.noLoginContainer}>
          <Text style={styles.noLoginText}>To view history, please log in.</Text>
          <TouchableHighlight
            style={styles.loginButton}
            onPress={() => navigator.navigate("LogIn")} // Navigate to login page
            underlayColor="#888"
          >
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableHighlight>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
  },
  sectionTitle: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "300",
  },
  seeAll: {
    fontSize: 14,
    color: "#FFA500",
    fontWeight: "300",
  },
  search: {
    fontSize: 16,
    color: "#FFA500",
    fontWeight: "300",
    marginVertical: "2%",
    backgroundColor: "#353535",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 5
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
    width: "90%",
  },
  topButton: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#808080",
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 6,
    paddingVertical: 10,
  },
  topButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  topButtonText: {
    color: "white",
    fontSize: 18,
    marginHorizontal: 20,
  },
  horizontalLine: {
    borderBottomColor: "#808080",
    borderBottomWidth: 1,
    width: "90%",
    marginVertical: 5,
  },
  noLoginContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  noLoginText: {
    fontSize: 16,
    color: "#FFF",
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: "#2E86C1",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  loginButtonText: {
    color: "#FFF",
    fontSize: 16,
  },
});

export default AddStop;
