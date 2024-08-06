import React, { useState, useEffect } from "react";
import { View, Text, TouchableHighlight, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CalendarPicker from "react-native-calendar-picker";
import RouteItem from "./RouteItem";
import { FIRESTORE_DB } from "../../../firebase-config"; // Importa la configuración de Firebase
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "../../../AuthContext";
import { useNavigation } from "@react-navigation/native";

/**
 * Component for displaying a history of routes, with filtering and date selection capabilities.
 * Retrieves route data from Firestore based on user ID and allows filtering by date range.
 * @returns {JSX.Element} RouteHistoryPage component.
 */
const RouteHistoryPage = () => {
  const navigation = useNavigation();
  const [showCalendar, setShowCalendar] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const { uid } = useAuth(); // Obtiene el uid del contexto de autenticación
  const [historyList, setHistoryList] = useState([]);

  // Función para obtener datos desde Firebase
  const fetchRoutesFromFirebase = async () => {
    try {
      const querySnapshot = await getDocs(collection(FIRESTORE_DB, "users", uid, "RouteHistory")); // Cambia "RouteHistory" por el nombre de tu colección
      const routesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        fecha: doc.data().date.toDate().toISOString().split('T')[0], // Convierte el timestamp de Firestore a un string de fecha
        hora: doc.data().date.toDate().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }), // Extrae la hora
        origen: doc.data().route[0]?.name || "Desconocido", // El nombre del primer destino como origen
        distancia: `${(doc.data().distance || 0).toFixed(2)} km`, // Distancia en kilómetros
        tiempo: formatTime(doc.data().time / 60), // Tiempo en minutos formateado
        route: doc.data().route // Añadir la ruta completa
      }));
      
      setHistoryList(routesData);
    } catch (error) {
      console.error("Error fetching routes: ", error);
    }
  };

  useEffect(() => {
    fetchRoutesFromFirebase();
  }, []);

  /**
   * Handles navigation to RouteDataView for detailed view of selected route.
   * @param {Object} route - The route object containing details of the selected route.
   */
  const handleRoutePress = (route) => {
    // Implementar la navegación a la vista detallada de la ruta (RouteDataView)
    console.log("Route selected:", route);
  };

  /**
   * Filters routes based on selected start and end dates.
   */
  const filterRoutes = () => {
    const filtered = historyList.filter(route => {
      const routeDate = new Date(route.fecha);
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return routeDate >= start && routeDate <= end;
      }
      return true;
    });

    setFilteredRoutes(filtered.length > 0 ? filtered : []);
  };

  useEffect(() => {
    filterRoutes();
  }, [startDate, endDate, historyList]);

  /**
   * Clears the selected date filters and resets filtered routes to full history.
   */
  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setFilteredRoutes(historyList);
  };

  const getMonthName = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
  };

  /**
   * Groups routes by month and year, sorted in descending order.
   * @returns {Object} Object with keys as month and year (e.g., "JANUARY 2024") and values as arrays of routes in that month.
   */
  const groupRoutesByMonthDescending = (routes) => {
    const sortedRoutes = routes.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    return sortedRoutes.reduce((acc, route) => {
      const monthYear = getMonthName(route.fecha) + " " + new Date(route.fecha).getFullYear();
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(route);
      return acc;
    }, {});
  };

  /**
   * Creates a list of route dates for styling calendar dates with routes.
   * @param {Object[]} routes - Array of route objects with date strings.
   * @returns {string[]} Array of route dates formatted as strings.
   */
  const getRoutesDates = (routes) => {
    return routes.map(route => route.fecha);
  };

  /**
   * Formats time in minutes to "Xh Ymin" format.
   * @param {number} minutes - Time in minutes to be formatted.
   * @returns {string} Formatted time string (e.g., "1h 30min").
   */
  const formatTime = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hrs}h ${mins}min`;
  };

  // Crear estilos personalizados para las fechas de rutas
  const routesDates = getRoutesDates(historyList);
  const customDatesStyles = routesDates.map(date => {
    return {
      date: new Date(date),
      style: { backgroundColor: '#2E86C1' }, // Color de fondo para las fechas con rutas
      textStyle: { color: '#FFF' }, // Color del texto para las fechas con rutas
    };
  });

  const groupedRoutes = groupRoutesByMonthDescending(filteredRoutes);

  return (
    <View style={styles.container}>
      {/* Header section with navigation and title */}
      <View style={styles.header}>
        <TouchableHighlight
          onPress={() => navigation.navigate("Home")}
          underlayColor="#2E86C100"
          style={{ position: "relative", left: -80 }}
        >
          <Ionicons name="arrow-back" size={26} color="#FFF" />
        </TouchableHighlight>
        <Text style={styles.headerText}>Route History</Text>
      </View>

      {/* Button to toggle showing/hiding calendar */}
      <TouchableHighlight
        onPress={() => {
          setShowCalendar(!showCalendar);
          setStartDate(null);
          setEndDate(null);
        }}
        underlayColor="#2E86C100"
      >
        <View style={styles.filterButton}>
          <Ionicons name="calendar-outline" size={20} color="#000" />
          <Text style={styles.filterButtonText}>
            {showCalendar ? "Close Calendar" : "Filter by Date"}
          </Text>
        </View>
      </TouchableHighlight>

      {/* Calendar component for date selection */}
      <ScrollView style={styles.body}>
        {showCalendar && (
          <View style={{backgroundColor: "#808080", borderRadius: 10, marginHorizontal: 10}}>
            <CalendarPicker
              startFromMonday={true}
              allowRangeSelection={true}
              minDate={new Date(2023, 0, 1)}
              maxDate={new Date(2024, 11, 31)}
              selectedStartDate={startDate}
              selectedEndDate={endDate}
              customDatesStyles={customDatesStyles}
              selectedRangeStyle={{backgroundColor: "#FFA500"}}
              onDateChange={(date, type) => {
                if (type === "END_DATE") {
                  setEndDate(date);
                } else {
                  setStartDate(date);
                  setEndDate(null);
                }
              }}
            />
          </View>
        )}

        {/* Display routes grouped by month */}
        {filteredRoutes.length === 0 ? (
          <Text style={styles.noRoutesText}>
            There are no routes for the selected dates
          </Text>
        ) : (
          Object.keys(groupedRoutes).map((monthYear, index) => (
            <View key={index}>
              <Text style={styles.monthIndicator}>{monthYear}</Text>
              <View style={styles.separator} />
              {groupedRoutes[monthYear].map((route, idx) => (
                <RouteItem
                  key={idx}
                  hora={route.hora}
                  origen={route.origen}
                  distancia={route.distancia}
                  tiempo={route.tiempo}
                  onPress={() => handleRoutePress(route)}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>
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
    paddingTop: 85,
    paddingBottom: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    fontSize: 32,
    color: "white",
    fontWeight: "300",
  },
  filterButton: {
    backgroundColor: "#FFA500",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginLeft: "60%",
    marginRight: "5%",
    marginVertical: "2.5%",
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  filterButtonText: {
    marginLeft: 5,
    color: "#000",
  },
  body: {
    backgroundColor: "#252525",
  },
  monthIndicator: {
    fontSize: 22,
    color: "#FFFFFF",
    fontWeight: "300",
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  separator: {
    backgroundColor: "#FFF",
    marginHorizontal: 10,
    height: 1,
  },
  noRoutesText: {
    textAlign: "center",
    marginTop: 20,
    color: "#FFF",
    fontSize: 18,
  },
});

export default RouteHistoryPage;
