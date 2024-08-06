import React, { forwardRef, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useNavigation } from "@react-navigation/native";
import FirstBookmarksView from "./FirstBookmarks";
import RecentSearchs from "./RecentSearchs";
import Destination from "./Destination";
import { useAuth } from "../../AuthContext";
import AddStop from "./AddStop";
import RouteManager from "./RouteManager";
import RoutePointsView from "./RoutePointsView";
import DestinationOrder from "./routeView/DestinationOrder";

/**
 * Main modal component to manage destination search and route points.
 * @component
 * @param {Object} props - Component props.
 * @param {Object} props.destination - The selected destination.
 * @param {React.Ref} ref - Ref to control the BottomSheetModal.
 * @returns {JSX.Element}
 */
const MainModal = forwardRef(({ destination }, ref) => {
  const snapPoints = useMemo(() => ["30%", "80%"], []);
  const navigator = useNavigation();
  const [selectedDestination, setSelectedDestination] = useState(destination);
  const [showRoutePoints, setShowRoutePoints] = useState(
    RouteManager.route.length > 0 && !destination && RouteManager.optimizedRoute.length === 0
  );
  const [showOrderedPoints, setShowOrderedPoints] = useState(RouteManager.optimizedRoute.length > 0);

  useEffect(() => {
    setSelectedDestination(destination);
    setShowRoutePoints(
      RouteManager.route.length > 0 && !destination && RouteManager.optimizedRoute.length === 0
    );
    setShowOrderedPoints(RouteManager.optimizedRoute.length > 0);
  }, [destination, RouteManager.optimizedRoute.length, RouteManager.route]);

  /**
   * Handles the modal dismiss event.
   */
  const handleModalDismiss = () => {
    setSelectedDestination(null);
    setShowRoutePoints(
      RouteManager.route.length > 0 && !destination && RouteManager.optimizedRoute.length === 0
    );
    setShowOrderedPoints(RouteManager.optimizedRoute.length > 0);
  };

  /**
   * Navigates to the SearchDestination screen.
   */
  const handleSearch = () => {
    ref.current?.dismiss();
    navigator.navigate("SearchDestination");
  };

  /**
   * Handles the selection of a destination.
   * @param {Object} destination - The selected destination.
   * @param {string} type - The type of the destination.
   */
  const handleDestinationSelected = ({ destination, type }) => {
    ref.current?.snapToIndex(0);
    setSelectedDestination({ ...destination, type });
  };

  /**
   * Handles the addition of a new stop.
   */
  const handleAddNewStop = () => {
    setShowRoutePoints(false);
  };

  /**
   * Handles the route optimization event.
   */
  const handleRouteOptimized = () => {
    navigator.navigate("Home");
    ref.current?.snapToIndex(0);
    setShowRoutePoints(false);
    setShowOrderedPoints(true);
  };

  /**
   * Handles the addition of a destination.
   */
  const handleAddDestination = () => {
    ref.current?.snapToIndex(1);
    setSelectedDestination(null);
    setShowRoutePoints(true);
  };

  /**
   * Handles the addition of a bookmark.
   * @param {Object} destination - The destination to bookmark.
   */
  const handleAddBookmark = (destination) => {
    ref.current?.dismiss();
    navigator.navigate("NewBookmark", { destination });
  };

  return (
    <>
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={styles.backgroundStyle}
        handleIndicatorStyle={styles.handleIndicatorStyle}
        onDismiss={handleModalDismiss}
        style={{
          pointerEvents: "box-none",
        }}
        enableContentPanningGesture={false}
      >
        {showRoutePoints && (
          <RoutePointsView
            navigation={navigator}
            onAddNewStop={handleAddNewStop}
            onRouteOptimized={handleRouteOptimized}
          />
        )}
        {selectedDestination && (
          <Destination
            destination={selectedDestination}
            onAddDestination={handleAddDestination}
            onAddBookmark={handleAddBookmark}
          />
        )}
        {showOrderedPoints && <DestinationOrder />}
        {!showRoutePoints && !selectedDestination && !showOrderedPoints && (
          <AddStop
            navigatorObject={navigator}
            handleSearch={handleSearch}
            handleDestinationSelected={handleDestinationSelected}
          />
        )}
      </BottomSheetModal>
    </>
  );
});

/**
 * Styles for MainModal component.
 */
const styles = StyleSheet.create({
  backgroundStyle: {
    backgroundColor: "#252525",
  },
  handleIndicatorStyle: {
    backgroundColor: "#DADADA",
    width: "25%",
    height: 2,
  },
});

export default MainModal;
