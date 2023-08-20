import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { SafeAreaView, View, Text, Button, PermissionsAndroid, Platform, TouchableOpacity} from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import SelectDropdown from 'react-native-select-dropdown';
import RNBluetoothClassic, { BluetoothEventType } from 'react-native-bluetooth-classic';


import useBLE from '../hooks/useBLE';
import { styles } from '../Styles/styles';
import NmeaViewer from './NmeaViewer';

export const Bluetooth = ({nmeaRead, setNmeaRead}, ref) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoopRun, setIsLoopRun] = useState(false);
  const [devices, setDevices] = useState([]);
  const [connectedDeviceClassic, setCoonectedDevicesClassic] = useState(null);
  const bluetoothSelectRef = useRef();
  const switchConnect = isEnabled ? 'Připoj' : 'Odpoj';
  let intervalId;


  const {
    requestPermissions,
    scanForPeripherals,
    allDevices,
    connectToDevice,
    connectedDevice,
    disconnectFromDevice,
  } = useBLE();

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
      setDevices(pairedDeviced);
      let unpaired = await RNBluetoothClassic.startDiscovery();
      const unpairedDeviced = paired;
      //setDevices([...devices, unpairedDeviced]);

      //console.log(devices);

    } catch (err) {
      console.log('error:', err);
    }

  };

  const stopBluetoothConnection = async () => {
    RNBluetoothClassic.disconnectFromDevice(connectedDeviceClassic.address);
    console.log('Disconnected from ' + connectedDeviceClassic.name);
    setCoonectedDevicesClassic(null);
    clearInterval(intervalId); // WHY THIS IS NOT WORKING ? !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  }

  const startBluetoothConnection = async () => {
    try{
      await RNBluetoothClassic.connectToDevice(connectedDeviceClassic.address, {
        CONNECTOR_TYPE: 'rfcomm',
        DELIMITER: '\n',
        DEVICE_CHARSET: 'ascii',
      });
      console.log('Connecting to ' + connectedDeviceClassic.name);
    } catch (err) {
      console.log(err);
      setIsEnabled(true);
    }
  };

  const readBluetoothConnection = async () => {
    //console.log(connectedDeviceClassic.address); 
      try{
        let readDataAvailable = await RNBluetoothClassic.availableFromDevice(connectedDeviceClassic.address);
        if(readDataAvailable > 0){
          setNmeaRead([]); // Emty data to read new

          for (let i = 0; i < readDataAvailable; i++) {
            let readData = await RNBluetoothClassic.readFromDevice(connectedDeviceClassic.address);
            //setNmeaRead(prevData => [...prevData, readData]);
            setNmeaRead(readData);
          }
        }
      } catch (err) {
        console.log(err);
      }

  }

  const setReadBluetoothConnection = () =>{
    if(!isEnabled && connectedDeviceClassic != null){
    intervalId = setInterval(() => {
      readBluetoothConnection();
    }, 1000);
  }
  }

  useEffect(() => {
    setReadBluetoothConnection();

    return () => {};
  }, [isEnabled]);

  return (
    <View 
    ref={ref}>
      <Text style={styles.title}>Nastavení Bluetooth připojení:</Text>
      <Button
        title="Scan for Bluetooth devices"
        onPress={() => {
          scanForDevices();
        }}
      />
      <SelectDropdown
        style={styles.selectDropdown}
        ref={bluetoothSelectRef}
        data={devices.map(mntp => mntp.name)}
        disabled={devices.length === 0}
        defaultValueByIndex={0}
        defaultButtonText="žádné připojené zařízení"
        buttonStyle={styles.dropdownBtnStyle}
        onSelect={(_, index) => {
            setCoonectedDevicesClassic(devices[index]);
            setIsEnabled(!isEnabled);
          }}
        renderDropdownIcon={() => {}}
        dropdownIconPosition={'right'}
      />
      <Button
        title={switchConnect}
        onPress={() => {
          if(isEnabled){
            startBluetoothConnection();
            setIsEnabled(!isEnabled);
          } else {
            stopBluetoothConnection();
            setIsEnabled(!isEnabled);
          }
        }}
      />
    </View>
  );
};

export default React.forwardRef(Bluetooth);

/*
      <View>
        <NmeaViewer nmeaMessages={nmeaRead} />
      </View>
*/