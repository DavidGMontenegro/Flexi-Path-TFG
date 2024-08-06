
import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Image, ToastAndroid, TouchableOpacity, TextInput } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { TouchableHighlight } from "react-native-gesture-handler";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import RouteManager from "../../../newRoute/RouteManager";
import { collection, deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { FIRESTORE_DB } from "../../../../firebase-config";
import { useAuth } from "../../../../AuthContext";
import * as Location from "expo-location";
import StyledTextInput from "../../../logIn/StyledTextInput";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import * as ImagePicker from "expo-image-picker";

/**
 * BookmarkView component.
 * @returns {JSX.Element} JSX element representing the bookmark view.
 */
const BookmarkView = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { destination } = route.params;
  const { uid } = useAuth();
  const [username, setUsername] = useState("");
  const [locationGranted, setLocationGranted] = useState(destination.username);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(null);
  const [showingCurrentLocation, setShowingCurrentLocation] = useState(false);
  const [editBookmark, setEditBookmark] = useState(false);
  const [newName, setNewName] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newPic, setNewPic] = useState(destination.image);
  const mapRef = useRef();

  /**
   * Effect hook to fetch user's location periodically if `showingCurrentLocation` is true.
   */
  useEffect(() => {
    let intervalId;
    if (showingCurrentLocation) {
      fetchUserLocation(uid, username.toLowerCase() || destination.username.toLowerCase(), setCurrentLocation, mapRef, setElapsedTime);
      
      intervalId = setInterval(() => {
        fetchUserLocation(uid, username.toLowerCase() || destination.username.toLowerCase(), setCurrentLocation, mapRef, setElapsedTime);
      }, 2000); // Interval of 2 seconds
    }
    return () => clearInterval(intervalId);
  }, [showingCurrentLocation]);

  /**
   * Fetches user's location from Firestore based on the provided username.
   * @param {string} uid - User's ID.
   * @param {string} username - Username for location lookup.
   * @param {function} setCurrentLocation - State setter for current location.
   * @param {object} mapRef - Reference to the MapView component.
   * @param {function} setElapsedTime - State setter for elapsed time.
   */
  const fetchUserLocation = async (uid, username, setCurrentLocation, mapRef, setElapsedTime) => {
    try {
      const userLocationRef = doc(FIRESTORE_DB, `users/${uid}/UsersLocationsGranted`, username);
      const userLocationDoc = await getDoc(userLocationRef);
      if (userLocationDoc.exists()) {
        const userUid = userLocationDoc.data().uid;
        const userCoordsRef = doc(FIRESTORE_DB, `users`, userUid);
        const userCoordsDoc = await getDoc(userCoordsRef);
        if (userCoordsDoc.exists()) {
          const coords = userCoordsDoc.data().currentLocation;
          setCurrentLocation({
            latitude: coords.lat,
            longitude: coords.lng,
            latitudeDelta: 0.0022,
            longitudeDelta: 0.0021,
          });
          mapRef.current.animateToRegion({
            latitude: coords.lat,
            longitude: coords.lng,
            latitudeDelta: 0.0022,
            longitudeDelta: 0.0021,
          }, 1500);
          calculateTimeElapsed(userCoordsDoc.data().timeStamp, setElapsedTime);
        }
      }
    } catch (error) {
      console.error("Error fetching user location:", error);
    }
  };

  /**
   * Handles the removal of the bookmark from Firestore.
   */
  const handleRemoveBookmark = async () => {
    try {
      const bookmarkRef = doc(FIRESTORE_DB, "users", uid, "PersonalLocations", "PlacesBookmarks", "Categories", destination.categoryName, "data", destination.name);
      await deleteDoc(bookmarkRef);

      // Decrement the `count` in the category
      const categoryDocRef = doc(collection(FIRESTORE_DB, "users", uid, "PersonalLocations", "PlacesBookmarks", "Categories"), destination.categoryName);
      const categoryDocSnapshot = await getDoc(categoryDocRef);

      if (categoryDocSnapshot.exists()) {
        const currentCount = categoryDocSnapshot.data().count || 0;
        const updatedCount = currentCount - 1;

        await setDoc(categoryDocRef, { count: updatedCount }, { merge: true });
      } else {
        // Handle case if category document does not exist (throw error or create document based on business logic)
        throw new Error(`Category '${category}' does not exist.`);
      }

      console.log("Bookmark deleted:", destination.name);
      ToastAndroid.show("Bookmark deleted correctly", ToastAndroid.SHORT);
      navigation.navigate("BookmarkPage");
    } catch (error) {
      console.error("Error deleting bookmark:", error);
    }
  };

  /**
   * Handles the saving of edited bookmark data to Firestore.
   */
  const handleSaveEdit = async () => {
    try {
      const bookmarkRef = doc(
        FIRESTORE_DB,
        "users",
        uid,
        "PersonalLocations",
        "PlacesBookmarks",
        "Categories",
        destination.categoryName,
        "data",
        destination.name
      );

      const updatedData = {};
      if (newName) updatedData.name = newName;
      if (newLocation) {
        updatedData.coords = {
          lat: newLocation.geometry.location.lat,
          lng: newLocation.geometry.location.lng,
        };
        updatedData.formatted_address = newLocation.formatted_address;
      }
      if (newPic) updatedData.image = newPic;

      await setDoc(bookmarkRef, updatedData, { merge: true });

      ToastAndroid.show("Bookmark edited correctly", ToastAndroid.SHORT);
    } catch (error) {
      console.error("Error editing bookmark:", error);
    }
  };

  /**
   * Toggles the edit state of the bookmark.
   */
  const handleEditBookmark = () => {
    if (editBookmark) {
      handleSaveEdit();
      setEditBookmark(false);
    } else {
      setEditBookmark(true);
    }
  };

  /**
   * Adds the bookmarked location to the route manager and navigates to the Home screen.
   */
  const handleAddToRoute = () => {
    RouteManager.addDestination({
      name: destination.name,
      direction: destination.direction,
    });
    navigation.navigate("Home");
  };

  /**
   * Calculates the elapsed time since the specified timestamp.
   * @param {object} locationTimeStamp - Timestamp of the location.
   */
  const calculateTimeElapsed = (locationTimeStamp) => {
    try {
      const nowInSeconds = Math.floor(Date.now() / 1000);
      const timeStampInSeconds = Math.floor(locationTimeStamp.seconds);
      const differenceSeconds = nowInSeconds - timeStampInSeconds;

      const hours = Math.floor(differenceSeconds / 3600);
      const minutes = Math.floor((differenceSeconds % 3600) / 60);
      const seconds = differenceSeconds % 60;

      let elapsedTimeText = '';
      if (hours > 0) {
        elapsedTimeText += `${hours}h `;
      }
      if (minutes > 0) {
        elapsedTimeText += `${minutes}m `;
      }
      elapsedTimeText += `${seconds}s`;

      setElapsedTime(elapsedTimeText);
    } catch (error) {
      console.error("Error calculating time elapsed:", error);
      return "Error";
    }
  };

  /**
   * Handles toggling the visibility of the current location on the map.
   */
  const handleSeeUserLocation = async () => {
    if (showingCurrentLocation) {
      setCurrentLocation({
        latitude: destination.coords.lat,
        longitude: destination.coords.lng,
        latitudeDelta: 0.0022,
        longitudeDelta: 0.0021,
      });
      mapRef.current.animateToRegion(
        {
          latitude: destination.coords.lat,
          longitude: destination.coords.lng,
          latitudeDelta: 0.0022,
          longitudeDelta: 0.0021,
        },
        1500
      );
      setShowingCurrentLocation(false);
      return;
    }
      
    setShowingCurrentLocation(true)
  };

  /**
   * Saves the username associated with the bookmark to Firestore.
   */
  const handleSaveUsername = async () => {
    try {
      const bookmarksCollectionRef = doc(FIRESTORE_DB, "users", uid, "PersonalLocations", "PlacesBookmarks", "Categories", destination.categoryName, "data", destination.name);
      await setDoc(bookmarksCollectionRef, { username: username.toLowerCase() }, { merge: true });
      const userLocationRef = doc(FIRESTORE_DB, `users/${uid}/UsersLocationsGranted`, username.toLowerCase());
      const userLocationDoc = await getDoc(userLocationRef);
      
      if (userLocationDoc.exists()) {
        setLocationGranted(true);
        ToastAndroid.show("Username associated correctly", ToastAndroid.SHORT);
      } else {
        ToastAndroid.show("No permission. Send a location request.", ToastAndroid.SHORT);
      }

      console.log("Username saved:", username);
    } catch (error) {
      console.error("Error saving username:", error);
    }
  };

  /**
   * Allows the user to pick an image from the device's gallery and sets it as the bookmark image.
   */
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setNewPic(result.assets[0].uri);
    }
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
          <View style={{flexDirection: "column", alignItems: "center"}}>
            {
              editBookmark ? 
              (
                <>
                  <StyledTextInput
                    style={{ width: 200, fontSize: 20, backgroundColor: "#CACACA" }}
                    placeholder={destination.name}
                    onChangeText={(name) => setNewName(name)}
                  />
                </>
              ):
              (
                <>
                  <Text style={styles.headerText}>{destination.name}</Text>
                  {(destination.name || username) && (
                    <Text style={{ color: "white" }}>
                      {username ? username : destination.username}
                    </Text>
                  )}
                </>
              )
            }
            
          </View>
          
          <View style={{ width: 26 }} />
        </View>
      </View>
      <View style={styles.dataContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: destination.coords.lat,
            longitude: destination.coords.lng,
            latitudeDelta: 0.00922,
            longitudeDelta: 0.00421,
          }}
        >
          <Marker
            coordinate={currentLocation ? currentLocation : {
              latitude: destination.coords.lat,
              longitude: destination.coords.lng,
            }}
            title={showingCurrentLocation ? elapsedTime + " ago": destination.name}
          />
        </MapView>
        {
          locationGranted ? 
          (
            <TouchableHighlight
              onPress={handleSeeUserLocation}
              underlayColor="#2E86C100"
              style={{ backgroundColor: "#2E86C1", marginTop: "2%", borderRadius: 5, paddingVertical: 5, paddingHorizontal: 10 }}
            >
              <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-evenly"}}>
                <Ionicons name="locate-outline" size={20} color="#252525" />
                <Text style={{color: "white", marginLeft: "5%"}}>Show {showingCurrentLocation ? "saved" : "current"} location</Text>
              </View>
            </TouchableHighlight>
          ):
          (
            <View style={styles.usernameInput}>
              <TextInput
                placeholder="Link with username..."
                value={username}
                onChangeText={setUsername}
                style={styles.input}
              />
              <TouchableOpacity
                onPress={handleSaveUsername}
              >
                <Ionicons
                  name="checkmark"
                  size={24}
                  color="#FFA500"
                />
              </TouchableOpacity>
            </View>
          )
        }
        <View style={styles.bookmarkInfo}>
          {
            editBookmark ? 
            (
              <TouchableHighlight
              onPress={pickImage}
              underlayColor="#2E86C100"
              style={{
                backgroundColor: "#808080",
                aspectRatio: 1,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 10,
              }}
            >
              <View style={{ justifyContent: "center", alignItems: "center" }}>
                {newPic ? (
                  <Image source={{ uri: newPic }} style={styles.image} />
                ) : (
                  <>
                    <Ionicons name="document-outline" size={50} color="#FFF" />
                    <Text style={{ fontSize: 16, marginTop: 20 }}>
                      Upload image ...
                    </Text>
                  </>
                )}
              </View>
            </TouchableHighlight>
            ):
            (
              <>
              {destination.image ? (
                <>
                  <Image source={{ uri: destination.image }} style={styles.image} />
                </>
              ) : (
                <>
                  <Ionicons
                    name="people-circle-outline"
                    size={50}
                    color="#1F1F1F"
                  />
                </>
              )}
              </>
            )
          }
          
          {
            editBookmark ? (
                  <GooglePlacesAutocomplete
                  enablePoweredByContainer={false}
                  fetchDetails={true}
                  placeholder={destination.formatted_address}
                  onPress={(data, details) => setNewLocation(details)}
                  query={{
                    key: "---",
                    language: "es",
                    components: "country:es",
                  }}
                  styles={{
                    textInput: {
                      backgroundColor: "#CACACA",
                      fontSize: 14,
                      color: "white",
                      marginHorizontal: 10
                    },
                  }}
                />
            ):
            (
              <Text style={styles.formattedAddress}>
                {destination.formatted_address}
              </Text>
            )
          }
          
        </View>

        <View style={styles.buttonContainer}>
          {
            !editBookmark &&
            <TouchableHighlight
              onPress={handleRemoveBookmark}
              underlayColor="#2E86C100"
              style={{ marginHorizontal: 10 }}
            >
              <Ionicons name="trash-outline" size={26} color="#2E86C1" />
            </TouchableHighlight>
          }
          
          <TouchableHighlight
            onPress={handleEditBookmark}
            underlayColor="#2E86C100"
            style={editBookmark ? { marginHorizontal: 10, backgroundColor: '#FFA500', borderRadius: 5, padding: 2.5} : { marginHorizontal: 10 }}

          >
            <Ionicons name={editBookmark ? "checkmark-outline" : "create-outline"} size={26} color={editBookmark ? "#252525" : "#2E86C1"} />
          </TouchableHighlight>
          {
            !editBookmark &&
            <TouchableHighlight
              onPress={handleAddToRoute}
              underlayColor="#2E86C100"
              style={{
                backgroundColor: "#FFA500",
                paddingHorizontal: 15,
                paddingVertical: 5,
                borderRadius: 10,
                marginHorizontal: 10,
              }}
            >
              <Text style={{ color: "white", fontSize: 16 }}>Go there!</Text>
            </TouchableHighlight>
          }
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#252525",
  },
  header: {
    backgroundColor: "#2E86C1",
    paddingTop: 60,
    paddingBottom: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "85%",
  },
  headerText: {
    fontSize: 32,
    color: "white",
    fontWeight: "300",
  },
  dataContainer: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    paddingHorizontal: "5%",
    paddingVertical: "5%",
  },
  map: {
    height: "65%",
    width: "100%",
    borderRadius: 10
  },
  bookmarkInfo: {
    borderRadius: 15,
    backgroundColor: "#808080",
    flexDirection: "row",
    marginVertical: "5%",
    width: "100%",
    height: "18%",
    alignItems: "center",
  },
  image: {
    borderRadius: 15,
    height: "100%",
    aspectRatio: 1,
  },
  formattedAddress: {
    marginHorizontal: 10,
    fontSize: 16,
    color: "white",
    flexWrap: "wrap",
    flex: 1,
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: "5%",
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  usernameInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "75%",
    backgroundColor: "#808080",
    marginTop: "2.5%",
    borderRadius: 5,
    paddingRight: 10,
  },
  input: {
    width: "90%",
    paddingVertical: 5,
    paddingHorizontal: 10,
  }
});

export default BookmarkView;
