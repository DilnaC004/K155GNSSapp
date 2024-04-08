import React, {useState, useEffect} from 'react';
import {SafeAreaView, View, AppState, PermissionsAndroid, Platform, Button } from 'react-native';
import GPS from 'gps';
import useAsyncStorage from './components/hooks/useAsyncStorage';
import Header from './components/Header';
import Measurement from './components/Measurement';
import Ntrip from './components/Header/Ntrip';
import Bluetooth from './components/Header/Bluetooth';
import Project from './components/Header/Project';
import Skyplot from './components/Header/Skyplot';
import Point from './components/Header/Point';
import Map from './components/Header/Map';
import Placing from './components/Header/Placing';
import {DataContext} from './components/Functions/DataContext';
import configurationData from './components/configurationData';

import { BleManager, Device, State } from 'react-native-ble-plx' 
import Snackbar from 'react-native-snackbar';

export default function App(): JSX.Element {
  const gps = new GPS();
  const [nmeaParsed, setNmeaParsed] = React.useState('');
  const [rawMeasurement, setRawMeasurement] = React.useState('');
  const [rtcmNtrip, setRtcmNtrip] = React.useState<any>(null);
  const [lastGGA, setLastGGA] = React.useState<any>(null);
  const [manager, setManager] = useState<any>(null);
  const [scanning, setScanning] = useState(false);
  const [data, setData] = React.useState(configurationData);
  const updateData = (newSettings: any) => {
    setData(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  };
  const { setDataStorage, getDataStorage, clearDataStorage } = useAsyncStorage(updateData);

  const getNmeaRead = (nmeaRead: any) => {

    setRawMeasurement(nmeaRead);

    for(let i = 0; i < nmeaRead.length; i++){
      if(nmeaRead[i].includes("$GNGGA")){
        setLastGGA(nmeaRead[i]); // for RTCM 
        //console.log(nmeaRead[i]);
        gps.update(nmeaRead[i]);
      }
    }

    gps.on('data', parsed => {
      setNmeaParsed(parsed);
    });
  };
  const valueContext = {data, updateData}; // Provide valueContext to all components in App
  const getRtcmNtrip = (rtcmNtrip: any) => {
    setRtcmNtrip(rtcmNtrip);
    console.log(rtcmNtrip);
  };
  const [modalType, setmodalType] = React.useState({
    point: false,
    placing: false,
    skyplot: false,
    bluetooth: false,
    ntrip: false,
    project: false,
    map: false,
    measurement: true,
  });
  const updateModalType = (newSettings: any) => {
    setmodalType(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  };

  const handleAppStateChange = (nextAppState:any) => {
    if (nextAppState === 'background') {
      console.log('the app is closed');
      setDataStorage(data);
    }    
  }

  useEffect(() => {
    getDataStorage();

    const appStateId = AppState.addEventListener('change', handleAppStateChange);

    if (!manager) {
      const bleManager = new BleManager();
      setManager(bleManager);
    }

    return () => {
      setDataStorage(data);
      appStateId.remove();
    };
  }, []);

  const requestBluetoothPermission = async () => {
    if (Platform.OS === 'ios') {
      return true
    }
    if (Platform.OS === 'android' && PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION) {
      const apiLevel = parseInt(Platform.Version.toString(), 10)
  
      if (apiLevel < 31) {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
        return granted === PermissionsAndroid.RESULTS.GRANTED
      }
      if (PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN && PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT) {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        ])
  
        return (
          result['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
        )
      }
    }
    Snackbar.show({
      text: 'Permission have not been granted', // Access the error message using err.message
      duration: Snackbar.LENGTH_SHORT,
      textColor: 'red',
      marginBottom: 5,
    });
  
    return false
  }

  const scanForDevices = async () => {
    if (!scanning) {
      setScanning(true);
      try {
        const permissionGranted = await requestBluetoothPermission();
        if (permissionGranted) {
          console.log("scanning")
          manager.startDeviceScan(null, null, (error: any, device: any) => {
            console.log(device);
            if (error) {
              console.error("Error scanning for devices:", error);
              return;
            }
            if (device) {
              console.log("Found device:", device.name);
              // Handle the discovered device here
            }
          });
        }
      } catch (error) {
        console.error("Error scanning for devices:", error);
      } finally {
        setScanning(false);
      }
    }
  };

  return (
    <SafeAreaView>
      <DataContext.Provider value={valueContext}>
        <Header
          nmeaParsed={nmeaParsed}
          modalType={modalType}
          updateModalType={updateModalType}></Header>
          <Button title='Scan Bluetooth Devices' onPress={scanForDevices} />
        <View>
          {modalType.bluetooth && <Bluetooth rtcmNtrip={rtcmNtrip} getNmeaRead={getNmeaRead}/>}
          {modalType.ntrip && <Ntrip getRtcmNtrip={getRtcmNtrip} lastGGA={lastGGA} />}
          {modalType.project && <Project clearStorage={clearDataStorage} />}
          {modalType.point && <Point />}
          {modalType.measurement && (
            <Measurement
              nmeaParsed={nmeaParsed}
              rawMeasurement={rawMeasurement}
            />
          )}
          {modalType.placing && <Placing nmeaParsed={nmeaParsed}/>}
          {modalType.map && <Map />}
          {modalType.skyplot && <Skyplot />}
        </View>
      </DataContext.Provider>
    </SafeAreaView>
  );
}
