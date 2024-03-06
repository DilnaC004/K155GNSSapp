import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, Button, PermissionsAndroid, Platform } from 'react-native';
import Snackbar from 'react-native-snackbar';
import { styles } from '../Styles/styles';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';



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
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      />
      <Text>Ahoj sv2te</Text>
    </View>
  );
};

export default Map;