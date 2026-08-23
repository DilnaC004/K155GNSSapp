import React, {useState, useEffect ,useContext} from 'react';
import {View, Text, TextInput, Button, ScrollView} from 'react-native';
import Snackbar from 'react-native-snackbar';
import RowWithLabelAndValue from './RowWithLabelAndValue';
import { DataContext } from '../Functions/DataContext';
import {styles} from '../Styles/styles';
import useServerApi, { serverErrorText, translateStatus } from '../hooks/useServerApi';
import { formatBytes } from '../Functions/serverFormat';

// How long the server listens to the receiver when sampling the stream
const SAMPLE_SECONDS = 3;

export default Point = ({ connectionSettings, connectedState }) => {

  const { data, updateData} = useContext(DataContext);
  const api = useServerApi(connectionSettings);

  const [pointSettings, setPointSettings] = useState(data.pointSettings);
  const [gnssStatus, setGnssStatus] = useState(null);
  const [gnssMessages, setGnssMessages] = useState(null);
  const [sample, setSample] = useState(null);
  const [busy, setBusy] = useState(false);

  const updatePointSettings = newSettings => {
    setPointSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  };

  useEffect(() => {
    return () => {
      updateData({
        pointSettings:pointSettings,
      })
    };
  }, [pointSettings]);

  const showError = error => {
    Snackbar.show({
      text: serverErrorText(error),
      duration: Snackbar.LENGTH_SHORT,
      textColor: 'red',
      marginBottom: 5,
    });
  };

  const refreshReceiver = async () => {
    try {
      setGnssStatus(await api.gnssStatus());
    } catch (error) {
      setGnssStatus(null);
      console.log('GNSS status failed:', serverErrorText(error));
    }
    try {
      setGnssMessages(await api.gnssMessages());
    } catch (error) {
      setGnssMessages(null);
      console.log('GNSS messages failed:', serverErrorText(error));
    }
  };

  useEffect(() => {
    if (api.hasServer) {
      refreshReceiver();
    } else {
      setGnssStatus(null);
      setGnssMessages(null);
    }
  }, [api.baseUrl, connectedState]);

  // Runs a request that reports back through a Snackbar and then resyncs
  const runAction = async (action, successText) => {
    setBusy(true);
    try {
      const result = await action();
      Snackbar.show({
        text: successText ?? translateStatus(result.status),
        duration: Snackbar.LENGTH_LONG,
        textColor: 'green',
        marginBottom: 5,
      });
      refreshReceiver();
    } catch (error) {
      showError(error);
    } finally {
      setBusy(false);
    }
  };

  const handleSample = async () => {
    setBusy(true);
    try {
      setSample(await api.gnssSample(SAMPLE_SECONDS));
    } catch (error) {
      setSample(null);
      showError(error);
    } finally {
      setBusy(false);
    }
  };

  const countsText = counts =>
    counts && Object.keys(counts).length > 0
      ? Object.entries(counts)
          .map(([name, count]) => `${name}: ${count}`)
          .join(', ')
      : 'nic';

  return (
    <ScrollView
      style={styles.nastContainer}
      contentContainerStyle={styles.nastContent}>
      <Text style={styles.headline}>Nastavení přijímače</Text>
      <Text style={styles.title}>Fázové centrum [m]</Text>
      <TextInput
        style={styles.input}
        value={pointSettings.offset.toString()}
        placeholder="Fázové centrum [m]"
        onChangeText={value => {
          updatePointSettings({offset: value});
        }}
        maxLength={5} // Set the maximum number of characters allowed
        keyboardType="numeric" // Set the keyboard to numeric mode
      />
      <RowWithLabelAndValue label="K155GNSS KRABIČKA" value="42mm" />
      <RowWithLabelAndValue label="K155GNSS VÁLEC" value="XXmm" />

      {!api.hasServer && (
        <Text style={styles.description}>Adresa serveru zatím není známa.</Text>
      )}
      {gnssStatus != null && (
        <View style={styles.tableContainer}>
          <RowWithLabelAndValue
            label="Stav"
            value={gnssStatus.connected ? 'připojen' : 'odpojen'}
          />
          <RowWithLabelAndValue label="Port" value={`${gnssStatus.path ?? '-'}`} />
          <RowWithLabelAndValue
            label="Rychlost"
            value={`${gnssStatus.baudrate ?? '-'} Bd`}
          />
          <RowWithLabelAndValue
            label="Načteno"
            value={formatBytes(gnssStatus.bytes_read)}
          />
          {gnssStatus.simulated && (
            <RowWithLabelAndValue label="Režim" value="simulace" />
          )}
          {gnssStatus.last_error != null && (
            <RowWithLabelAndValue label="Chyba" value={gnssStatus.last_error} />
          )}
        </View>
      )}
      {gnssMessages != null && (
        <View style={styles.tableContainer}>
          <Text style={styles.title}>
            Nastavené zprávy ({gnssMessages.generation ?? '-'}, {gnssMessages.port ?? '-'}):
          </Text>
          <Text style={styles.description}>
            {gnssMessages.configured?.join(', ') || 'žádné'}
          </Text>
        </View>
      )}
      {sample != null && (
        <View style={styles.tableContainer}>
          <Text style={styles.title}>Poslední odposlech ({SAMPLE_SECONDS} s):</Text>
          <RowWithLabelAndValue
            label="Tok dat"
            value={`${formatBytes(sample.bytes)} (${Math.round(sample.bytes_per_second)} B/s)`}
          />
          <RowWithLabelAndValue label="NMEA" value={countsText(sample.nmea)} />
          <RowWithLabelAndValue label="UBX" value={countsText(sample.ubx)} />
        </View>
      )}
      <View style={styles.buttonContainer}>
        <Button
          title="Odposlech"
          disabled={!api.hasServer || busy}
          onPress={handleSample}
        />
        <Button
          title="Obnov stav"
          disabled={!api.hasServer || busy}
          onPress={refreshReceiver}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Odešli nastavení"
          disabled={!api.hasServer || busy}
          onPress={() => runAction(api.gnssApplyMessages)}
        />
        <Button
          title="Otevři port znovu"
          disabled={!api.hasServer || busy}
          onPress={() => runAction(api.gnssReconnect)}
        />
      </View>
    </ScrollView>
  );
};
