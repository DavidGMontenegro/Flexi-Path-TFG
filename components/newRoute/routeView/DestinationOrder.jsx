import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import StepIndicator from 'react-native-step-indicator';
import RouteManager from '../RouteManager';

// Custom styles for the StepIndicator component
const customStyles = {
  stepIndicatorSize: 40,
  currentStepIndicatorSize: 50,
  separatorStrokeWidth: 2,
  currentStepStrokeWidth: 3,
  stepStrokeCurrentColor: '#FFA500',
  stepStrokeWidth: 2,
  stepStrokeFinishedColor: '#2E86C1',
  stepStrokeUnFinishedColor: '#808080',
  separatorFinishedColor: '#2E86C1',
  separatorUnFinishedColor: '#808080',
  stepIndicatorFinishedColor: '#2E86C1',
  stepIndicatorUnFinishedColor: '#ffffff',
  stepIndicatorCurrentColor: '#ffffff',
  stepIndicatorLabelFontSize: 20,
  currentStepIndicatorLabelFontSize: 20,
  stepIndicatorLabelCurrentColor: '#FFA500',
  stepIndicatorLabelFinishedColor: '#ffffff',
  stepIndicatorLabelUnFinishedColor: '#808080',
  labelColor: '#808080',
  labelSize: 18,
  currentStepLabelColor: '#FFA500'
};

/**
 * Component to display the ordered list of destinations and start the route.
 * @component
 * @returns {JSX.Element}
 */
const DestinationOrder = () => {
  const [showStartButton, setShowStartButton] = useState(true); // State to manage visibility of the start button

  // Generates labels for StepIndicator based on the optimized route
  const labels = RouteManager.optimizedRoute.map((destination, index) => {
    if (RouteManager.optimizedRouteMethod[index] !== "none") {
      return destination.name + "\n" + RouteManager.optimizedRouteMethod[index];
    } else {
      return destination.name + "\n";
    }
  });

  // Calculates the height of the StepIndicator based on the number of destinations
  const stepIndicatorHeight = labels.length * 100;

  // Handles starting the route and updates RouteManager state
  const handleStartRoute = () => {
    RouteManager.routeStarted = true;
    setShowStartButton(false); // Hides the start button after route has started
  };

  // Formats distance to kilometers with one decimal place
  const formatDistance = (distance) => {
    return (distance / 1000).toFixed(1) + " km";
  };

  // Formats time in seconds to hours and minutes
  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };

  return (
    <>
      {/* Renders the component only if there are destinations in the optimized route */}
      {RouteManager.optimizedRoute.length > 0 &&
        <View style={styles.container}>
          {/* Start Route button */}
          {showStartButton &&
            <TouchableOpacity onPress={handleStartRoute} style={styles.startButton}>
              <Text style={styles.startButtonText}>Start Route</Text>
            </TouchableOpacity>
          }
          
          {/* Route info (distance and time) */}
          <View style={{ flexDirection: "row", justifyContent: "space-evenly", paddingVertical: 10 }}>
            <Text style={styles.routeInfoText}>
              {formatDistance(RouteManager.totalDistance)}
            </Text>
            <Text style={styles.routeInfoText}>
              {formatTime(RouteManager.totalTime)}
            </Text>
          </View>

          {/* Scrollable StepIndicator */}
          <ScrollView contentContainerStyle={[styles.scrollView, { height: stepIndicatorHeight }]}>
            <StepIndicator
              customStyles={customStyles}
              currentPosition={RouteManager.currentDestination}
              labels={labels}
              direction="vertical"
              stepCount={labels.length}
            />
          </ScrollView>
        </View>
      }
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#252525',
    justifyContent: "center",
    alignContent: "center"
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: "15%",
    paddingVertical: 20,
  },
  startButton: {
    backgroundColor: '#FFA500',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 20,
    marginHorizontal: "25%"
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  routeInfoText: {
    color: "#808080",
    fontSize: 18,
    fontWeight: "300"
  }
});

export default DestinationOrder;
