import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, Button, PermissionsAndroid, Platform } from 'react-native';
import Snackbar from 'react-native-snackbar';
import { styles } from '../Styles/styles';
import MapView from 'react-native-maps';



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
      <Text>Sem prijde zobrazeni mapy</Text>
    </View>
  );
};

export default Map;