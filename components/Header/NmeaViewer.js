import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

import { styles } from '../Styles/styles';

const NmeaViewer = ({ nmeaMessages }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Příchozí zprávy</Text>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {nmeaMessages.map((message, index) => (
          <View key={index} style={styles.messageContainer}>
            <Text style={styles.text}>{message}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default NmeaViewer;
