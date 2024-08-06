import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableHighlight } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '../../generalComponents/SearchBar';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { FIRESTORE_DB } from '../../../firebase-config';
import { useAuth } from '../../../AuthContext';
import axios from 'axios';

/**
 * Component to send location requests to friends.
 * @returns {JSX.Element} FriendsLocation component.
 */
const FriendsLocation = () => {
  const { uid, username } = useAuth();
  const [searchText, setSearchText] = useState("");
  const [requestStatus, setRequestStatus] = useState("");

  /**
   * Function to fetch user details by username.
   * @param {string} username - Username to search for.
   * @returns {Object | null} User object if found, otherwise null.
   */
  const getUserByUsername = async (username) => {
    const usersCollectionRef = collection(FIRESTORE_DB, 'users');
    const q = query(usersCollectionRef, where('username', '==', username.toLowerCase()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('No user found with the given username');
      return null;
    }

    // Return the first user document (should be only one)
    const userDoc = querySnapshot.docs[0];
    return {
      uid: userDoc.id,
      ...userDoc.data()
    };
  };

  /**
   * Function to handle sending location request to a user.
   */
  const handleSendRequest = async () => {
    try {
      const targetUser = await getUserByUsername(searchText);
      if (!targetUser) {
        setRequestStatus('User not found');
        return;
      }

      const targetUid = targetUser.uid;
      const accessRequestsRef = collection(FIRESTORE_DB, 'users', targetUid, 'LocationRequests');
      const q = query(accessRequestsRef, where('requesterUid', '==', uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Update existing request
        const requestDoc = querySnapshot.docs[0];
        await updateDoc(doc(FIRESTORE_DB, 'users', targetUid, 'LocationRequests', requestDoc.id), {
          timeStamp: new Date()
        });
        setRequestStatus(`Request updated for ${targetUser.username}`);
      } else {
        // Create new request
        await addDoc(accessRequestsRef, {
          requesterUid: uid,
          requesterUsername: username,
          status: 'pending',
          timeStamp: new Date()
        });
        setRequestStatus(`Request sent to ${targetUser.username}`);
      }

      // Send notification using external API (example)
      axios.post(`https://app.nativenotify.com/api/follow/notification`, {
        masterSubID: targetUid,
        appId: 21031,
        appToken: '6y2Y9hdgxLHvd9DtOgZxwW',
        title: 'New location request!',
        message: `${username} has sent you a live time location request.`
      });
    } catch (error) {
      console.error('Error sending access request:', error);
      setRequestStatus('Error sending request');
    }
  };

  return (
    <View style={{ alignItems: "center" }}>
      <Text style={styles.header}>Send location request</Text>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ width: "90%" }}>
          <SearchBar onSearch={(text) => setSearchText(text)} />
        </View>
        <TouchableHighlight
          style={{ backgroundColor: "#252525", padding: 5, borderRadius: 5 }}
          onPress={handleSendRequest}
          underlayColor="#2E86C100">
          <Ionicons name='paper-plane-outline' size={24} color={"#FFA500"} />
        </TouchableHighlight>
      </View>
      {requestStatus && <Text style={styles.statusText}>{requestStatus}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: 18,
    fontWeight: "300"
  },
  statusText: {
    fontSize: 14,
    color: '#252525'
  }
});

export default FriendsLocation;
