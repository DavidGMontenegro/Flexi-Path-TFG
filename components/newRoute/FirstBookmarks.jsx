import React, { useEffect, useState } from "react";
import { View, Text, TouchableHighlight, Image, StyleSheet } from "react-native";
import { FIRESTORE_DB } from "../../firebase-config";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { useAuth } from "../../AuthContext";
import { Ionicons } from "@expo/vector-icons";

/**
 * Component for rendering each individual bookmark item.
 * @component
 * @param {Object} props - Component props.
 * @param {string} props.name - The name of the bookmark.
 * @param {string} props.image - The URL of the image for the bookmark.
 * @param {Function} props.onPress - Function to handle press event.
 * @returns {JSX.Element}
 */
const FirstBookmarks = ({ name, image, onPress }) => {
  return (
    <TouchableHighlight
      underlayColor="#FFF00"
      style={styles.favoriteItem}
      onPress={onPress}
    >
      <View style={styles.favoriteItemContent}>
        {image ? (
          <Image source={{ uri: image }} style={styles.favoriteImage} />
        ) : (
          <Ionicons name="people-circle-outline" size={50} color="#1F1F1F" />
        )}
        <Text style={styles.favoriteItemText}>{name}</Text>
        <Text style={{ color: "#FFA500", fontSize: 12 }}>Add</Text>
      </View>
    </TouchableHighlight>
  );
};

/**
 * Component for displaying the first bookmarks categorized into Family and Friends.
 * Fetches data from Firestore based on user's UID.
 * @component
 * @param {Object} props - Component props.
 * @param {Function} props.onDestinationSelected - Function to handle destination selection.
 * @returns {JSX.Element}
 */
const FirstBookmarksView = ({ onDestinationSelected }) => {
  const { uid } = useAuth();
  const [familyBookmarks, setFamilyBookmarks] = useState([]);
  const [friendsBookmarks, setFriendsBookmarks] = useState([]);

  useEffect(() => {
    /**
     * Fetches categories and their respective bookmarks from Firestore.
     * @async
     */
    const fetchCategories = async () => {
      try {
        const categoriesRef = collection(FIRESTORE_DB, "users", uid, "PersonalLocations", "PlacesBookmarks", "Categories");
        const querySnapshot = await getDocs(categoriesRef);
        const categoriesVector = querySnapshot.docs.map(doc => doc.id);

        if (categoriesVector.length > 0) {
          const firstCategoryRef = collection(FIRESTORE_DB, "users", uid, "PersonalLocations", "PlacesBookmarks", "Categories", categoriesVector[0], "data");
          const queryRef = query(firstCategoryRef, orderBy("name"), limit(4));
          const categorySnapshot = await getDocs(queryRef);
          const firstFourFamilyBookmarks = categorySnapshot.docs.map(doc => doc.data());
          setFamilyBookmarks(firstFourFamilyBookmarks);
        }

        if (categoriesVector.length > 1) {
          const secondCategoryRef = collection(FIRESTORE_DB, "users", uid, "PersonalLocations", "PlacesBookmarks", "Categories", categoriesVector[1], "data");
          const queryRef = query(secondCategoryRef, orderBy("name"), limit(4));
          const categorySnapshot = await getDocs(queryRef);
          const firstFourFriendsBookmarks = categorySnapshot.docs.map(doc => doc.data());
          setFriendsBookmarks(firstFourFriendsBookmarks);
        }
      } catch (error) {
        console.error("Error fetching categories from Firebase:", error);
      }
    };

    fetchCategories();
  }, [uid]);

  return (
    <>
      <View style={styles.groupContainer}>
        {familyBookmarks.map((bookmark, index) => (
          <FirstBookmarks
            key={index}
            name={bookmark.name}
            image={bookmark.image}
            onPress={() => onDestinationSelected({ destination: bookmark, type: "Family" })}
          />
        ))}
      </View>
      <View style={styles.groupContainer}>
        {friendsBookmarks.map((bookmark, index) => (
          <FirstBookmarks
            key={index}
            name={bookmark.name}
            image={bookmark.image}
            onPress={() => onDestinationSelected({ destination: bookmark, type: "Friends" })}
          />
        ))}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  favoriteItem: {
    width: "20%",
    backgroundColor: "#808080",
    marginTop: 10,
    paddingVertical: 7,
    borderRadius: 6,
  },
  favoriteItemContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteItemText: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
  },
  favoriteImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
  },
  groupContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 10,
    width: "100%",
  },
});

export default FirstBookmarksView;
