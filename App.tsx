import React, {useState, useEffect} from 'react';
import {SafeAreaView, View, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GPS from 'gps';

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

export default function App(): JSX.Element {
  const gps = new GPS();
  const [nmeaParsed, setNmeaParsed] = React.useState('');
  const [rtcmNtrip, setRtcmNtrip] = React.useState<any>(null);
  const [nmeaRead, setNmeaRead] = React.useState<any>(null);

  const [data, setData] = useState({
    projects: [
      {
        title: 'Test',
        date: '14.2.2014',
        description: 'Toto je pouze test, autodestrukce mobilu za 3, 2, 1 .',
        points: [{    title: 'Test',
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
        code: 'test',}],
      },
    ],
    codes: null,
    ntripSettings: null,
    pointSettings: null,
    projectSettings: null,
    bluetoothSettings:null,
  });
  const updateData = (newSettings: any) => {
    setData(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  };
  const valueContext = {data, updateData}; // Provide valueContext to all components in App
  const [ntripSettings, setNtripSettings] = useState({
    ntripIp: '195.245.209.181',
    ntripPort: '2101',
    ntripUsername: 'cvutvyuka',
    ntripPassword: 'k155dremejakokone',
    selectedMntp: null,
    mountpoints: [],
    ntripConnect: false,
  });
  const updateNtripSettings = (newSettings: any) => {
    setNtripSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  };
  const [pointSettings, setPointSettings] = useState({
    title: '',
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
  });
  const updatePointSettings = (newSettings: any) => {
    setPointSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  };
  const [projectSettings, setProjectSettings] = useState({
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
  });
  const updateProjectSettings = (newSettings: any) => {
    setProjectSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  };
  const [bluetoothSettings, setBluetoothSettings] = useState({
    isEnabled: false,
    devices: [],
    connectedDeviceClassic: null,
  });
  const updateBluetoothSettings = (newSettings: any) => {
    setBluetoothSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  };
  const getRtcmNtrip = (rtcmNtrip: any) => {
    setRtcmNtrip(rtcmNtrip);
  };
  const getNmeaRead = (nmeaRead: any) => {
    setNmeaRead(nmeaRead);
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
  const setObjectValue = async (value: any) => {
    const jsonValue = JSON.stringify(value);
    AsyncStorage.setItem('key', jsonValue)
      .then(() => console.log('Saved data into Storage ' + value))
      .catch(e => {
        console.log(e);
      });
  };
  const getObjectValue = async () => {
    try {
      const dataStorage = await AsyncStorage.getItem('key');
      if (dataStorage) {
        setData(JSON.parse(dataStorage)); // You need to have a state variable "data" to set the parsed data.
      }
    } catch (e) {
      console.log(e);
    }
  };
  const clearStorage = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert('Storage successfully cleared!');
    } catch (e) {
      Alert.alert('Failed to clear the async storage.');
    }
  };
  
  const updateCoordinates = (
    nazevBodu: string,
    coordX: number,
    coordY: number,
    coordZ: number,
    coordAccuX: number,
    coordAccuY: number,
    coordAccuZ: number,
    coordPDOP: number,
    coordMeasuredTime: number,
  ) => {
      /*
    if (nazevBodu == '') {
      Alert.alert('Vlož název bodu');
    }

    const newPoint = {
      title: nazevBodu,
      b: coordX,
      l: coordY,
      h: coordZ - pointSettings.height - pointSettings.offset,
      accuB: coordAccuX,
      accuL: coordAccuY,
      accuH: coordAccuZ,
      pdop: coordPDOP,
      time: coordMeasuredTime,
      ofset: pointSettings.offset,
      antena: pointSettings.height,
      code: pointSettings.code,
      date: new Date().toLocaleString(),
    };

    updatePointSettings({
      b: coordX,
      l: coordY,
      h: coordZ - pointSettings.height - pointSettings.offset,
      accuB: coordAccuX,
      accuL: coordAccuY,
      accuH: coordAccuZ,
      pdop: coordPDOP,
      time: coordMeasuredTime,
      date: new Date().toLocaleString(),
    });

    // Log the received values
    if (projectSettings.projectId != null) {
      console.log('Point saved into project: ' + data[projectSettings.projectId].title);
      const updatedData = data.projects.map((project: any, index: number) => {
        if (index === projectSettings.projectId) {
          const updatedPoints = [...project.points, newPoint];
          return {...project, points: updatedPoints};
        }
        return project;
      });
      setData(updatedData);
      setObjectValue(updatedData); // save all data do asyncStorage
    } else {
      Alert.alert('Vyber zakázku');
    }
    */
  };
 
  useEffect(() => {
    // Add an event listener on all protocols
    gps.on('data', parsed => {
      setNmeaParsed(parsed);
    });

    console.log(nmeaRead);
    console.log(rtcmNtrip);

    gps.update(
      '$GPGGA,224900.000,4832.3762,N,01403.5393,E,1,04,7.8,498.6,M,48.0,M,,0000*5E',
    );
  }, [rtcmNtrip, nmeaRead]);
 
  useEffect(() => {
    if (!data.projects) {
      getObjectValue();
    }
    console.log(rtcmNtrip);
  }, []);

  return (
    <SafeAreaView>
      <DataContext.Provider value={valueContext}>
      <Header
        nmeaParsed={nmeaParsed}
        modalType={modalType}
        updateModalType={updateModalType}></Header>
      <View>
        {modalType.bluetooth && (
          <Bluetooth
            bluetoothSettings={bluetoothSettings}
            updateBluetoothSettings={updateBluetoothSettings}
            rtcmNtrip={rtcmNtrip}
            getNmeaRead={getNmeaRead}
          />
        )}
        {modalType.ntrip && (
          <Ntrip
            ntripSettings={ntripSettings}
            updateNtripSettings={updateNtripSettings}
            getRtcmNtrip={getRtcmNtrip}
          />
        )}
        {modalType.project && (
          <Project
            pointSettings={pointSettings}
            updatePointSetting={updatePointSettings}
            projectSettings={projectSettings}
            updateProjectSettings={updateProjectSettings}
            clearStorage={clearStorage}
          />
        )}
        {modalType.point && (
          <Point
            pointSettings={pointSettings}
            updatePointSettings={updatePointSettings}
          />
        )}
        {modalType.measurement && (
          <Measurement
            nmeaParsed={nmeaParsed}
            updateCoordinates={updateCoordinates}
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
