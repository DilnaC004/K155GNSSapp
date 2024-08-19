import React, { useState, useEffect, useContext, forwardRef } from 'react';
import { View, Text, Button, StatusBar, PermissionsAndroid, Platform } from 'react-native';
import { DataContext } from '../Functions/DataContext';
import SelectDropdown from 'react-native-select-dropdown';
//import RNBluetoothClassic from 'react-native-bluetooth-classic';
import { BleManager } from 'react-native-ble-plx'
import Snackbar from 'react-native-snackbar';
import { styles } from '../Styles/styles';
import NmeaViewer from './NmeaViewer';
import useBLE from '../hooks/useBLE';

export const manager = new BleManager()

export default Bluetooth = ({ getNmeaRead, requestPermissions, scanForPeripherals, connectToDevice, allDevices, connectedDevice, disconnectFromDevice}) => {
  const { data, updateData } = useContext(DataContext);
  const [intervalId, setIntervalId] = useState(0);
  const [bluetoothSettings, setBluetoothSettings] = useState(
    data.bluetoothSettings,
  );
  const switchConnect = bluetoothSettings.isEnabled ? 'Připoj' : 'Odpoj';
 // Use the useBLE hook

  const updateBluetoothSettings = newSettings => {
    const updatedSettings = { ...bluetoothSettings, ...newSettings };
    setBluetoothSettings(updatedSettings);
    updateData({ bluetoothSettings: updatedSettings });
  };

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

  return (
    <View>
      <Text style={styles.title}>Nastavení Bluetooth připojení:</Text>
      <Button
        title={bluetoothSettings.isEnabled ? 'Stop' : 'Scan'}
        onPress={() => {
          if (!bluetoothSettings.isEnabled) {
            scanForDevices();
            updateBluetoothSettings({ isEnabled: !bluetoothSettings.isEnabled, });
          } else {
            console.log("cleaning devices")
            updateBluetoothSettings({ isEnabled: !bluetoothSettings.isEnabled, devices: [] });
            console.log(bluetoothSettings.devices)
          }
          
        }}
      />
      {bluetoothSettings.isEnabled && allDevices.map(device => (
        <Button
          key={device.id}
          title={device.name ? device.name : device.id}
          color={connectedDevice?.id == device.id ? 'red' : 'blue'}
          onPress={() => {
            if (connectedDevice?.id == device.id && connectedDevice != null){
              disconnectFromDevice();
              updateBluetoothSettings({ isConnected: false });
            }
            else if (bluetoothSettings.isEnabled) {
              connectToDevice(device);
              updateBluetoothSettings({ isConnected: true });
              getNmeaRead(data);
            }
          }}
        />
      ))}

      <NmeaViewer nmeaMessages={data.nmeaRead} />
    </View>
  );
};