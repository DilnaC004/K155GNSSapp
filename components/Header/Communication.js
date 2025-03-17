import React, { useState, useEffect, useContext, forwardRef, useRef } from 'react';
import { View, Text, Button, TextInput, StatusBar, PermissionsAndroid, Platform, Switch } from 'react-native';
import { DataContext } from '../Functions/DataContext';
import SelectDropdown from 'react-native-select-dropdown';
import Snackbar from 'react-native-snackbar';
import { styles } from '../Styles/styles';
import NmeaViewer from './NmeaViewer';
import GPS from 'gps';

export default Communication = ({ getNmeaRead, resetConnection, connectionSettings, setConnectionSettings, sendMessage, rtcmNtrip, getLastGGA }) => {
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
      <View style={styles.refreshButton}>
        <Button
          title={'Restartuj spojení'}
          disabled={!connectionSettings.isEnabled}
          onPress={() => {
            resetConnection();
          }}
        />
      </View>
      <Text style={styles.description}>Aby se přijímač připojil, v nastavení telefonu nastav hotspot:</Text>
      <Text style={styles.headline}>Název: K155GNSSAppX</Text>
      <Text style={styles.headline}>Heslo: K155GNSSAppX</Text>
      <Text style={styles.description}>Kde číslo X bude číslo přijímače (na krabičce).</Text>
      <Text style={styles.description}>Poté spusť hotspot a vrať se do aplikace.</Text>
      <Text style={styles.description}>Nyní je vše nastaveno a po chvíli by se měl přijímač sám připojit.</Text>
      <Text style={styles.description}>Na iOS nelze měnit název hotspotu, je třeba změnit název zařízení.</Text>
    </View>
  );
};