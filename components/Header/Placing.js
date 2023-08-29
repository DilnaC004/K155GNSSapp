import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, Button, PermissionsAndroid, Platform } from 'react-native';
import Snackbar from 'react-native-snackbar';
import { styles } from '../Styles/styles';

export const Placing = () => {

  useEffect(() => {
    Snackbar.show({
      text: 'Tato funkce není dostupná',
      duration: Snackbar.LENGTH_SHORT,
      textColor: 'red',
      marginBottom: 5,
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Vytyčení</Text>
    </View>
  );
};

export default Placing;