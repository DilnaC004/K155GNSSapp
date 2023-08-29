import React, {useState, useEffect, useContext, forwardRef} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Button,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
} from 'react-native';
//import { BleManager, Device } from 'react-native-ble-plx';
import {DataContext} from '../Functions/DataContext';
import SelectDropdown from 'react-native-select-dropdown';
import RNBluetoothClassic, {
  BluetoothEventType,
} from 'react-native-bluetooth-classic';
import Snackbar from 'react-native-snackbar';

//import useBLE from '../hooks/useBLE';
import {styles} from '../Styles/styles';
import NmeaViewer from './NmeaViewer';

export const Bluetooth = ({rtcmNtrip, getNmeaRead}) => {
  const {data, updateData} = useContext(DataContext);

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
  const [nmeaRead, setNmeaRead] = useState([]);

  /*
  const {
    requestPermissions,
    scanForPeripherals,
    allDevices,
    connectToDevice,
    connectedDevice,
    disconnectFromDevice,
  } = useBLE();
  */

  const scanForDevices = async () => {
    /*
    requestPermissions(isGranted => {
      if (isGranted) {
        //console.log('permission granted');
        scanForPeripherals();
        //console.log(allDevices);
      }
    });
*/
    try {
      let paired = await RNBluetoothClassic.getBondedDevices();
      const pairedDeviced = paired;
      updateBluetoothSettings({devices: pairedDeviced});
      let unpaired = await RNBluetoothClassic.startDiscovery();
      const unpairedDeviced = paired;
      //setDevices([...devices, unpairedDeviced]);

      //console.log(devices);
    } catch (err) {
      console.log('error:', err);
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
      updateBluetoothSettings({isEnabled: !bluetoothSettings.isEnabled});
    }
  };

  const startBluetoothConnection = async () => {
    if (bluetoothSettings.connectedDeviceClassic !== null) {
      try {
        await RNBluetoothClassic.connectToDevice(
          bluetoothSettings.connectedDeviceClassic.address,
          {
            CONNECTOR_TYPE: 'rfcomm',
            DELIMITER: '\n',
            DEVICE_CHARSET: 'ascii',
          },
        );
        console.log(
          'Connecting to ' + bluetoothSettings.connectedDeviceClassic.name,
        );
        updateBluetoothSettings({isEnabled: !bluetoothSettings.isEnabled});
      } catch (err) {
        console.log(err);
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

  const readBluetoothConnection = async () => {
    //console.log(connectedDeviceClassic.address);
    try {
      let readDataAvailable = await RNBluetoothClassic.availableFromDevice(
        bluetoothSettings.connectedDeviceClassic.address,
      );
      if (readDataAvailable > 0) {
        for (let i = 0; i < readDataAvailable; i++) {
          let readData = await RNBluetoothClassic.readFromDevice(
            bluetoothSettings.connectedDeviceClassic.address,
          );
          //setNmeaRead(prevData => [...prevData, readData]);
          getNmeaRead(readData);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const setReadBluetoothConnection = () => {
    let intervalId;

    if (
      !bluetoothSettings.isEnabled &&
      bluetoothSettings.connectedDeviceClassic !== null
    ) {
      intervalId = setInterval(() => {
        readBluetoothConnection();
      }, 1000);
    }
    if (bluetoothSettings.isEnabled) {
      console.log('clear interval');
      clearInterval(intervalId);
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
        renderDropdownIcon={() => {}}
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
      <NmeaViewer nmeaMessages={nmeaRead} />
    </View>
  );
};

export default Bluetooth;
