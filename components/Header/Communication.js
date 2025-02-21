import React, { useState, useEffect, useContext, forwardRef } from 'react';
import { View, Text, Button, StatusBar, PermissionsAndroid, Platform, Switch } from 'react-native';
import { DataContext } from '../Functions/DataContext';
import SelectDropdown from 'react-native-select-dropdown';
import Snackbar from 'react-native-snackbar';
import { styles } from '../Styles/styles';
import NmeaViewer from './NmeaViewer';
import GPS from 'gps';

export default Communication = ({ getNmeaRead, createConnection, messages, sendMessage, rtcmNtrip, getLastGGA }) => {
  const { data, updateData } = useContext(DataContext);
  const [intervalId, setIntervalId] = useState(0);
  const [connectionSettings, setConnectionSettings] = useState(
    data.connectionSettings,
  );
  const gps = new GPS();
  const defaultUrl = 'ws://localhost:8080';

  const updateConnectionSettings = newSettings => {
    const updatedSettings = { ...connectionSettings, ...newSettings };
    setConnectionSettings(updatedSettings);
    updateData({ connectionSettings: updatedSettings });
  };

  return (
    <View style={styles.nastContainer}>
      <Text style={styles.headline}>Nastavení spojení s přijímačem</Text>
      <Button
        title={connectionSettings.isEnabled ? 'Stop' : 'Start'}
        onPress={() => {
          if (!connectionSettings.isEnabled) {
            createConnection(defaultUrl);
            console.log("Setting up connection.");
            updateConnectionSettings({ isEnabled: !connectionSettings.isEnabled });
          } else {
            // closeConnection();
            console.log("Closing connection.");
            updateConnectionSettings({ isEnabled: !connectionSettings.isEnabled });
          }
        }}
      />

      <NmeaViewer nmeaMessages={data.nmeaRead} />
    </View>
  );
};