import React, { useState, useEffect, useContext, forwardRef } from 'react';
import { View, Text, Button, StatusBar, PermissionsAndroid, Platform, Switch } from 'react-native';
import { DataContext } from '../Functions/DataContext';
import SelectDropdown from 'react-native-select-dropdown';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import { BleManager } from 'react-native-ble-plx'
import Snackbar from 'react-native-snackbar';
import { styles } from '../Styles/styles';
import NmeaViewer from './NmeaViewer';
import useBLE from '../hooks/useBLE';
import GPS from 'gps';

export const manager = new BleManager()

export default Bluetooth = ({ getNmeaRead, requestPermissions, scanForPeripherals, connectToDevice, allDevices, connectedDevice, disconnectFromDevice, rtcmNtrip}) => {
  const { data, updateData } = useContext(DataContext);
  const [intervalId, setIntervalId] = useState(0);
  const [bluetoothSettings, setBluetoothSettings] = useState(
    data.bluetoothSettings,
  );
  const [isEnabled, setIsEnabled] = useState(true);
  const switchConnect = isEnabled ? 'BLE (IOS)' : 'Bluetooth Classic(Android)';
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
  const gps = new GPS();
 // Use the useBLE hook

  const updateBluetoothSettings = newSettings => {
    const updatedSettings = { ...bluetoothSettings, ...newSettings };
    setBluetoothSettings(updatedSettings);
    updateData({ bluetoothSettings: updatedSettings });
  };

  //BLE
  const scanForDevices = () => {
    requestPermissions(isGranted => {
      if (isGranted) {
        console.log("scanning");
        scanForPeripherals();
        setTimeout(() => {
          console.log(allDevices);
        }, 5000);
      }
    });
  };

  //Bluetooth Classic
  const scanForDevicesClassic = async () => {
    try {
      let paired = await RNBluetoothClassic.getBondedDevices();
      const pairedDeviced = paired;
      updateBluetoothSettings({devices: pairedDeviced});
      updateBluetoothSettings({isEnabled: !bluetoothSettings.isEnabled});
    } catch (err) {
      Snackbar.show({
        text: err,
        duration: Snackbar.LENGTH_SHORT,
        textColor: 'red',
        marginBottom: 5,
      });
    }
  };

  const stopBluetoothConnectionClassic = async () => {
    if (bluetoothSettings.connectedDeviceClassic !== null) {
      RNBluetoothClassic.disconnectFromDevice(
        bluetoothSettings.connectedDeviceClassic.address,
      );
      console.log(
        'Disconnected from ' + bluetoothSettings.connectedDeviceClassic.name,
      );
      updateBluetoothSettings({isEnabled: !bluetoothSettings.isEnabled});
    }
    clearInterval(intervalId);
  };

  const startBluetoothConnectionClassic = async () => {
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
        updateBluetoothSettings({isEnabled: !bluetoothSettings.isEnabled});
      } catch (err) {
        console.log(err);
        Snackbar.show({
          text: 'Nelze se připojit, zkuste znovu',
          duration: Snackbar.LENGTH_SHORT,
          textColor: 'red',
          marginBottom: 5,
        });
        updateBluetoothSettings({isEnabled: true});
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

  const readBluetoothConnectionClassic = async () => {
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
          if(readData.includes('$')){
            gps.updatePartial(readData);
            if (readData.includes('GNGGA')) {
              getLastGGA(readData);
            }
          }
          storeData.push(readData);
        }
        // Process NMEA sentence
        gps.on('data', parsed => {
          getNmeaRead(gps.state);
        });
        getNmeaRead(storeData);
        updateData({nmeaRead: storeData});
      }
    } catch (err) {
      console.log(err);
    }
  };

  const setReadBluetoothConnectionClassic = () => {
    let newintervalId;
    if (
      !bluetoothSettings.isEnabled &&
      bluetoothSettings.connectedDeviceClassic !== null
    ) {
      newintervalId = setInterval(() => {
        readBluetoothConnectionClassic();
        sendRtcmClassic();
      }, 1000);
      setIntervalId(newintervalId);
    } else {
      console.log('clear interval');
      clearInterval(intervalId);
    }
  };

  const sendRtcmClassic = async () => {
    if (rtcmNtrip && rtcmNtrip != null && rtcmNtrip != "") {
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
    console.log(isEnabled, bluetoothSettings.isEnabled, bluetoothSettings.devices);
    if(!isEnabled)  {
      setReadBluetoothConnectionClassic();
    } 
    return () => {
      if(!isEnabled)  {
        updateData({
          bluetoothSettings: bluetoothSettings,
        });
      } 
    };
  }, [bluetoothSettings.isEnabled, bluetoothSettings.devices]);

  return (
<View>
  <Text style={styles.title}>Nastavení Bluetooth připojení:</Text>
  <Text style={styles.tableData}>{switchConnect}</Text>
  <Switch
    trackColor={{ false: '#767577', true: '#81b0ff' }}
    thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
    ios_backgroundColor="#3e3e3e"
    onValueChange={toggleSwitch}
    value={isEnabled}
    style={styles.switch}
  />
  <Button
    title={bluetoothSettings.isEnabled ? 'Stop' : 'Scan'}
    onPress={() => {
      if (isEnabled) {
        scanForDevices();
      } else {
        scanForDevicesClassic();
      }
      updateBluetoothSettings({ isEnabled: !bluetoothSettings.isEnabled });
    }}
  />

  {isEnabled && bluetoothSettings.isEnabled && allDevices.map(device => (
    <Button
      key={device.id}
      title={device.name ? device.name : device.id}
      color={connectedDevice?.id === device.id ? 'red' : 'blue'}
      onPress={() => {
        if (connectedDevice?.id === device.id && connectedDevice != null) {
          disconnectFromDevice();
          updateBluetoothSettings({ isConnected: false });
        } else if (bluetoothSettings.isEnabled) {
          connectToDevice(device);
          updateBluetoothSettings({ isConnected: true });
        }
      }}
    />
  ))}

  {!isEnabled && bluetoothSettings.isEnabled && bluetoothSettings.devices.map(device => (
    <Button
      key={device.id}
      title={device.name ? device.name : device.id}
      color={connectedDevice?.id === device.id ? 'red' : 'blue'}
      onPress={() => {
          updateBluetoothSettings({ connectedDeviceClassic: device });
          Snackbar.show({
          text: 'Vybráno Bluetooth zařízení',
          duration: Snackbar.LENGTH_SHORT,
          textColor: 'red',
          marginBottom: 5,
          });
      }}
    />
  ))
  }

  {!isEnabled && bluetoothSettings.connectedDeviceClassic &&
    <Button
        title={bluetoothSettings.isEnabled ? 'Connect' : 'Disconnect'}
        onPress={() => {
          if (bluetoothSettings.isEnabled) {
            startBluetoothConnectionClassic();
            updateBluetoothSettings({ isConnected: true });
          } else {
            stopBluetoothConnectionClassic();
            updateBluetoothSettings({ isConnected: false });
          }
        }}
      />
  }

  <NmeaViewer nmeaMessages={data.nmeaRead} />
</View>
  );
};