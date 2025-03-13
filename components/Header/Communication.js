import React, { useState, useEffect, useContext, forwardRef, useRef } from 'react';
import { View, Text, Button, TextInput, StatusBar, PermissionsAndroid, Platform, Switch } from 'react-native';
import { DataContext } from '../Functions/DataContext';
import SelectDropdown from 'react-native-select-dropdown';
import Snackbar from 'react-native-snackbar';
import { styles } from '../Styles/styles';
import NmeaViewer from './NmeaViewer';
import GPS from 'gps';

export default Communication = ({ getNmeaRead, createConnection, closeConnection, connectionSettings, setConnectionSettings, sendMessage, rtcmNtrip, getLastGGA }) => {
  const [intervalId, setIntervalId] = useState(0);
  const gps = new GPS();
  const isEnabledRef = useRef(connectionSettings.isEnabled);

  updateConnectionSettings = (newSettings) => {
    setConnectionSettings((prevSettings) => ({
      ...prevSettings,
      ...newSettings,
    }));
  }

  useEffect(() => {
    if (isEnabledRef.current !== connectionSettings.isEnabled) {
      isEnabledRef.current = connectionSettings.isEnabled;
      if (isEnabledRef.current) {
        Snackbar.show({
          text: 'Připojení se zdařilo.',
          duration: Snackbar.LENGTH_SHORT,
          textColor: 'green',
          marginBottom: 5,
        });
      }
    }
  }, [connectionSettings.isEnabled]);

  return (
    <View style={styles.nastContainer}>
      <Text style={styles.headline}>Nastavení spojení s přijímačem</Text>
      <Button
        title={connectionSettings.isEnabled ? 'Stop' : 'Start'}
        onPress={() => {
          if (!connectionSettings.isEnabled) {
            createConnection();
          } else {
            console.log("Closing connection.");
            closeConnection();
            Snackbar.show({
              text: 'Odpojeno od zařízení.',
              duration: Snackbar.LENGTH_SHORT,
              textColor: 'red',
              marginBottom: 5,
            });
          }
        }}
      />
    </View>
  );
};