import React from 'react';
import { View, Text, StyleSheet, TouchableHighlight } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Component to display a location request item with accept and reject buttons.
 * @param {Object} props - Component props.
 * @param {Object} props.request - The location request object containing requester information.
 * @param {string} props.request.requesterUsername - Username of the requester.
 * @param {string} props.request.requesterUid - UID of the requester.
 * @param {Function} props.onAccept - Callback function invoked when the accept button is pressed.
 * @param {Function} props.onReject - Callback function invoked when the reject button is pressed.
 * @returns {JSX.Element} RequestItem component.
 */
const RequestItem = ({ request, onAccept, onReject }) => {
  const { requesterUsername, requesterUid } = request;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{requesterUsername}</Text>
      <View style={styles.buttons}>
        {/* Accept button */}
        <TouchableHighlight
          style={{ backgroundColor: "#252525", padding: 5, borderRadius: 5 }}
          onPress={() => onAccept(requesterUid, requesterUsername)}
          underlayColor="#2E86C100">
          <Ionicons name='checkmark' size={24} color={"#FFA500"} />
        </TouchableHighlight>
        {/* Reject button */}
        <TouchableHighlight
          style={{ backgroundColor: "#252525", padding: 5, borderRadius: 5 }}
          onPress={() => onReject(requesterUid)}
          underlayColor="#2E86C100">
          <Ionicons name='close' size={24} color={"#FFA500"} />
        </TouchableHighlight>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginVertical: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    width: "100%"
  },
  text: {
    fontSize: 17,
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
  },
});

export default RequestItem;
