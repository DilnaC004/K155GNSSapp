import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, Button, PermissionsAndroid, Platform } from 'react-native';

export const Map = () => {



  return (
    <View style={styles.container}>
      <Text style={styles.text}>Mapa</Text>
    </View>
  );
};

export default Map;

const styles = {
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
};