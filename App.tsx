import React, {useState, useEffect} from 'react';
import {SafeAreaView, View, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GPS from 'gps';
import RNFS from 'react-native-fs';
import Snackbar from 'react-native-snackbar';
import useAsyncStorage from './components/Functions/AsyncStorageFunction';
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

export default function App(): JSX.Element {
  const gps = new GPS();
  const [nmeaParsed, setNmeaParsed] = React.useState('');
  const [rawMeasurement, setRawMeasurement] = React.useState('');
  const [rtcmNtrip, setRtcmNtrip] = React.useState<any>(null);
  const [lastGGA, setLastGGA] = React.useState<any>(null);

  const { setDataStorage, getDataStorage, clearDataStorage } = useAsyncStorage();

  const [data, setData] = React.useState(configurationData);
  const updateData = (newSettings: any) => {
    setData(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  };
  const getNmeaRead = (nmeaRead: any) => {

    setRawMeasurement(nmeaRead);

    for(let i = 0; i < nmeaRead.length; i++){
      if(nmeaRead[i].includes("$GNGGA")){
        setLastGGA(nmeaRead[i]);
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

  useEffect(() => {
    const retrievedData = getDataStorage();
    console.log(retrievedData);
    if(!retrievedData){
      setData(retrievedData);
      Snackbar.show({
        text: `Data načtena z databáze`,
        duration: Snackbar.LENGTH_SHORT,
        textColor: 'red',
        marginBottom: 5,
      });
    }

    setDataStorage(data);

    return () => {
      setDataStorage(data);
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
          {modalType.placing && <Placing />}
          {modalType.map && <Map />}
          {modalType.skyplot && <Skyplot />}
        </View>
      </DataContext.Provider>
    </SafeAreaView>
  );
}
