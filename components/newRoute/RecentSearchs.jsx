import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableHighlight } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { useAuth } from "../../AuthContext";
import { FIRESTORE_DB } from "../../firebase-config";

/**
 * Component for displaying recent searches.
 * @component
 * @param {Object} props - Component props.
 * @param {function} props.onDestinationSelected - Callback to handle destination selection.
 * @returns {JSX.Element}
 */
const RecentSearchs = ({ onDestinationSelected }) => {
  const [searches, setSearches] = useState([]);
  const { uid } = useAuth();

  useEffect(() => {
    /**
     * Fetches search history from Firestore.
     * @async
     */
    const fetchSearchHistory = async () => {
      if (!uid) return; // If the user is not logged in, do not proceed with the query

      const bookmarksCollectionRef = collection(
        FIRESTORE_DB,
        "users",
        uid,
        "SearchHistory"
      );

      try {
        // Fetch current search history ordered by timestamp descending
        const searchHistorySnapshot = await getDocs(
          query(bookmarksCollectionRef, orderBy("timestamp", "desc"))
        );

        // Map documents and extract data
        const searchHistoryData = searchHistorySnapshot.docs.map((doc) => doc.data());

        // Set mapped data to state
        setSearches(searchHistoryData);
      } catch (error) {
        console.error('Error fetching search history:', error);
      }
    };

    fetchSearchHistory();
  }, [uid]);

  /**
   * Handles press event on a search item.
   * @param {Object} search - The search item.
   */
  const handlePress = (search) => {
    onDestinationSelected({ destination: search, type: null });
  };

  return (
    <View style={styles.mainContainer}>
      {searches.map((search, index) => (
        <TouchableHighlight key={index} underlayColor="#2E86C100" onPress={() => handlePress(search)}>
          <View>
            <View style={styles.container}>
              <View style={styles.leftContainer}>
                <Ionicons name="location-outline" size={18} color="#808080" />
                <Text style={styles.text}>{search.name}</Text>
              </View>
              <Ionicons name="add-circle-outline" size={16} color="#FFA500" />
            </View>
            <View style={styles.horizontalLine} />
          </View>
        </TouchableHighlight>
      ))}
    </View>
  );
};

/**
 * Styles for RecentSearchs component.
 */
const styles = StyleSheet.create({
  mainContainer: {
    marginHorizontal: 20,
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    marginLeft: 5,
    color: "#FFF",
    fontSize: 15,
  },
  horizontalLine: {
    borderBottomColor: "#808080",
    borderBottomWidth: 1,
    alignSelf: "center",
    width: "75%",
  },
});

export default RecentSearchs;
