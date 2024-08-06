import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableHighlight, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import FavoriteItem from "./FavoriteItem";
import { FIRESTORE_DB } from "../../../../firebase-config";
import { collection, doc, getDocs, orderBy, query } from "firebase/firestore";
import { useAuth } from "../../../../AuthContext";
import LottieView from 'lottie-react-native';

/**
 * CategoryBookmarks component.
 * @returns {JSX.Element} JSX element representing the category bookmarks view.
 */
export default function CategoryBookmarks() {
  const navigation = useNavigation();
  const route = useRoute();
  const { categoryName } = route.params;
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { uid } = useAuth();

  // Callback para actualizar marcadores de categoría
  const updateCategoryBookmarks = useCallback(() => {
    fetchCategoryBookmarks(); // Refrescar marcadores de categoría después de cualquier cambio
  }, [fetchCategoryBookmarks]);

  /**
   * Effect hook to fetch bookmarks data from Firestore.
   */
  useEffect(() => {
    fetchCategoryBookmarks();
  }, [uid, categoryName, updateCategoryBookmarks]);

  /**
   * Fetches bookmarks data for the specified category from Firestore.
   */
  const fetchCategoryBookmarks = async () => {
    setLoading(true);
    try {
      const bookmarksCollectionRef = collection(
        FIRESTORE_DB,
        "users",
        uid,
        "PersonalLocations",
        "PlacesBookmarks",
        "Categories",
        categoryName,
        "data"
      );
      const queryRef = query(bookmarksCollectionRef, orderBy("name"));
      const querySnapshot = await getDocs(queryRef);
      const categoriesData = querySnapshot.docs.map(doc => doc.data());

      setFavoriteItems(categoriesData);
      console.log("Cojo: ", categoriesData)
    } catch (error) {
      console.error("Error fetching categories from Firebase:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles the navigation to the BookmarkView screen when an item is pressed.
   * @param {object} destination - Destination object containing bookmark details.
   */
  const handleItemPress = (destination) => {
    navigation.navigate("BookmarkView", { destination: { ...destination, categoryName: categoryName } });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableHighlight
            onPress={() => navigation.navigate("BookmarkPage")}
            underlayColor="#2E86C100"
          >
            <Ionicons name="arrow-back" size={26} color="#FFF" />
          </TouchableHighlight>
          <Text style={styles.headerText}>{categoryName}</Text>
          <TouchableHighlight
            onPress={() => navigation.navigate("NewBookmark")}
            underlayColor="#2E86C100"
          >
            <Ionicons name="add-circle-outline" size={26} color="#FFF" />
          </TouchableHighlight>
        </View>
      </View>
      <ScrollView style={styles.favoriteList}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
            <LottieView
              source={require("../../../../assets/animations/loading.json")}
              autoPlay
              loop
              style={styles.loadingAnimation}
            />
          </View>
        ) : favoriteItems.length === 0 ? (
          <View style={styles.emptyMessageContainer}>
            <Text style={styles.emptyMessage}>There are no bookmarks in this category</Text>
            <LottieView
              source={require("../../../../assets/animations/empty.json")}
              autoPlay
              loop
              style={styles.loadingAnimation}
            />
          </View>
        ) : (
          favoriteItems.map((item, index) => (
            <FavoriteItem
              key={index}
              name={item.name}
              image={item.image}
              onPress={() => handleItemPress(item)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#252525"
  },
  header: {
    backgroundColor: "#2E86C1",
    paddingTop: 85,
    paddingBottom: 50,
    alignItems: "center",
    justifyContent: "center"
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "85%"
  },
  headerText: {
    fontSize: 32,
    color: "white",
    fontWeight: "300"
  },
  favoriteList: {
    flex: 1,
    marginTop: 5
  },
  emptyMessageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyMessage: {
    color: "white",
    fontSize: 20,
    textAlign: "center",
    marginTop: 10
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  loadingText: {
    color: "white",
    fontSize: 20,
    textAlign: "center",
    marginTop: 10
  },
  loadingAnimation: {
    width: '75%',
    height: 500,
    alignSelf: "center",
  },
});
