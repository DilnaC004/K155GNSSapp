import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, Button, PermissionsAndroid, Platform } from 'react-native';
import Snackbar from 'react-native-snackbar';
import { styles } from '../Styles/styles';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';


export const Map = () => {
  useEffect(() => {
    Snackbar.show({
      text: 'Tato funkce je ve vývoji',
      duration: Snackbar.LENGTH_SHORT,
      textColor: 'red',
      marginBottom: 5,
    });
  }, []);

  return (
    <View style={styles.mapContainer}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: 50.1042375,
          longitude: 14.3883522,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }}>
        <Marker
          coordinate={{ latitude: 50.1042375, longitude: 14.3883522 }}
        />
      </MapView>
    </View>
  );
};

export default Map;