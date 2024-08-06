
import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  FlatList,
  Text,
  TouchableHighlight,
  View,
  ToastAndroid,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../../../AuthContext";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { FIRESTORE_DB } from "../../../../firebase-config";
import LottieView from "lottie-react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

/**
 * Functional component representing an item in the category list.
 * @param {Object} props - Component props.
 * @param {string} props.name - Name of the category.
 * @param {number} props.count - Number of places in the category.
 * @param {Function} props.onPress - Function to handle press event.
 * @returns {JSX.Element} CategoryItem component.
 */
const CategoryItem = ({ name, count, onPress }) => {
  return (
    <TouchableHighlight
      onPress={onPress}
      underlayColor="#2E86C100"
      style={styles.categoryItem}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="pin-outline" size={30} color="#000" />
          <View style={{ marginLeft: 20 }}>
            <Text style={styles.categoryItemText}>{name}</Text>
            <Text>{count} places</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward-outline" size={30} color="#FFA500" />
      </View>
    </TouchableHighlight>
  );
};

/**
 * Main functional component for managing places categorized by location types.
 * @returns {JSX.Element} PlacesCategoryBookmark component.
 */
export default function PlacesCategoryBookmark() {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationMessage, setLocationMessage] = useState(null);
  const [locationType, setLocationType] = useState(null);
  const [location, setLocation] = useState(null);
  const [direction, setDirection] = useState(null);
  const { uid } = useAuth();

  /**
   * Fetches categories from Firestore and filters out empty categories.
   */
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const categoriesRef = collection(
        FIRESTORE_DB,
        "users",
        uid,
        "PersonalLocations",
        "PlacesBookmarks",
        "Categories"
      );
      const querySnapshot = await getDocs(categoriesRef);

      const deletionPromises = [];
      const categoriesVector = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const category = {
          name: doc.id,
          count: data.count,
          docRef: doc.ref // Add reference to the document
        };
        if (data.count === 0) {
          // Delete the category from Firestore
          deletionPromises.push(deleteDoc(doc.ref));
        }
        return category;
      });

      await Promise.all(deletionPromises);

      const filteredCategories = categoriesVector.filter(
        (category) => category.count > 0
      );

      setCategories(filteredCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  // Fetch categories on component focus
  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, [fetchCategories])
  );

  /**
   * Handles pressing of location type buttons (e.g., Home, Work).
   * @param {string} locationType - Type of location (e.g., "Home", "Work").
   */
  const handlePress = async (locationType) => {
    setLocationType(locationType);
    const userDocRef = doc(FIRESTORE_DB, "users", uid);
    const collectionRef = collection(userDocRef, "PersonalLocations");
    const querySnapshot = await getDocs(collectionRef);
    const categoriesData = querySnapshot.docs.map((doc) => doc.data());

    const locationExists = categoriesData.find(
      (data) => data.name === locationType
    );

    if (locationExists) {
      setLocationMessage(true);
      setLocation(locationExists.formatted_address);
    } else {
      setLocationMessage(true);
    }
  };

  /**
   * Handles pressing a category item to navigate to its bookmarks.
   * @param {string} categoryName - Name of the category.
   */
  const handleCategoryPress = (categoryName) => {
    navigation.navigate("CategoryBookmarks", { categoryName: categoryName });
  };

  /**
   * Handles saving the selected location to Firestore.
   */
  const handleSaveLocation = async () => {
    if (direction && locationType) {
      const userDocRef = doc(FIRESTORE_DB, "users", uid);
      const locationRef = doc(
        collection(userDocRef, "PersonalLocations"),
        locationType
      );

      await setDoc(locationRef, {
        name: locationType,
        coords: direction?.geometry.location,
        formatted_address: direction.formatted_address,
      });
      setLocationMessage(null);
      setDirection(null);
      ToastAndroid.show(locationType + " saved correctly", ToastAndroid.SHORT);
      fetchCategories(); // Refresh categories after saving location
    } else {
      ToastAndroid.show("Please select a location and type", ToastAndroid.SHORT);
    }
  };

  /**
   * Closes the location selection message.
   */
  const handleClose = () => {
    setLocationMessage(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#252525" }}>
      <View style={styles.homeContainer}>
        {/* Buttons for common location types */}
        <TouchableHighlight
          onPress={() => handlePress("Home")}
          underlayColor="#2E86C100"
          style={styles.topButton}
        >
          <View style={styles.topButtonContent}>
            <Ionicons name="home-outline" size={24} color="#000" />
            <Text style={styles.topButtonText}>Home</Text>
            <Ionicons name="chevron-forward" size={24} color="#FFA500" />
          </View>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={() => handlePress("Work")}
          underlayColor="#2E86C100"
          style={styles.topButton}
        >
          <View style={styles.topButtonContent}>
            <Ionicons name="storefront-outline" size={24} color="#000" />
            <Text style={styles.topButtonText}>Work</Text>
            <Ionicons name="chevron-forward" size={24} color="#FFA500" />
          </View>
        </TouchableHighlight>
      </View>

      {/* Location selection component */}
      {locationMessage && (
        <View style={styles.searchDirection}>
          <TouchableHighlight
            onPress={handleClose}
            style={{ top: 10, marginRight: 10 }}
            underlayColor="#25252500"
          >
            <Ionicons name="close" size={24} color="#808080" />
          </TouchableHighlight>
          <GooglePlacesAutocomplete
            enablePoweredByContainer={false}
            fetchDetails={true}
            placeholder={location || "Set direction..."}
            onPress={(data, details) => setDirection(details)}
            query={{
              key: "---",
              language: "es",
              components: "country:es",
            }}
            styles={{
              textInput: {
                backgroundColor: "#808080",
                fontSize: 15,
                color: "white",
              },
            }}
          />
          <TouchableHighlight
            onPress={handleSaveLocation}
            style={{ top: 10, marginLeft: 10 }}
            underlayColor="#25252500"
          >
            <Ionicons name="checkmark" size={24} color="#FFA500" />
          </TouchableHighlight>
        </View>
      )}

      {/* Horizontal line separator */}
      <View style={styles.horizontalLine} />

      {/* Header text */}
      <Text style={styles.headerText}>Category</Text>

      {/* Loading animation or category list */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <LottieView
            source={require("../../../../assets/animations/loading.json")}
            autoPlay
            loop
            style={styles.loadingAnimation}
          />
        </View>
      ) : categories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <LottieView
            source={require("../../../../assets/animations/empty.json")}
            autoPlay
            loop
            style={styles.emptyAnimation}
          />
          <Text style={styles.emptyText}>No categories available</Text>
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <CategoryItem
              name={item.name}
              count={item.count}
              onPress={() => handleCategoryPress(item.name)}
            />
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

// Styles for the component
const styles = StyleSheet.create({
  homeContainer: {
    flexDirection: "row",
  },
  topButton: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#808080",
    marginVertical: 20,
    marginHorizontal: 20,
    borderRadius: 6,
    paddingVertical: 10,
  },
  topButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  topButtonText: {
    color: "white",
    fontSize: 20,
    marginHorizontal: 20,
  },
  horizontalLine: {
    borderBottomColor: "#2E86C1",
    borderBottomWidth: 2,
    marginHorizontal: 75,
    marginBottom: 20,
  },
  headerText: {
    marginLeft: 20,
    color: "white",
    fontSize: 24,
  },
  categoryItem: {
    backgroundColor: "#808080",
    marginVertical: 10,
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 6,
    paddingHorizontal: 20,
  },
  categoryItemText: {
    color: "white",
    fontSize: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingAnimation: {
    width: 150,
    height: 150,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyAnimation: {
    width: "100%",
    height: "40%",
  },
  emptyText: {
    color: "white",
    fontSize: 18,
    marginTop: 20,
  },
  searchDirection: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
  },
});
