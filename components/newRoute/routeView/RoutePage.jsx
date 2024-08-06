import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import * as Location from "expo-location";
import RouteManager from "../RouteManager";
import LottieView from "lottie-react-native";
import { FIRESTORE_DB } from "../../../firebase-config";
import { useAuth } from "../../../AuthContext";
import { collection, doc, getDoc, setDoc, updateDoc, addDoc } from "firebase/firestore";

/**
 * Custom marker component for displaying markers on the map.
 * @param {object} props - Component props
 * @param {number} props.index - Marker index
 * @param {boolean} props.isVisited - Flag indicating if marker is visited
 * @param {boolean} props.isCurrent - Flag indicating if marker is current destination
 * @returns {JSX.Element} - Custom marker component
 */
const CustomMarker = ({ index, isVisited, isCurrent }) => {
  let markerStyle = styles.marker;

  if (isVisited) {
    markerStyle = styles.visitedMarker;
  } else if (isCurrent) {
    markerStyle = styles.currentMarker;
  }

  return (
    <View style={markerStyle}>
      <Text style={styles.markerText}>{index + 1}</Text>
    </View>
  );
};

/**
 * Component for displaying and managing the route map and directions.
 * @component
 * @returns {JSX.Element} - RoutePage component
 */
const RoutePage = () => {
  const [initialRegion, setInitialRegion] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [routeCompleted, setRouteCompleted] = useState(false);
  const [formattedRouteTime, setFormattedRouteTime] = useState("");
  const { uid } = useAuth();
  const GOOGLE_MAPS_API_KEY = "---";
  const mapViewRef = useRef(null);

  // Effect to calculate map bounds based on route and update initial region
  useEffect(() => {
    const calculateBounds = () => {
      if (RouteManager.optimizedRoute.length > 0) {
        let minLat = RouteManager.optimizedRoute[0].coords.lat;
        let maxLat = RouteManager.optimizedRoute[0].coords.lat;
        let minLng = RouteManager.optimizedRoute[0].coords.lng;
        let maxLng = RouteManager.optimizedRoute[0].coords.lng;

        RouteManager.optimizedRoute.forEach((destination) => {
          minLat = Math.min(minLat, destination.coords.lat);
          maxLat = Math.max(maxLat, destination.coords.lat);
          minLng = Math.min(minLng, destination.coords.lng);
          maxLng = Math.max(maxLng, destination.coords.lng);
        });

        const centerLat = (maxLat + minLat) / 2;
        const centerLng = (maxLng + minLng) / 2;
        const latDelta = maxLat - minLat;
        const lngDelta = maxLng - minLng;

        setInitialRegion({
          latitude: centerLat,
          longitude: centerLng,
          latitudeDelta: latDelta * 1.2,
          longitudeDelta: lngDelta * 1.2,
        });
      }
    };

    calculateBounds();

    // Request location permissions and update user's current location
    const updateLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (location) => {
          setCurrentLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      );
    };

    updateLocation();

    return () => {
      RouteManager.optimizedRoute = [];
    };
  }, []);

  // Effect to check proximity to the next destination and update current destination
  useEffect(() => {
    const checkProximity = async () => {
      if (!routeCompleted && currentLocation && RouteManager.optimizedRoute.length > 0) {
        const destination = RouteManager.optimizedRoute[RouteManager.currentDestination];
        const distanceData = await RouteManager.getDistance(
          { lat: currentLocation.latitude, lng: currentLocation.longitude },
          { lat: destination.coords.lat, lng: destination.coords.lng },
          RouteManager.optimizedRouteMethod[RouteManager.currentDestination]
        );
        console.log("Distance:", distanceData?.distanceValue);
        if (distanceData && distanceData.distanceValue < 75) {
          const nextDestinationIndex = Math.min(
            RouteManager.currentDestination + 1,
            RouteManager.optimizedRoute.length
          );
          if (nextDestinationIndex === RouteManager.optimizedRoute.length) {
            handleLastDestination();
          }
          RouteManager.currentDestination = nextDestinationIndex;
        }
      }
    };

    if (RouteManager.routeStarted) {
      if (mapViewRef.current) {
        mapViewRef.current.animateToRegion({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
      }
    }

    checkProximity();
  }, [currentLocation]);

  // Function to handle actions upon reaching the last destination
  const handleLastDestination = async () => {
    setRouteCompleted(true);
    RouteManager.routeStarted = false;
    try {
      const today = new Date();
      const dateId = today.toISOString().split("T")[0];

      const bookmarksCollectionRef = collection(FIRESTORE_DB, "users", uid, "RouteStats");
      const docRef = doc(bookmarksCollectionRef, dateId);
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        await updateDoc(docRef, {
          totalDistance: data.totalDistance + RouteManager.totalDistance / 1000,
          totalTime: data.totalTime + RouteManager.totalTime,
          routesCompleted: data.routesCompleted + 1,
        });
      } else {
        await setDoc(docRef, {
          totalDistance: RouteManager.totalDistance / 1000,
          totalTime: RouteManager.totalTime,
          routesCompleted: 1,
        });
      }

      const routeHistoryRef = collection(FIRESTORE_DB, "users", uid, "RouteHistory");
      await addDoc(routeHistoryRef, {
        date: today,
        distance: RouteManager.totalDistance / 1000,
        time: RouteManager.totalTime,
        route: RouteManager.optimizedRoute.map((destination, index) => ({
          index,
          name: destination.name,
          direction: destination.direction,
          coords: destination.coords,
        })),
      });

      console.log("Route stats and history saved successfully!");

      // Format time in hours and minutes
      const hours = Math.floor(RouteManager.totalTime / 3600);
      const minutes = Math.floor((RouteManager.totalTime % 3600) / 60);
      const formattedTime = hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
      setFormattedRouteTime(formattedTime);

    } catch (error) {
      console.error("Error saving route:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainerFull}>
        {initialRegion && (
          <MapView
            ref={mapViewRef}
            style={styles.map}
            initialRegion={initialRegion}
            provider="google"
            showsUserLocation={true}
            showsMyLocationButton={false}
            followsUserLocation={true}
          >
            {/* Render markers for each destination */}
            {RouteManager.optimizedRoute
              .slice()
              .reverse()
              .map((destination, index) => (
                <Marker
                  key={index}
                  coordinate={{
                    latitude: destination.coords.lat,
                    longitude: destination.coords.lng,
                  }}
                  title={destination.name}
                  description={destination.direction}
                >
                  <CustomMarker
                    index={RouteManager.optimizedRoute.length - 1 - index}
                    isVisited={
                      RouteManager.optimizedRoute.length - 1 - index <
                      RouteManager.currentDestination
                    }
                    isCurrent={
                      RouteManager.optimizedRoute.length - 1 - index ===
                      RouteManager.currentDestination
                    }
                  />
                </Marker>
              ))}
            {/* Render directions between each destination */}
            {RouteManager.optimizedRoute
              .slice()
              .reverse()
              .map((destination, index) => {
                if (index > 0) {
                  const origin = {
                    latitude: RouteManager.optimizedRoute[index - 1].coords.lat,
                    longitude:
                      RouteManager.optimizedRoute[index - 1].coords.lng,
                  };
                  const destinationCoords = {
                    latitude: RouteManager.optimizedRoute[index].coords.lat,
                    longitude: RouteManager.optimizedRoute[index].coords.lng,
                  };
                  const strokeColor =
                    index === RouteManager.currentDestination ||
                    index === RouteManager.currentDestination
                      ? "#FFA500"
                      : "#2E86C1";
                  const mode = RouteManager.optimizedRouteMethod[index].toUpperCase();
                  return (
                    <MapViewDirections
                      key={index}
                      origin={origin}
                      destination={destinationCoords}
                      apikey={GOOGLE_MAPS_API_KEY}
                      strokeWidth={3}
                      strokeColor={strokeColor}
                      precision="high"
                      mode={mode}
                    />
                  );
                }
              })}
          </MapView>
        )}
        {/* Display route completed information */}
        {routeCompleted && (
          <View style={styles.infoContainer}>
            <LottieView
              source={require("../../../assets/animations/finished.json")}
              autoPlay
              style={styles.loadingAnimation}
            />
            <Text style={[styles.infoText, { color: "#FFA500" }]}>
              ¡Ruta completada!
            </Text>
            <View
              style={{
                flexDirection: "row",
                width: "80%",
                justifyContent: "space-between",
              }}
            >
              <Text style={styles.infoText}>
                {(RouteManager.totalDistance / 1000).toFixed(2)} km
              </Text>
              <Text style={styles.infoText}>
                {formattedRouteTime}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainerFull: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  infoContainer: {
    top: "55%",
    backgroundColor: "#808080",
    justifyContent: "flex-start",
    paddingVertical: "5%",
    marginHorizontal: "5%",
    borderRadius: 10,
    alignItems: "center",
  },
  infoText: {
    color: "#FFFFFF",
    fontSize: 18,
    marginVertical: 5,
  },
  marker: {
    backgroundColor: "#808080",
    padding: 5,
    borderRadius: 15,
    borderColor: "#2E86C1",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  visitedMarker: {
    backgroundColor: "#2E86C1",
    padding: 5,
    borderRadius: 15,
    borderColor: "#FFA500",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  currentMarker: {
    backgroundColor: "#FFA500",
    padding: 5,
    borderRadius: 15,
    borderColor: "#2E86C1",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  markerText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  loadingAnimation: {
    width: "20%",
    aspectRatio: 1,
    alignSelf: "center",
  },
});

export default RoutePage;
