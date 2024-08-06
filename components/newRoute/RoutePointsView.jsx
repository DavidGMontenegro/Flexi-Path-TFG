import React, { useState } from "react";
import { StyleSheet, View, Text, TextInput, TouchableHighlight, FlatList, ToastAndroid } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import RouteManager from "./RouteManager";
import ChooseTransport from "./ChooseTransport";
import LottieView from 'lottie-react-native';
import { FIRESTORE_DB } from "../../firebase-config";
import { collection, doc, setDoc, getDocs } from "firebase/firestore";
import { useAuth } from "../../AuthContext";

/**
 * Component for displaying and managing route points.
 * @component RoutePointsView
 * @param {Object} props - Component props.
 * @param {function} props.navigation - Navigation function.
 * @param {function} props.onAddNewStop - Callback to handle adding a new stop.
 * @param {function} props.onRouteOptimized - Callback to handle route optimization.
 * @returns {JSX.Element} RoutePointsView component
 */
const RoutePointsView = ({ navigation, onAddNewStop, onRouteOptimized }) => {
  const [route, setRoute] = useState(RouteManager.route); // State for managing route points
  const { uid } = useAuth(); // Fetches authenticated user's UID
  const [showChooseTransport, setShowChooseTransport] = useState(false); // State for showing transport options
  const [loading, setLoading] = useState(false); // State for loading animation
  const [transportMethod, setTransportMethod] = useState("random"); // State for selected transport method
  const [optimizationMode, setOptimizationMode] = useState("time"); // State for optimization mode
  const [saveBookmark, setSaveBookmark] = useState(false); // State for bookmark saving
  const [bookmarkName, setBookmarkName] = useState(""); // State for bookmark name input

  /**
   * Handles saving the current route as a bookmark.
   * @async
   * @method
   */
  const handleSaveRoute = async () => {
    if (saveBookmark) {
      const name = bookmarkName.trim();
      if (name.length < 1 || name.length > 16) {
        ToastAndroid.show("Bookmark name must be between 1 and 16 characters", ToastAndroid.SHORT);
        return;
      }

      try {
        const bookmarksCollectionRef = collection(FIRESTORE_DB, "users", uid, "RouteBookmarks");
        const querySnapshot = await getDocs(bookmarksCollectionRef);
        const existingNames = querySnapshot.docs.map(doc => doc.id);

        if (existingNames.includes(name)) {
          ToastAndroid.show("A bookmark with this name already exists", ToastAndroid.SHORT);
          return;
        }

        const newBookmarkDocRef = doc(bookmarksCollectionRef, name);

        await setDoc(newBookmarkDocRef, {
          name: name,
          route: route,
          createdAt: new Date(),
        });

        ToastAndroid.show(`${name} saved successfully!`, ToastAndroid.SHORT);
        console.log("Route saved successfully!");
      } catch (error) {
        console.error("Error saving route:", error);
      }
    }

    setSaveBookmark(!saveBookmark);
  };

  /**
   * Handles route optimization.
   * @async
   * @method
   */
  const handleOptimizeRoute = async () => {
    setLoading(true);
    await RouteManager.optimizeRoute(transportMethod, optimizationMode); // Optimizes route using RouteManager
    setLoading(false);
    onRouteOptimized(); // Calls parent callback function after optimization
  };

  /**
   * Handles removing an item from the route.
   * @param {number} index - Index of the item to remove.
   * @method
   */
  const handleRemoveItem = (index) => {
    RouteManager.removeDestination(index); // Removes destination from RouteManager
    const updatedRoute = route.filter((item, i) => i !== index); // Updates route state
    setRoute(updatedRoute);
  };

  /**
   * Handles changing the bookmark name.
   * @param {string} text - New bookmark name.
   * @method
   */
  const handleBookmarkNameChange = (text) => {
    setBookmarkName(text);
  };

  /**
   * Renders a route item.
   * @param {Object} param0 - Object containing item and index.
   * @param {Object} param0.item - Route item.
   * @param {number} param0.index - Index of the item.
   * @returns {JSX.Element} Route item component
   * @method
   */
  const renderItem = ({ item, index }) => (
    <View style={styles.destinationItem}>
      <View style={styles.destination}>
        <Text style={styles.destinationIndex}>{index + 1}</Text>
        <Ionicons name="location-outline" size={26} color="white" />
        <View style={styles.destinationInfo}>
          <Text style={styles.destinationName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.destinationDetails} numberOfLines={1}>{item.direction}</Text>
        </View>
      </View>
      <TouchableHighlight onPress={() => handleRemoveItem(index)} underlayColor="transparent">
        <Ionicons name="close-circle" size={22} color="#2E86C1" />
      </TouchableHighlight>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <LottieView
            source={require("../../assets/animations/routeLoading.json")}
            autoPlay
            loop
            style={styles.loadingAnimation}
          />
          <Text style={{ color: "white", fontSize: 18, fontWeight: "300" }}>Calculating the best route...</Text>
        </View>
      ) : (
        <> 
          <TouchableHighlight onPress={onAddNewStop} underlayColor="transparent" style={styles.newStop}>
            <View style={styles.newStopContent}>
              <Ionicons name="add-outline" size={18} color="white" />
              <Text style={styles.newStopText}>Add new stop</Text>
            </View>
          </TouchableHighlight>
          <FlatList
            data={route}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            style={styles.flatList}
            contentContainerStyle={styles.flatListContent}
          />
          <View style={styles.horizontalLine}></View>
          {showChooseTransport ? (
            <ChooseTransport onGoBack={() => setShowChooseTransport(false)} />
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableHighlight onPress={() => setShowChooseTransport(true)} underlayColor="transparent">
                <Ionicons name="ellipsis-horizontal" size={22} color="#2E86C1" />
              </TouchableHighlight>
              {saveBookmark ? ( 
                <View style={styles.bookmarkContainer}>
                  <TextInput
                    style={styles.bookmarkInput}
                    placeholder="Enter bookmark name"
                    placeholderTextColor="#888"
                    value={bookmarkName}
                    onChangeText={handleBookmarkNameChange}
                  />
                  <TouchableHighlight onPress={() => setSaveBookmark(false)} underlayColor="transparent">
                    <Ionicons name="close" size={22} color="#2E86C1" />
                  </TouchableHighlight>
                </View>
              ) : (
                <TouchableHighlight onPress={handleOptimizeRoute} underlayColor="transparent" style={styles.optimizeButton}>
                  <Text style={styles.optimizeButtonText}>Optimize Route</Text>
                </TouchableHighlight>
              )}
              <TouchableHighlight onPress={handleSaveRoute} underlayColor="transparent">
                <Ionicons name={saveBookmark ? "checkmark" : "bookmark-outline"} size={22} color={saveBookmark ? "#FFA500" : "#2E86C1"} />
              </TouchableHighlight>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    marginTop: 10,
  },
  newStop: {
    backgroundColor: "#808080",
    width: "70%",
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  newStopContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  newStopText: {
    color: "white",
    fontSize: 18,
    fontWeight: "300",
    marginLeft: 5,
  },
  flatList: {
    flex: 1,
    width: "100%",
    paddingHorizontal: "10%",
  },
  flatListContent: {
    flexGrow: 1,
  },
  destinationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
  },
  destination: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    maxWidth: "80%",
  },
  destinationIndex: {
    color: "white",
    marginRight: 5,
  },
  destinationInfo: {
    marginLeft: 10,
    flexShrink: 1,
  },
  destinationName: {
    fontSize: 18,
    color: "white",
    fontWeight: "300",
  },
  destinationDetails: {
    fontSize: 14,
    color: "#666666",
  },
  horizontalLine: {
    borderBottomColor: "#808080",
    borderBottomWidth: 1,
    marginVertical: 20,
    width: "90%",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginBottom: 20,
    alignItems: "center",
  },
  optimizeButton: {
    backgroundColor: "#FFA500",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  optimizeButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "300",
  },
  loadingAnimation: {
    width: 300,
    height: 300,
    alignSelf: "center",
  },
  bookmarkContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 8,
    width: "70%",
    paddingRight: "2%"
  },
  bookmarkInput: {
    flex: 1,
    height: 40,
    borderColor: "#fff",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    color: "#000",
  },
});

export default RoutePointsView;
