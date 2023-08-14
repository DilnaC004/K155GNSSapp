import React, {useState, useEffect, useRef} from 'react';
import type {PropsWithChildren} from 'react';
import {SafeAreaView, StyleSheet, useColorScheme, View, Modal, Button, Alert} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GPS from 'gps';

import Header from './components/Header';
import Mereni from './components/Mereni';
import Bluetooth from './components/Header/Bluetooth'
import Ntrip from './components/Header/Ntrip'
import Project from './components/Header/Project'
import Skyplot from './components/Header/Skyplot';
import Point from './components/Header/Point';
import Map from './components/Header/Map';
import Placing from './components/Header/Placing';

function App(): JSX.Element {
  const gps = new GPS;
  const [isModalVisible, setModalVisible] = React.useState(false);
  const [ModalType, setModalType] = React.useState(String);

  const [coordStatus, setCoordStatus] = React.useState('black');
  const [nmeaParsed, setNmeaParsed] = React.useState('');
  const [newPoint, setNewPoint] = React.useState<any>(null);
  const [heightAntena, setHeightAntena] = React.useState(0);
  const [offsetAntena, setOffsetAntena] = React.useState(0);
  const [codePoint, setCodePoint] = React.useState('');

  const [projectId, setprojectId] = useState('null');
  const [data, setData] = React.useState<any>(null);

  const setObjectValue = async (value: any) => {
    const jsonValue = JSON.stringify(value)
    AsyncStorage.setItem('key', jsonValue).then(() => console.log('Done.')).catch(e => {console.log(e)});

  }

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


  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const updateCoordinates = (nazevBodu:string, coordX:number, coordY:number, coordZ:number, coordAccuX:number, coordAccuY:number, coordAccuZ:number, coordPDOP:number, coordMeasuredTime:number) => {

    if(nazevBodu== ''){
      Alert.alert('Vlož název bodu');
    }

    const newPoint = {
      title: nazevBodu,
      b: coordX,
      l: coordY,
      h: coordZ,
      accuB:coordAccuX,
      accuL:coordAccuY,
      accuH:coordAccuZ,
      pdop:coordPDOP,
      time:coordMeasuredTime,
      ofset:offsetAntena,
      antena: heightAntena,
      code: codePoint,
      date: new Date().toLocaleString(),
    };
    console.log(newPoint);
    console.log(data);
    console.log(projectId);

    // Log the received values
    if(projectId != 'null'){
      const updatedData = data.map((project, index) => {
        if (index === parseInt(projectId)) {
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
    
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
    setModalType('null');
  };
  
 useEffect(() => {
  // Add an event listener on all protocols
  gps.on('data', parsed => {
    setNmeaParsed(parsed);
    if(parsed.quality == 'fix'){
      setCoordStatus("green");
    }
    if(parsed.quality == 'float'){
      setCoordStatus("orange");
    }
  });

  gps.update(
    '$GPGGA,224900.000,4832.3762,N,01303.5393,E,1,04,7.8,498.6,M,48.0,M,,0000*5E',
  );

}, []);

useEffect(() => {
  if(!data){
    getObjectValue();
  }
}, []);

  return (
    <SafeAreaView style={backgroundStyle}>
      <Header 
      nmeaParsed={nmeaParsed} 
      coordStatus={coordStatus}
      setModalVisible={setModalVisible}
      isModalVisible={isModalVisible}
      setModalType={setModalType}
      ></Header>
      <Mereni nmeaParsed={nmeaParsed} updateCoordinates={updateCoordinates}></Mereni>

      <Modal visible={isModalVisible} animationType="slide">
          <Button title='↓ ↓ ↓' onPress={toggleModal}/>
        {ModalType == "point" && (
          <Point heightAntena={heightAntena} setHeightAntena={setHeightAntena} offsetAntena={offsetAntena} setOffsetAntena={setOffsetAntena} codePoint={codePoint} setCodePoint={setCodePoint}/>
        )}
        {ModalType == "bluetooth" && (
          <Bluetooth />
        )}
        {ModalType == "placing" && (
          <Placing/>
        )}
        {ModalType == "skyplot" && (
          <Skyplot/>
        )}
        {ModalType == "ntrip" && (
          <Ntrip nmeaParsed={nmeaParsed}/>
        )}
        {ModalType == "project" && (
          <Project 
          data={data} 
          setData={setData} 
          projectId={projectId} 
          setprojectId={setprojectId} 
          saveDataToAsyncStorage={setObjectValue}/>
        )}
        {ModalType == "map" && (
          <Map/>
        )}
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});

export default App;
