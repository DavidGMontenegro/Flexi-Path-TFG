import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import HeaderNav from "../headerNavbar/HeaderNav";
import HeaderMenu from "../headerNavbar/HeaderMenu";
import { useNavigation } from '@react-navigation/native';
import FooterNavbar from "../footerNavbar/FooterNavbar";
import MainModal from "../newRoute/MainModal";
import RoutePage from "../newRoute/routeView/RoutePage";
import RouteManager from "../newRoute/RouteManager";
import { useAuth } from "../../AuthContext";
import { FIRESTORE_DB } from "../../firebase-config";
import { doc, updateDoc } from "firebase/firestore";

/**
 * Main component for the application.
 * Manages location updates, route management, and user interface elements.
 * @returns {JSX.Element} Main component
 */
const Main = () => {
  const navigation = useNavigation();
  const [location, setLocation] = useState(null);
  const [streetName, setStreetName] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);
  const [debouncedRegion, setDebouncedRegion] = useState(null);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [showRoute, setShowRoute] = useState(RouteManager.optimizedRoute.length > 0);
  const mapRef = useRef();
  const createRouteRef = useRef(null);
  const { uid } = useAuth();

  /**
   * Shows the route modal for creating new routes.
   * @method
   */
  const showRouteModal = () => {
    createRouteRef.current?.present();
  };

  useEffect(() => {
    const getPermission = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Please grant location permissions");
        return;
      }

      const watchLocationId = await Location.watchPositionAsync({
        enableHighAccuracy: true,
        timeInterval: 5000, // Update location every 5 seconds
        distanceInterval: 10, // Update location if device moves at least 10 meters
      }, (location) => {
        setLocation(location);
      });

      return () => Location.removeWatchPositionAsync(watchLocationId);
    };

    setShowRoute(RouteManager.optimizedRoute.length > 0);
    getPermission();
  }, [RouteManager.optimizedRoute.length]);

  useEffect(() => {
    const updateLocationInFirestore = async () => {
      if (location) {
        reverseGeocodeLocation();
        console.log("location", location);
        const userDocRef = doc(FIRESTORE_DB, 'users', uid);

        const locationData = {
          currentLocation: {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          },
          timeStamp: new Date(),
        };

        try {
          await updateDoc(userDocRef, locationData);
        } catch (error) {
          console.error(error);
        }
      }
    };

    updateLocationInFirestore();
  }, [location]);

  useEffect(() => {
    if (location && !mapRegion) {
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [location, mapRegion]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedRegion(mapRegion);
    }, 500);

    return () => clearTimeout(timer);
  }, [mapRegion]);

  /**
   * Reverse geocodes the current location to retrieve the street name.
   * @method
   */
  const reverseGeocodeLocation = async () => {
    try {
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address.length > 0) {
        const street = address[0].street || "Unknown road";
        setStreetName(street);
      }
    } catch (error) {
      console.error("Error fetching street name:", error);
    }
  };

  /**
   * Centers the map on the current user's location.
   * @method
   */
  const handleCenterMap = async () => {
    if (mapRef.current && location) {
      const { coords } = location;
      mapRef.current.animateToRegion(
        {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.0025,
          longitudeDelta: 0.0025,
        },
        1500
      );
    }
  };

  /**
   * Toggles the display of the header menu.
   * @method
   */
  const handleToggleHeader = () => {
    setShowHeaderMenu(!showHeaderMenu);
  };

  /**
   * Closes the currently displayed route view.
   * @method
   */
  const handleCloseRoute = () => {
    setShowRoute(false);
    RouteManager.clearRoute();
  };

  return (
    <View style={styles.container}>
      {
        !showRoute ? 
        (
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            region={mapRegion}
            onRegionChangeComplete={setMapRegion}
            showsUserLocation
            showsMyLocationButton={false}
            ref={mapRef}
            />
        ):
        (<RoutePage/>)
      }
      
      <View style={styles.footerContainer}>
        <FooterNavbar onNewRoutePress={showRouteModal}/>
      </View>
      
      {streetName && (
        <View style={styles.headerContainer}>
          {showHeaderMenu ? (
            <HeaderMenu onBackPress={handleToggleHeader}/>
          ) : (
            <HeaderNav streetName={streetName} onPressText={handleCenterMap} toggleMenu={handleToggleHeader} onCloseRoute={handleCloseRoute}/>
          )}
        </View>
      )}
      
      <MainModal ref={createRouteRef}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  headerContainer: {
    position: "absolute",
    top: "8%",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  footerContainer: {
    position: "absolute",
    bottom: "5%",
    left: 0,
    right: 0,
    alignItems: "center",
  }
});

export default Main;
