import React, { useState, useEffect, useContext, forwardRef } from 'react';
import { View, Text, Button, PermissionsAndroid, Platform } from 'react-native';
import { DataContext } from '../Functions/DataContext';
import SelectDropdown from 'react-native-select-dropdown';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import Snackbar from 'react-native-snackbar';
import { styles } from '../Styles/styles';
import NmeaViewer from './NmeaViewer';

export default Bluetooth = ({ rtcmNtrip, getNmeaRead }) => {
  const { data, updateData } = useContext(DataContext);
  const [intervalId, setIntervalId] = useState(0);
  const [bluetoothSettings, setBluetoothSettings] = useState(
    data.bluetoothSettings,
  );

  const updateBluetoothSettings = newSettings => {
    setBluetoothSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  };

  const switchConnect = bluetoothSettings.isEnabled ? 'Připoj' : 'Odpoj';

  const scanForDevices = async () => {
    const androidVersion = Platform.constants['Release'];
    console.log('SDK ' + androidVersion);
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: 'Bluetooth scan permission',
        message: 'K155GNSSapp need permission to scan Bluetooth devices ',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED || androidVersion < 12) {
      try {
        console.log('Access granted');
        let paired = await RNBluetoothClassic.getBondedDevices();
        const pairedDevices = paired;
        updateBluetoothSettings({devices: pairedDevices});
      } catch (err) {
        Snackbar.show({
          text: err.message, // Access the error message using err.message
          duration: Snackbar.LENGTH_SHORT,
          textColor: 'red',
          marginBottom: 5,
        });
      }
    } else {
      Snackbar.show({
        text: 'Nemáš povolení', // Access the error message using err.message
        duration: Snackbar.LENGTH_SHORT,
        textColor: 'red',
        marginBottom: 5,
      });
    }
  };
  
  /*
    if (granted === PermissionsAndroid.RESULTS.GRANTED || androidVersion<12){
  } else {
    console.log('Access not granted')
  }
  */

  const stopBluetoothConnection = async () => {
    if (bluetoothSettings.connectedDeviceClassic !== null) {
      RNBluetoothClassic.disconnectFromDevice(
        bluetoothSettings.connectedDeviceClassic.address,
      );
      console.log(
        'Disconnected from ' + bluetoothSettings.connectedDeviceClassic.name,
      );
      updateBluetoothSettings({ isEnabled: !bluetoothSettings.isEnabled });
    }
    clearInterval(intervalId);
  };

  const startBluetoothConnection = async () => {
    if (bluetoothSettings.connectedDeviceClassic !== null) {
      try {
        await RNBluetoothClassic.connectToDevice(
          bluetoothSettings.connectedDeviceClassic.address,
          {
            CONNECTOR_TYPE: 'rfcomm',
            DEVICE_CHARSET: 'ascii',
          },
        );
        console.log(
          'Connecting to ' + bluetoothSettings.connectedDeviceClassic.name,
        );
        updateBluetoothSettings({ isEnabled: !bluetoothSettings.isEnabled });
      } catch (err) {
        console.log(err);
        Snackbar.show({
          text: 'Nelze se připojit, zkuste znovu',
          duration: Snackbar.LENGTH_SHORT,
          textColor: 'red',
          marginBottom: 5,
        });
        updateBluetoothSettings({ isEnabled: true });
      }
    } else {
      Snackbar.show({
        text: 'Vyber Bluetooth zařízení',
        duration: Snackbar.LENGTH_SHORT,
        textColor: 'red',
        marginBottom: 5,
      });
    }
  };

  const readBluetoothConnection = async () => {
    try {
      var storeData = [];
      let readDataAvailable = await RNBluetoothClassic.availableFromDevice(
        bluetoothSettings.connectedDeviceClassic.address,
      );
      if (readDataAvailable > 0) {
        for (let i = 0; i < readDataAvailable; i++) {
          let readData = await RNBluetoothClassic.readFromDevice(
            bluetoothSettings.connectedDeviceClassic.address,
          );
          storeData.push(readData);
        }
        getNmeaRead(storeData);
        updateData({ nmeaRead: storeData });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const setReadBluetoothConnection = () => {
    let newintervalId;
    if (
      !bluetoothSettings.isEnabled &&
      bluetoothSettings.connectedDeviceClassic !== null
    ) {
      newintervalId = setInterval(() => {
        readBluetoothConnection();
        sendRtcm();
      }, 1000);
      setIntervalId(newintervalId);
    } else {
      console.log('clear interval');
      clearInterval(intervalId);
    }
  };

  const sendRtcm = async () => {
    if (rtcmNtrip != null) {
      try {
        await RNBluetoothClassic.writeToDevice(
          bluetoothSettings.connectedDeviceClassic.address,
          rtcmNtrip,
          'ascii',
        );
        console.log('rtcm ' + rtcmNtrip);
      } catch (err) {
        console.log(err);
      }
    }
  };

  useEffect(() => {
    setReadBluetoothConnection();

    return () => {
      updateData({
        bluetoothSettings: bluetoothSettings,
      });
    };
  }, [bluetoothSettings.isEnabled]);

  return (
    <View>
      <Text style={styles.title}>Nastavení Bluetooth připojení:</Text>
      <Button
        title="Scan for Bluetooth devices"
        onPress={() => {
          scanForDevices();
        }}
      />
      <SelectDropdown
        style={styles.selectDropdown}
        data={bluetoothSettings.devices.map(mntp => mntp.name)}
        disabled={bluetoothSettings.devices.length === 0}
        defaultValueByIndex={0}
        defaultButtonText="žádné připojené zařízení"
        buttonStyle={styles.dropdownBtnStyle}
        onSelect={(_, index) => {
          updateBluetoothSettings({
            connectedDeviceClassic: bluetoothSettings.devices[index],
          });
        }}
        renderDropdownIcon={() => { }}
        dropdownIconPosition={'right'}
      />
      <Button
        title={switchConnect}
        onPress={() => {
          if (bluetoothSettings.isEnabled) {
            startBluetoothConnection();
          } else {
            stopBluetoothConnection();
          }
        }}
      />
      <NmeaViewer nmeaMessages={data.nmeaRead} />
    </View>
  );
};
