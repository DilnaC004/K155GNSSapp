import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, AppState, PermissionsAndroid, Platform, Button, Text } from 'react-native';
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
import { DataContext } from './components/Functions/DataContext';
import configurationData from './components/configurationData';
import useBLE from './components/hooks/useBLE';

export default function App(): JSX.Element {
  const [nmeaParsed, setNmeaParsed] = React.useState('');
  const [rawMeasurement, setRawMeasurement] = React.useState('');
  const [rtcmNtrip, setRtcmNtrip] = React.useState<any>(null);
  const [lastGGA, setLastGGA] = React.useState<any>(null);
  const [data, setData] = React.useState(configurationData);
  const updateData = (newSettings: any) => {
    setData(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  };
  const { setDataStorage, getDataStorage, clearDataStorage } = useAsyncStorage(updateData);
  const getNmeaRead = (parsed:any) => {
      setNmeaParsed(parsed);
      console.log(parsed.lon)
  };
  const {
    requestPermissions,
    scanForPeripherals,
    connectToDevice,
    allDevices,
    connectedDevice,
    disconnectFromDevice,
  } = useBLE(getNmeaRead, rtcmNtrip);
  
  const valueContext = { data, updateData }; // Provide valueContext to all components in App
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

  const handleAppStateChange = (nextAppState: any) => {
    if (nextAppState === 'background') {
      console.log('the app is closed');
      setDataStorage(data);
    }
  }

  useEffect(() => {
    getDataStorage();

    const appStateId = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      setDataStorage(data);
      appStateId.remove();
    };
  }, []);

  return (
    <SafeAreaView>
      <DataContext.Provider value={valueContext}>
        <Header
          nmeaParsed={nmeaParsed}
          modalType={modalType}
          updateModalType={updateModalType}></Header>
        <View>
          {modalType.bluetooth && <Bluetooth rtcmNtrip={rtcmNtrip} getNmeaRead={getNmeaRead} requestPermissions={requestPermissions}
            scanForPeripherals={scanForPeripherals} connectToDevice={connectToDevice} allDevices={allDevices} connectedDevice={connectedDevice} 
            disconnectFromDevice={disconnectFromDevice}/>}
          {modalType.ntrip && <Ntrip getRtcmNtrip={getRtcmNtrip} lastGGA={lastGGA} />}
          {modalType.project && <Project clearStorage={clearDataStorage} />}
          {modalType.point && <Point />}
          {modalType.measurement && (
            <Measurement
              nmeaParsed={nmeaParsed}
              rawMeasurement={rawMeasurement}
            />
          )}
          {modalType.placing && <Placing nmeaParsed={nmeaParsed} />}
          {modalType.map && <Map />}
          {modalType.skyplot && <Skyplot />}
        </View>
      </DataContext.Provider>
    </SafeAreaView>
  );
}
