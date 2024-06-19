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

export default Bluetooth = ({ rtcmNtrip, getNmeaRead }) => {
  const { data, updateData } = useContext(DataContext);
  const [intervalId, setIntervalId] = useState(0);
  const [bluetoothSettings, setBluetoothSettings] = useState(
    data.bluetoothSettings,
  );
  const switchConnect = bluetoothSettings.isEnabled ? 'Připoj' : 'Odpoj';
  const {
    requestPermissions,
    scanForPeripherals,
    connectToDevice,
    allDevices,
    connectedDevice,
    disconnectFromDevice,
    onDataReceived,
  } = useBLE(); // Use the useBLE hook

  const updateBluetoothSettings = newSettings => {
    setBluetoothSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  };

  const scanForDevices = () => {
    requestPermissions(isGranted => {
      if (isGranted) {
        console.log("scanning");
        scanForPeripherals();
        console.log(allDevices);
      }
    });
  };


  return (
    <View>
      <Text style={styles.title}>Nastavení Bluetooth připojení:</Text>
      <Button
        title={bluetoothSettings.isEnabled ? 'Stop' : 'Scan'}
        onPress={() => {
          scanForDevices();
          updateBluetoothSettings({ isEnabled: !bluetoothSettings.isEnabled, });
        }}
      />
      {bluetoothSettings.isEnabled && allDevices.map(device => (
        <Button
          key={device.id}
          title={device.id}
          // 18:62:E4:2B:CE:D4 je K155GNSS
          // 18:62:E4:29:F7:BC je 
          color={connectedDevice == device ? 'red' : 'blue'}  // Neobarvi tlacitko
          onPress={() => {
            if (bluetoothSettings.isEnabled) {
              connectToDevice(device);
              onDataReceived();
            } else {
              disconnectFromDevice(device);
            }
          }}
        />
      ))}

      <NmeaViewer nmeaMessages={data.nmeaRead} />
    </View>
  );
};

/*
  useEffect(() => {
    const stateChangeListener = manager.onStateChange(state => {
      console.log('onStateChange: ', state);
      if (state === State.PoweredOn) {
        scan();
      }
    });

    return () => {
      stateChangeListener?.remove();
    };
  }, [manager]); 

  useEffect(() => {
    setReadBluetoothConnection();

    return () => {
      updateData({
        bluetoothSettings: bluetoothSettings,
      });
    };
  }, [bluetoothSettings.isEnabled]);

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

  const requestBluetoothPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        {
          title: 'Bluetooth Permission',
          message: 'K155GNSSapp needs permission to use Bluetooth',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Bluetooth permission granted');
        Snackbar.show({
          text: 'Bluetooth permission granted', // Access the error message using err.message
          duration: Snackbar.LENGTH_SHORT,
          textColor: 'red',
          marginBottom: 5,
        });
      } else if (granted === PermissionsAndroid.RESULTS.DENIED){
        console.log('Bluetooth permission denied');
        Snackbar.show({
          text: 'Bluetooth permission denied', // Access the error message using err.message
          duration: Snackbar.LENGTH_SHORT,
          textColor: 'red',
          marginBottom: 5,
        });
      } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN){
        Snackbar.show({
          text: 'This app requires storage permission to function properly. Please enable the permission in the app settings.', // Access the error message using err.message
          duration: Snackbar.LENGTH_SHORT,
          textColor: 'red',
          marginBottom: 5,
        });
      }
    } catch (err) {
      console.error('Error requesting Bluetooth permission:', err);
    }
  };
  

  const getPermissions = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can BLE scan');
      } else {
        console.log('BLE scan permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };






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

  const readBleConnection = () => {
    manager.startDeviceScan(null, null, (error, device) => { 
      if (error) { 
        // Handle error (scanning will be stopped automatically) 
        return 
      } 
   
      // Check if it is a device, you are looking for based on advertisement data 
      // or other criteria. 
      if (device.name === 'TI BLE Sensor Tag' || device.name === 'SensorTag') { 
        // Stop scanning as it's not necessary if you are scanning for one device. 
  
        connect() 
        manager.stopDeviceScan() 
   
        // Proceed with connection. 
      } 
    }) 
  };
  */