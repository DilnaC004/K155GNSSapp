import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, ScrollView } from 'react-native';
import Snackbar from 'react-native-snackbar';
import { styles } from '../Styles/styles';

const Learn = ({}) => {
  
useEffect(() => {
  Snackbar.show({
    text: "Funkce je ve vyvoji.",
    duration: Snackbar.LENGTH_SHORT,
    textColor: 'red',
    marginBottom: 5,
  });
}, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Vyuka</Text>
    </View>
  );
};

export default Learn;
