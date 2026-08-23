import React, { useState, useEffect, useContext, forwardRef, useRef } from 'react';
import { View, Text, Button, TextInput, StatusBar, PermissionsAndroid, Platform, Switch, ScrollView, AppState } from 'react-native';
import { DataContext } from '../Functions/DataContext';
import SelectDropdown from 'react-native-select-dropdown';
import Snackbar from 'react-native-snackbar';
import { styles } from '../Styles/styles';
import NmeaViewer from './NmeaViewer';
import useServerApi, { serverErrorText } from '../hooks/useServerApi';
import { formatBytes } from '../Functions/serverFormat';
import useBluetoothHandshake, { HANDSHAKE_STATE } from '../hooks/useBluetoothHandshake';
import GPS from 'gps';

// How often the server diagnostics are refreshed while this screen is open
const STATUS_POLL_MS = 5000;

// How long to wait before trying the Bluetooth handshake again while the
// receiver is still not connected
const HANDSHAKE_RETRY_MS = 20000;

// What the user is told about the handshake, keyed by the state the hook is in
const handshakeTexts = {
  [HANDSHAKE_STATE.idle]: 'Čekám na přijímač.',
  [HANDSHAKE_STATE.unsupported]: 'Bluetooth handshake funguje jen na Androidu.',
  [HANDSHAKE_STATE.noPermission]: 'Aplikace nemá povolení k Bluetooth.',
  [HANDSHAKE_STATE.bluetoothOff]: 'Zapni Bluetooth v nastavení telefonu.',
  [HANDSHAKE_STATE.notPaired]:
    'Přijímač K155GNSS není spárovaný. Spáruj ho v nastavení Bluetooth a vrať se sem.',
  [HANDSHAKE_STATE.connecting]: 'Připojuji se k přijímači přes Bluetooth...',
  [HANDSHAKE_STATE.waiting]:
    'Předávám údaje o hotspotu, přijímač se připojuje. Může to trvat půl minuty.',
  [HANDSHAKE_STATE.done]: 'Přijímač dostal adresu, otevírám spojení.',
  [HANDSHAKE_STATE.failed]: 'Předání se nezdařilo.',
};

const StatusRow = ({ label, value }) => (
  <View style={styles.tableRow}>
    <Text style={styles.tableHeader}>{label}</Text>
    <Text style={styles.tableData}>{value}</Text>
  </View>
);

export default Communication = ({ getNmeaRead, resetConnection, connectionSettings, setConnectionSettings, sendMessage, rtcmNtrip, getLastGGA, nmeaMessages, connectToAddress, connectedState }) => {
  const [intervalId, setIntervalId] = useState(0);
  const gps = new GPS();
  const isEnabledRef = useRef(connectionSettings.isEnabled);
  const api = useServerApi(connectionSettings);
  const [serverState, setServerState] = useState(null);
  const [serverError, setServerError] = useState(null);
  const bluetooth = useBluetoothHandshake();
  // The retry timer and the AppState listener both need the current values
  const handshakeInputs = useRef({});
  handshakeInputs.current = {
    connectedState,
    ssid: connectionSettings.hotspotSsid,
    password: connectionSettings.hotspotPassword,
  };

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

  const runHandshake = async () => {
    const { connectedState: connected, ssid, password } = handshakeInputs.current;

    // Nothing to do once the receiver is streaming, the beacon took over
    if (connected || bluetooth.isRunning() || !ssid) {
      return;
    }

    const answer = await bluetooth.handshake(ssid, password);

    if (answer?.ip) {
      connectToAddress(answer.ip);
    }
  };

  // The user pairs the receiver in the phone settings and comes back, so try
  // on the way in and again whenever the app returns to the foreground
  useEffect(() => {
    runHandshake();

    const appStateId = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        runHandshake();
      }
    });

    const retryId = setInterval(runHandshake, HANDSHAKE_RETRY_MS);

    return () => {
      appStateId.remove();
      clearInterval(retryId);
    };
  }, []);

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
      <Text style={styles.headline}>Předání hotspotu přes Bluetooth</Text>
      <Text style={styles.description}>
        Zapni na telefonu hotspot a vyplň jeho název a heslo. Přijímač K155GNSS
        spáruj v nastavení Bluetooth telefonu. Po návratu do aplikace mu sama
        předá tyto údaje a přijímač se k hotspotu připojí.
      </Text>
      <Text style={styles.title}>Název hotspotu</Text>
      <TextInput
        style={styles.input}
        value={connectionSettings.hotspotSsid}
        onChangeText={value => {
          updateConnectionSettings({ hotspotSsid: value });
        }}
        placeholder="Název hotspotu"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Text style={styles.title}>Heslo hotspotu</Text>
      <TextInput
        style={styles.input}
        value={connectionSettings.hotspotPassword}
        onChangeText={value => {
          updateConnectionSettings({ hotspotPassword: value });
        }}
        placeholder="Heslo hotspotu"
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
      />
      <Text style={styles.description}>
        {handshakeTexts[bluetooth.state] ?? ''}
        {bluetooth.message ? ` ${bluetooth.message}` : ''}
      </Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Předej přijímači WiFi"
          disabled={connectedState || !connectionSettings.hotspotSsid}
          onPress={runHandshake}
        />
      </View>

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
