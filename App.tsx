import React, {useState, useEffect} from 'react';
import {SafeAreaView, View, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GPS from 'gps';
import RNFS from 'react-native-fs';
import Snackbar from 'react-native-snackbar';
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

export default function App(): JSX.Element {
  const gps = new GPS();
  const [nmeaParsed, setNmeaParsed] = React.useState('');
  const [rawMeasurement, setRawMeasurement] = React.useState('');
  const [rtcmNtrip, setRtcmNtrip] = React.useState<any>(null);
  const [lastGGA, setLastGGA] = React.useState<any>(null);


  const [data, setData] = useState({
    firstLoad: true,
    projects: [
      {
        title: 'Test',
        date: '14.2.2014',
        description: 'Toto je pouze test, autodestrukce mobilu za 3, 2, 1 .',
        points: [
          {
            title: 'Test',
            b: 50,
            l: 14,
            h: 100,
            accuB: 0,
            accuL: 0,
            accuH: 0,
            pdop: 0,
            time: 0,
            date: 0,
            height: 0,
            offset: 0,
            code: 'test',
          },
        ],
      },
    ],
    codes: null,
    ntripSettings: {
      ntripIp: '195.245.209.181',
      ntripPort: '2101',
      ntripUsername: 'cvutvyuka',
      ntripPassword: 'k155dremejakokone',
      selectedMntp: null,
      mountpoints: [],
      ntripConnect: false,
      clientWrapper: null,
    },
    pointSettings: {
      title: '1',
      b: 0,
      l: 0,
      h: 0,
      accuB: 0,
      accuL: 0,
      accuH: 0,
      pdop: 0,
      time: 0,
      date: 0,
      height: 0,
      offset: 0,
      code: '',
    },
    projectSettings: {
      title: '',
      projectId: 0,
      date: '',
      description: '',
      projectPointCount: '',
      points: [],
      showFlatList: false,
      showPointFlatList: false,
      showCreateProject: false,
      showCreatePoint: false,
    },
    bluetoothSettings: {
      isEnabled: true,
      devices: [],
      connectedDeviceClassic: null,
    },
    measurementSettings: {
      nazev: 1,
      etrs: {
        b: 0,
        l: 0,
        h: 0,
      },
      jtsk: {
        X: 0,
        Y: 0,
        Hbpv: 0,
      },
      coordPDOP: 0,
      coordAccuX: 0,
      coordAccuY: 0,
      coordAccuZ: 0,
      coordMeasuredTime: 0,
      sumCoordX: 0,
      sumCoordY: 0,
      sumCoordZ: 0,
      boolRtk: false,
      boolRaw: false,
      formattedTime: '00:00:00',
      startTime: null,
      endTime: null,
      intervalRawMeasurement:0,
    },
    nmeaRead: [],
    rtcmNtrip: [],
    lastGGA: '',
  });
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
  const clearStorage = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert('Storage successfully cleared!');
    } catch (e) {
      Alert.alert('Failed to clear the async storage.');
    }
  };

  useEffect(() => {
    if (!data) {
      const dataStorage = AsyncStorage.getItem('key');
      if (dataStorage) {
        setData(JSON.parse(dataStorage.toString())); // You need to have a state variable "data" to set the parsed data.
      }
    } else {
      updateData({firstLoad: false});
    }
    return () => {
      const jsonValue = JSON.stringify(data);
      AsyncStorage.setItem('key', jsonValue)
        .then(() => console.log('Saved data into Storage ' + data))
        .catch(e => {
          console.log(e);
        });
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
          {modalType.project && <Project clearStorage={clearStorage} />}
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
