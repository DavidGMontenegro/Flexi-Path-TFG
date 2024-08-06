import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  TouchableHighlight,
} from "react-native";
import DistanceChart from "./DistanceChart";
import TimeChart from "./TimeChart";
import RoutesCompletedChart from "./RoutesCompletedChart";
import { useAuth } from "../../../AuthContext";
import { FIRESTORE_DB } from "../../../firebase-config";
import { collection, getDocs } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

/**
 * Component for displaying statistics related to user routes, including distance traveled, time spent, and routes completed.
 * Uses different chart components based on the selected graph index.
 * Fetches data from Firestore based on the authenticated user's ID.
 * @component
 * @returns {JSX.Element} StatsScreen component.
 */
const StatsScreen = () => {
  const [stats, setStats] = useState([]);
  const [currentGraphIndex, setCurrentGraphIndex] = useState(0);
  const { uid } = useAuth();

  useEffect(() => {
    /**
     * Fetches statistics data from Firestore for the authenticated user.
     * Updates the component state with the fetched data.
     */
    const fetchStats = async () => {
      const statsCollectionRef = collection(
        FIRESTORE_DB,
        "users",
        uid,
        "RouteStats"
      );
      const querySnapshot = await getDocs(statsCollectionRef);
      const data = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        date: doc.id,
      }));
      setStats(data);
      console.log("data:", data);
    };
    fetchStats();
  }, [uid]);

  // Array of objects defining each graph to be displayed
  const graphs = [
    {
      title: "Distance Traveled",
      component: DistanceChart,
      dataKey: "totalDistance",
    },
    { title: "Time Spent", component: TimeChart, dataKey: "totalTime" },
    {
      title: "Routes Completed",
      component: RoutesCompletedChart,
      dataKey: "routesCompleted",
    },
  ];

  // Component corresponding to the current graph index
  const CurrentGraphComponent = graphs[currentGraphIndex].component;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Button to navigate to the previous graph */}
        <TouchableHighlight
          onPress={() =>
            setCurrentGraphIndex(
              (currentGraphIndex - 1 + graphs.length) % graphs.length
            )
          }
          underlayColor="transparent"
        >
          <Ionicons
            name="arrow-undo-circle-outline"
            size={28}
            color="#252525"
          />
        </TouchableHighlight>
        {/* Title of the current graph */}
        <Text style={styles.title}>{graphs[currentGraphIndex].title}</Text>
        {/* Button to navigate to the next graph */}
        <TouchableHighlight
          onPress={() =>
            setCurrentGraphIndex((currentGraphIndex + 1) % graphs.length)
          }
          underlayColor="transparent"
        >
          <Ionicons
            name="arrow-redo-circle-outline"
            size={28}
            color="#252525"
          />
        </TouchableHighlight>
      </View>
      {/* Display the current graph component with statistics data */}
      <CurrentGraphComponent
        stats={stats}
        dataKey={graphs[currentGraphIndex].dataKey}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#e9e9e9",
    borderRadius: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
});

export default StatsScreen;
