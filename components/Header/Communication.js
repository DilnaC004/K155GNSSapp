import React, { useState, useEffect, useContext, forwardRef, useRef } from 'react';
import { View, Text, Button, StatusBar, PermissionsAndroid, Platform, Switch } from 'react-native';
import { DataContext } from '../Functions/DataContext';
import SelectDropdown from 'react-native-select-dropdown';
import Snackbar from 'react-native-snackbar';
import { styles } from '../Styles/styles';
import NmeaViewer from './NmeaViewer';
import GPS from 'gps';

export default Communication = ({ getNmeaRead, createConnection, closeConnection, connectionSettings, messages, sendMessage, rtcmNtrip, getLastGGA }) => {
  const [intervalId, setIntervalId] = useState(0);
  const gps = new GPS();
  const defaultUrl = `ws://${process.env.DEFAULT_URL}:8080` // 'ws://147.32.115.111:8080'; // Blur before commiting
  const isEnabledRef = useRef(connectionSettings.isEnabled);

  useEffect(() => {
    isEnabledRef.current = connectionSettings.isEnabled;
  }, [connectionSettings.isEnabled]);

  return (
    <View style={styles.nastContainer}>
      <Text style={styles.headline}>Nastavení spojení s přijímačem</Text>
      <Button
        title={connectionSettings.isEnabled ? 'Stop' : 'Start'}
        onPress={() => {
            if (!connectionSettings.isEnabled) {
            console.log("Setting up connection.");
            createConnection();
            setTimeout(() => {
              console.log(isEnabledRef.current);
              if (!isEnabledRef.current) {
              Snackbar.show({
                text: 'Připojení se nezdařilo.',
                duration: Snackbar.LENGTH_SHORT,
                textColor: 'red',
                marginBottom: 5,
              });
              } else {
                Snackbar.show({
                  text: 'Připojení se zdařilo.',
                  duration: Snackbar.LENGTH_SHORT,
                  textColor: 'green',
                  marginBottom: 5,
                });
              }
            }, 2000); // Wait for 2 seconds before checking the connection status
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