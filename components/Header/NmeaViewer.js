import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const NmeaViewer = ({ nmeaMessages }) => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {nmeaMessages.map((message, index) => (
          <View key={index} style={styles.messageContainer}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontSize: 16,
    color: 'black',
  },
});

export default NmeaViewer;
