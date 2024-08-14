import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, AppState } from 'react-native';
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
import base64 from 'react-native-base64';

export default function App(): JSX.Element {
  const [nmeaParsed, setNmeaParsed] = useState('');
  const [rawMeasurement, setRawMeasurement] = useState('');
  const [lastGGA, setLastGGA] = useState<any>(null);
  const [data, setData] = useState(configurationData);

  const updateData = (newSettings: any) => {
    setData(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  };

  const { setDataStorage, getDataStorage, clearDataStorage } = useAsyncStorage(updateData);

  const getNmeaRead = (parsed: any) => {
    //console.log(parsed);
    setNmeaParsed(parsed);
  };

  const {
    requestPermissions,
    scanForPeripherals,
    connectToDevice,
    allDevices,
    connectedDevice,
    disconnectFromDevice,
    setRtcmNtrip,
    startSendingNtripData,
  } = useBLE(getNmeaRead);

  const valueContext = { data, updateData };
  const getRtcmNtrip = (rtcmNtrip: any) => {
    const encodedData = base64.encodeFromByteArray(rtcmNtrip);
    setRtcmNtrip(encodedData);
    //console.log("Ntrip - rtcm -", rtcmNtrip);
  };

  const [modalType, setmodalType] = useState({
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
  };

  useEffect(() => {
    getDataStorage();
    // Force written GGA
    setLastGGA("$GNGGA,172814.0,3723.46587704,N,12202.26957864,W,2,6,1.2,18.893,M,-25.669,M,2.0 0031*4F"); // Comment out
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
          updateModalType={updateModalType}
        />
        <View>
          {modalType.bluetooth && <Bluetooth 
            getNmeaRead={getNmeaRead} 
            requestPermissions={requestPermissions}
            scanForPeripherals={scanForPeripherals} 
            connectToDevice={connectToDevice} 
            allDevices={allDevices} 
            connectedDevice={connectedDevice} 
            disconnectFromDevice={disconnectFromDevice}
          />}
          {modalType.ntrip && <Ntrip getRtcmNtrip={getRtcmNtrip} lastGGA={lastGGA} startSendingNtripData={startSendingNtripData} connectedDevice={connectedDevice}/>}
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
