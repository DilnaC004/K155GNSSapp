import React, { useState, useEffect, useContext, forwardRef, useRef } from 'react';
import { View, Text, Button, TextInput, StatusBar, PermissionsAndroid, Platform, Switch, ScrollView } from 'react-native';
import { DataContext } from '../Functions/DataContext';
import SelectDropdown from 'react-native-select-dropdown';
import Snackbar from 'react-native-snackbar';
import { styles } from '../Styles/styles';
import NmeaViewer from './NmeaViewer';
import useServerApi, { serverErrorText } from '../hooks/useServerApi';
import { formatBytes } from '../Functions/serverFormat';
import GPS from 'gps';

// How often the server diagnostics are refreshed while this screen is open
const STATUS_POLL_MS = 5000;

const StatusRow = ({ label, value }) => (
  <View style={styles.tableRow}>
    <Text style={styles.tableHeader}>{label}</Text>
    <Text style={styles.tableData}>{value}</Text>
  </View>
);

export default Communication = ({ getNmeaRead, resetConnection, connectionSettings, setConnectionSettings, sendMessage, rtcmNtrip, getLastGGA, nmeaMessages }) => {
  const [intervalId, setIntervalId] = useState(0);
  const gps = new GPS();
  const isEnabledRef = useRef(connectionSettings.isEnabled);
  const api = useServerApi(connectionSettings);
  const [serverState, setServerState] = useState(null);
  const [serverError, setServerError] = useState(null);

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

  const refreshServerStatus = async () => {
    try {
      const status = await api.serverStatus();
      setServerState(status);
      setServerError(null);
    } catch (error) {
      setServerState(null);
      setServerError(serverErrorText(error));
    }
  };

  // The HTTP API answers even when the WebSocket slot is taken by someone else
  useEffect(() => {
    if (!api.hasServer) {
      setServerState(null);
      return;
    }
    refreshServerStatus();
    const pollId = setInterval(refreshServerStatus, STATUS_POLL_MS);
    return () => clearInterval(pollId);
  }, [api.baseUrl]);

  const subsystems = serverState?.subsystems;

  return (
    <ScrollView
      style={styles.nastContainer}
      contentContainerStyle={styles.nastContent}
      nestedScrollEnabled>
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

      <Text style={styles.headline}>Stav serveru:</Text>
      {!api.hasServer && (
        <Text style={styles.description}>Adresa serveru zatím není známa.</Text>
      )}
      {api.hasServer && serverError != null && (
        <Text style={styles.description}>{serverError}</Text>
      )}
      {subsystems != null && (
        <View style={styles.tableContainer}>
          <StatusRow label="Adresa :" value={api.baseUrl} />
          <StatusRow
            label="Přijímač :"
            value={subsystems.gnss?.connected ? 'připojen' : 'odpojen'}
          />
          <StatusRow
            label="Sériový port :"
            value={`${subsystems.gnss?.path ?? '-'} @ ${subsystems.gnss?.baudrate ?? '-'}`}
          />
          <StatusRow
            label="Načteno :"
            value={formatBytes(subsystems.gnss?.bytes_read)}
          />
          {subsystems.gnss?.last_error != null && (
            <StatusRow label="Chyba přijímače :" value={subsystems.gnss.last_error} />
          )}
          <StatusRow
            label="Klient :"
            value={subsystems.client?.connected ? (subsystems.client.peer ?? 'připojen') : 'nikdo'}
          />
          <StatusRow
            label="Odesláno vět :"
            value={`${subsystems.client?.sentences_sent ?? 0} (zahozeno ${subsystems.client?.sentences_dropped ?? 0})`}
          />
          <StatusRow
            label="Vysílání adresy :"
            value={subsystems.discovery?.running ? 'běží' : 'stojí'}
          />
          <StatusRow
            label="WiFi :"
            value={`${subsystems.wifi?.ssid ?? '-'} (${subsystems.wifi?.ip ?? '-'})`}
          />
          <StatusRow
            label="Statické měření :"
            value={subsystems.static?.recording ? `běží, ${subsystems.static.point_id ?? ''}` : 'neběží'}
          />
        </View>
      )}

      <Text style={styles.headline}>Příchozí NMEA zprávy:</Text>
      <NmeaViewer nmeaMessages={nmeaMessages}/>
    </ScrollView>
  );
};
