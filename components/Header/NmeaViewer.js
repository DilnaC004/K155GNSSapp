import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

// A plain ScrollView, not a FlatList. The window only ever holds the last few
// epochs of sentences, so there is nothing to virtualise, and a FlatList here
// would sit inside the scrolled Communication page and break its windowing.
const NmeaViewer = ({ nmeaMessages }) => {
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        nestedScrollEnabled>
        {nmeaMessages.map((message, index) => (
          <View style={styles.messageContainer} key={index}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    padding: 10,
    backgroundColor: '#F5FCFF',
  },
  scrollViewContent: {
    paddingVertical: 8,
  },
  messageContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 8,
  },
  messageText: {
    fontSize: 12,
    color: 'black',
  },
});

export default NmeaViewer;
