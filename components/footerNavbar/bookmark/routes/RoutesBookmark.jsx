import React, { useEffect, useState } from "react";
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Image } from "react-native";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { FIRESTORE_DB } from "../../../../firebase-config";
import { useAuth } from "../../../../AuthContext";
import SearchBar from "../../../generalComponents/SearchBar";
import LottieView from 'lottie-react-native';
import { useNavigation } from "@react-navigation/native";

const GOOGLE_API_KEY = '---';

/**
 * Represents a single route item component displayed in the bookmarked routes list.
 * @component
 * @param {object} props - Props for the RouteItem component.
 * @param {string} props.hora - The formatted creation date of the route.
 * @param {object} props.coords - The coordinates of the first stop of the route.
 * @param {string} props.name - The name of the route.
 * @param {number} props.size - The number of stops in the route.
 * @param {function} props.onPress - Function to handle press events on the route item.
 * @returns {JSX.Element} A TouchableOpacity containing route information.
 */
const RouteItem = ({ hora, coords, name, size, onPress }) => {
  const [photoUrl, setPhotoUrl] = useState(null);

  useEffect(() => {
    // Fetch Google Street View image based on coordinates when component mounts
    setPhotoUrl(`https://maps.googleapis.com/maps/api/streetview?size=100x100&location=${coords.lat},${coords.lng}&key=${GOOGLE_API_KEY}`);
  }, []);

  return (
    <TouchableOpacity onPress={onPress} style={styles.routeItemContainer}>
      <View style={styles.routeInfo}>
        {photoUrl && <Image source={{ uri: photoUrl }} style={styles.image} />}
        <View style={styles.textContainer}>
          <Text style={styles.routeText}>{name}</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={[styles.routeText, { fontSize: 14 }]}>Saved {hora}</Text>
            <Text style={[styles.routeText, { fontSize: 14 }]}>{size} stops</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

/**
 * Component for displaying bookmarked routes with search and loading functionalities.
 * Fetches route data from Firestore based on user authentication.
 * @component
 * @returns {JSX.Element} A ScrollView containing a list of RouteItem components.
 */
export default function RoutesBookmark() {
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [loading, setLoading] = useState(true); // State to control loading state
  const { uid } = useAuth(); // Firebase Auth UID
  const navigation = useNavigation();

  useEffect(() => {
    /**
     * Fetches bookmarked routes from Firestore and updates state variables.
     */
    const fetchBookmarks = async () => {
      try {
        const bookmarksCollectionRef = collection(FIRESTORE_DB, "users", uid, "RouteBookmarks");
        const queryRef = query(bookmarksCollectionRef, orderBy("name"), limit(20));
        const querySnapshot = await getDocs(queryRef);
        const routesData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt.toDate().toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })
          };
        });

        setSavedRoutes(routesData);
        setFilteredRoutes(routesData);
      } catch (error) {
        console.error("Error fetching bookmarks from Firebase:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [uid]);

  /**
   * Handles search filtering based on route name.
   * Updates the filteredRoutes state with routes that match the search text.
   * @param {string} searchText - The text entered in the search bar.
   */
  const handleSearch = (searchText) => {
    const filteredRoutes = savedRoutes.filter(route =>
      route.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredRoutes(filteredRoutes);
  };

  /**
   * Navigates to the RouteView screen when a route item is pressed.
   * @param {object} route - The route object representing the selected route.
   */
  const handleRoutePress = (route) => {
    console.log("Selected route:", route);
    navigation.navigate("RouteView", { route: route });
  };

  return (
    <ScrollView style={{ backgroundColor: "#252525" }}>
      {/* Search bar component */}
      <SearchBar onSearch={handleSearch} />
      
      {/* Horizontal line */}
      <View style={styles.horizontalLine} />
      
      {/* Loading animation when data is being fetched */}
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
      ) : (
        // Display filtered routes
        filteredRoutes.map((route, index) => (
          <RouteItem
            key={index}
            hora={route.createdAt}
            coords={route.route[0].coords}
            name={route.name}
            size={route.route.length}
            onPress={() => handleRoutePress(route)}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  routeItemContainer: {
    backgroundColor: "#808080",
    marginVertical: 10,
    marginHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 6,
    paddingHorizontal: 10
  },
  routeInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  routeText: {
    color: 'white',
    fontSize: 20,
    marginVertical: "5%",
    fontWeight: "300"
  },
  image: {
    width: "25%",
    aspectRatio: 1,
    borderRadius: 15,
    margin: "1%",
    marginRight: "5%"
  },
  horizontalLine: {
    borderBottomColor: "#2E86C1",
    borderBottomWidth: 2,
    marginHorizontal: 75,
    marginBottom: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
