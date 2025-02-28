import React, { useState, useEffect, useContext, forwardRef, useRef } from 'react';
import { View, Text, Button, TextInput, StatusBar, PermissionsAndroid, Platform, Switch } from 'react-native';
import { DataContext } from '../Functions/DataContext';
import SelectDropdown from 'react-native-select-dropdown';
import Snackbar from 'react-native-snackbar';
import { styles } from '../Styles/styles';
import NmeaViewer from './NmeaViewer';
import GPS from 'gps';

export default Communication = ({ getNmeaRead, createConnection, closeConnection, connectionSettings, setConnectionSettings, messages, sendMessage, rtcmNtrip, getLastGGA }) => {
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

  const checkSocket = (socket) => {
    if (!socket) {
      Snackbar.show({
        text: 'Zadej IP adresu přijímače.',
        duration: Snackbar.LENGTH_SHORT,
        textColor: 'red',
        marginBottom: 5,
      });
      return false;
    }

    if (!socket.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)) {
      Snackbar.show({
        text: 'Neplatná IP adresa.',
        duration: Snackbar.LENGTH_SHORT,
        textColor: 'red',
        marginBottom: 5,
      });
      return false;
    }

    // Correct format, you can try to connect
    return true;
  }

  return (
    <View style={styles.nastContainer}>
      <Text style={styles.headline}>Nastavení spojení s přijímačem</Text>
      <Text style={styles.title}>Zadej IP adresu přijímače:</Text>
      <TextInput
        style={styles.input}
        placeholder="XXX.XXX.XXX.XXX"
        onChangeText={(text) => updateConnectionSettings({ hostIp: text })}
        value={connectionSettings.hostIp}
      />
      <Button
        title={connectionSettings.isEnabled ? 'Stop' : 'Start'}
        onPress={() => {
          if (!connectionSettings.isEnabled) {
            if (checkSocket(connectionSettings.hostIp)) {
              console.log("Setting up connection.");
              createConnection(connectionSettings.hostIp);
            }
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