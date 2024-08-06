import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableHighlight,
  ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import RoutesBookmark from "./routes/RoutesBookmark";
import PlacesCategoryBookmark from "./places/PlacesCategoryBookmark";

/**
 * Bookmark page component displaying places and routes bookmarks.
 * Allows navigation between different bookmark categories.
 * @component
 * @returns {JSX.Element}
 */
export default function BookmarkPage() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("Places");

  /**
   * Handles tab press to switch between Places and Routes tabs.
   * @param {string} tab - Tab name ("Places" or "Routes").
   */
  const handleTabPress = (tab) => {
    setActiveTab(tab);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "85%" }}>
          <TouchableHighlight
            onPress={() => navigation.navigate("Home")}
            underlayColor="#2E86C100"
          >
            <Ionicons name="arrow-back" size={26} color="#FFF" />
          </TouchableHighlight>
          <Text style={styles.headerText}>Bookmarks</Text>
          <TouchableHighlight
            onPress={() => navigation.navigate("NewBookmark")}
            underlayColor="#2E86C100"
          >
            <Ionicons name="add-circle-outline" size={26} color="#FFF" />
          </TouchableHighlight>
        </View>

        <View
          style={{
            flexDirection: "row",
            position: "absolute",
            bottom: 0
          }}
        >
          <TouchableHighlight
            onPress={() => handleTabPress("Places")}
            underlayColor="#2E86C100"
            style={[
              styles.tabButton,
              activeTab === "Places" && styles.activeTab
            ]}
          >
            <Text style={styles.tabText}>Places</Text>
          </TouchableHighlight>
          <TouchableHighlight
            onPress={() => handleTabPress("Routes")}
            underlayColor="#2E86C100"
            style={[
              styles.tabButton,
              activeTab === "Routes" && styles.activeTab
            ]}
          >
            <Text style={styles.tabText}>Routes</Text>
          </TouchableHighlight>
        </View>
      </View>
      {activeTab === "Places" && <PlacesCategoryBookmark/>}
      {activeTab === "Routes" && <RoutesBookmark/>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    flex: 1
  },
  header: {
    backgroundColor: "#2E86C1",
    paddingTop: 85,
    paddingBottom: 50,
    alignItems: "center",
    justifyContent: "center"
  },
  body: {
    backgroundColor: "#252525"
  },
  headerText: {
    fontSize: 32,
    color: "white",
    fontWeight: "300"
  },
  routeItem: {
    backgroundColor: "#808080",
    padding: 15,
    paddingHorizontal: 20,
    margin: 10,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  yearTitle: {
    fontSize: 28,
    fontWeight: "400",
    color: "white",
    textAlign: "center",
    marginTop: 15,
    marginBottom: 5
  },
  monthTitle: {
    fontSize: 26,
    fontWeight: "200",
    color: "white",
    textAlign: "left",
    marginTop: 10,
    marginHorizontal: 10
  },
  horizontalLine: {
    borderBottomColor: "white",
    borderBottomWidth: 1,
    marginHorizontal: 10,
    marginBottom: 10
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8
  },
  tabText: {
    fontSize: 18,
    color: "white"
  },
  activeTab: {
    borderBottomColor: "#FFA500",
    borderBottomWidth: 2
  }
});
