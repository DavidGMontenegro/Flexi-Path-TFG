import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { useAuth } from '../../../AuthContext';
import { FIRESTORE_DB } from '../../../firebase-config';
import { collection, getDocs, orderBy, query, doc, deleteDoc, setDoc } from 'firebase/firestore';
import RequestItem from './RequestItem';

/**
 * Component to manage location requests.
 * Displays pending location requests and allows the user to accept or reject them.
 * Utilizes Firestore for fetching and updating requests, and displays loading and empty states.
 * @returns {JSX.Element} LocationRequests component.
 */
const LocationRequests = () => {
  const [locationRequests, setLocationRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { uid, username } = useAuth();

  useEffect(() => {
    /**
     * Fetches location requests from Firestore for the current user.
     * Sets loading state while fetching and updates locationRequests state with fetched data.
     */
    const fetchRequests = async () => {
      try {
        const requestsCollectionRef = collection(FIRESTORE_DB, "users", uid, "LocationRequests");
        const queryRef = query(requestsCollectionRef, orderBy("timeStamp"));
        const querySnapshot = await getDocs(queryRef);
        const requestsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setLocationRequests(requestsData);
      } catch (error) {
        console.error("Error fetching requests from Firebase:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [uid]);

  /**
   * Handles accepting a location request.
   * Adds requester's information to UsersLocationsGranted collection for both users.
   * Removes the request from LocationRequests collection.
   * @param {Object} request - The location request object to accept.
   */
  const handleAccept = async (request) => {
    try {
      // Add to UsersLocationsGranted of current user
      const grantedCollectionRef = collection(FIRESTORE_DB, 'users', uid, 'UsersLocationsGranted');
      await setDoc(doc(grantedCollectionRef, request.requesterUsername), {
        uid: request.requesterUid,
        username: request.requesterUsername,
        timeStamp: new Date(),
      });
  
      // Add to UsersLocationsGranted of the other user
      const otherUserGrantedCollectionRef = collection(FIRESTORE_DB, 'users', request.requesterUid, 'UsersLocationsGranted');
      await setDoc(doc(otherUserGrantedCollectionRef, username), {
        uid: uid,
        username: username,
        timeStamp: new Date(),
      });
  
      // Remove from LocationRequests
      const requestDocRef = doc(FIRESTORE_DB, 'users', uid, 'LocationRequests', request.id);
      await deleteDoc(requestDocRef);
  
      setLocationRequests(prevRequests => prevRequests.filter(req => req.id !== request.id));
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };
  
  /**
   * Handles rejecting a location request.
   * Removes the request from LocationRequests collection.
   * @param {Object} request - The location request object to reject.
   */
  const handleReject = async (request) => {
    try {
      // Remove from LocationRequests
      const requestDocRef = doc(FIRESTORE_DB, 'users', uid, 'LocationRequests', request.id);
      await deleteDoc(requestDocRef);

      setLocationRequests(prevRequests => prevRequests.filter(req => req.id !== request.id));
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  return (
    <View style={{ alignItems: "center" }}>
      {/* Display header if there are location requests */}
      {locationRequests.length > 0 && <Text style={styles.header}>Your location requests</Text>}
      <ScrollView style={{ maxHeight: "100%" }}>
        {/* Display loading animation while loading */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <LottieView
              source={require("../../../assets/animations/loading.json")}
              autoPlay
              loop
              style={styles.loadingAnimation}
            />
          </View>
        ) : locationRequests.length === 0 ? (
          // Display empty state if there are no location requests
          <View style={styles.emptyContainer}>
            <LottieView
              source={require("../../../assets/animations/empty.json")}
              autoPlay
              loop
              style={styles.emptyAnimation}
            />
            <Text style={styles.emptyText}>You have no location requests</Text>
          </View>
        ) : (
          // Render each location request item
          locationRequests.map(request => (
            <RequestItem
              key={request.id}
              request={request}
              onAccept={() => handleAccept(request)}
              onReject={() => handleReject(request)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: 18,
    fontWeight: "300",
    marginVertical: 10,
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
    marginTop: 10,
  },
  loadingAnimation: {
    width: '75%',
    height: 100,
    alignSelf: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyAnimation: {
    width: '100%',
    height: 150,
    alignSelf: "center",
  },
  emptyText: {
    color: "#252525",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },
});

export default LocationRequests;
