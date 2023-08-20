import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, Button, PermissionsAndroid, Platform } from 'react-native';

import { styles } from '../Styles/styles';

export const Map = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Mapa</Text>
    </View>
  );
};

export default Map;