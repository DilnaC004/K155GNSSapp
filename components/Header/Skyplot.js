import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, ScrollView } from 'react-native';
import Snackbar from 'react-native-snackbar';
import { styles } from '../Styles/styles';

const Skyplot = ({satsVisible}) => {
  return (
    <View style={styless.container}>
      <Text style={styless.text}>Skyplot</Text>
      <View style={styless.container}>
      <ScrollView contentContainerStyle={styless.scrollViewContent}>
        {satsVisible.map((satellite, index) => (
          <View key={index} style={styless.satelliteContainer}>
            <Text style={styless.satelliteText}>
              PRN: {satellite.prn} | Azimuth: {satellite.azimuth}° | Elevation: {satellite.elevation}° | 
              SNR: {satellite.snr !== null ? satellite.snr : 'N/A'} | Status: {satellite.status}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
    </View>
  );
};

const styless = StyleSheet.create({
  container: {
    height: 500,
    padding: 10,
    backgroundColor: '#F5FCFF',
  },
  scrollViewContent: {
    paddingVertical: 8,
  },
  satelliteContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 8,
  },
  satelliteText: {
    fontSize: 16,
    color: 'black',
  },
});

export default Skyplot;
