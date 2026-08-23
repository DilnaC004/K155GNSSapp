import React, { useState, useEffect } from 'react';
import { FlatList, View, Text, TouchableOpacity, Button, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Snackbar from 'react-native-snackbar';
import { styles } from '../../Styles/styles';
import useServerApi, { serverErrorText, translateStatus } from '../../hooks/useServerApi';
import { formatBytes, formatNsDate, locationText } from '../../Functions/serverFormat';

// Recordings made by the static measurement, stored on the receiver server.
// Ones already on the USB flash drive are listed first by the server.
export default FlatListStaticPoints = ({ connectionSettings }) => {
  const api = useServerApi(connectionSettings);
  const [points, setPoints] = useState([]);
  const [storage, setStorage] = useState(null);
  const [busy, setBusy] = useState(false);

  const showError = error => {
    Snackbar.show({
      text: serverErrorText(error),
      duration: Snackbar.LENGTH_SHORT,
      textColor: 'red',
      marginBottom: 5,
    });
  };

  const refresh = async () => {
    if (!api.hasServer) {
      setPoints([]);
      setStorage(null);
      return;
    }
    try {
      const list = await api.listPoints();
      setPoints(list.points ?? []);
    } catch (error) {
      setPoints([]);
      showError(error);
    }
    try {
      setStorage(await api.storageStatus());
    } catch (error) {
      setStorage(null);
    }
  };

  useEffect(() => {
    refresh();
  }, [api.baseUrl]);

  const runAction = async action => {
    setBusy(true);
    try {
      const result = await action();
      Snackbar.show({
        text: translateStatus(result.status),
        duration: Snackbar.LENGTH_LONG,
        textColor: 'green',
        marginBottom: 5,
      });
      refresh();
    } catch (error) {
      showError(error);
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = point => {
    Alert.alert(
      'Smazat měření',
      `Opravdu smazat ${point.name} (${locationText(point.location)})? Soubor zmizí ze serveru.`,
      [
        { text: 'Zrušit', style: 'cancel' },
        {
          text: 'Smazat',
          style: 'destructive',
          onPress: () => runAction(() => api.deletePoint(point.name)),
        },
      ],
    );
  };

  const showDetail = async point => {
    try {
      const detail = await api.pointDetail(point.name);
      Alert.alert(
        point.name,
        `Uloženo na: ${locationText(detail.location)}\n` +
          `Soubory: ${detail.point_files?.join(', ') ?? '-'}\n` +
          `Velikost: ${formatBytes(point.size_bytes)}\n` +
          `Změněno: ${formatNsDate(point.modified_ns)}`,
      );
    } catch (error) {
      showError(error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.buttonContainer}>
      <View>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.description}>
          {locationText(item.location)}, {formatBytes(item.size_bytes)}
        </Text>
      </View>
      <View style={styles.nastCenter}>
        <TouchableOpacity onPress={() => showDetail(item)}>
          <Icon name="info" size={30} paddingRight={20} color={'black'} />
        </TouchableOpacity>
        {item.location === 'local' && (
          <TouchableOpacity
            disabled={busy}
            onPress={() => runAction(() => api.downloadPoint(item.name, true))}>
            <Icon name="usb" size={30} paddingRight={20} color={'black'} />
          </TouchableOpacity>
        )}
        <TouchableOpacity disabled={busy} onPress={() => confirmDelete(item)}>
          <Icon name="trash" size={30} color={'red'} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.mntpTable}>
      {!api.hasServer && (
        <Text style={styles.description}>Adresa serveru zatím není známa.</Text>
      )}
      {storage != null && (
        <View>
          <Text style={styles.description}>
            Nové měření se uloží na: {locationText(storage.writing_to)}
          </Text>
          <Text style={styles.description}>
            {storage.usb_mounted
              ? `Volno na USB: ${formatBytes(storage.usb_free_bytes)}`
              : 'USB disk není připojen.'}
          </Text>
        </View>
      )}
      <View style={styles.buttonContainer}>
        <Button title="Obnov seznam" disabled={busy} onPress={refresh} />
        <Button
          title="Vše na USB"
          disabled={busy || !api.hasServer}
          onPress={() => runAction(() => api.downloadAll(true))}
        />
      </View>
      {points.length === 0 && api.hasServer && (
        <Text style={styles.description}>Na serveru není žádné statické měření.</Text>
      )}
      <FlatList
        data={points}
        renderItem={renderItem}
        keyExtractor={item => `${item.location}-${item.name}`}
        scrollEnabled={false}
      />
    </View>
  );
};
