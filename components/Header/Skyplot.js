import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import Snackbar from 'react-native-snackbar';
import { styles } from '../Styles/styles';

const Skyplot = () => {
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
      <Text style={styles.text}>Skyplot</Text>
    </View>
  );
};

export default Skyplot;
