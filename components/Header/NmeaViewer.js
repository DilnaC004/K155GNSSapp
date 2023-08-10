import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const NmeaViewer = ({ nmeaMessages }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Příchozí zprávy</Text>
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
    height: 300,
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
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default NmeaViewer;
