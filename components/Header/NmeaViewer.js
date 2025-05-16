import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, FlatList } from 'react-native';

const NmeaViewer = ({ nmeaMessages }) => {
  return (
    <View style={styles.container}>
      <FlatList
        data={nmeaMessages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>{item}</Text>
          </View>
        )}
        contentContainerStyle={styles.scrollViewContent}
      />
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