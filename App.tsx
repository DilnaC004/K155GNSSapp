import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, View, AppState } from 'react-native';
import useAsyncStorage from './components/hooks/useAsyncStorage';
import Header from './components/Header';
import Measurement from './components/Measurement';
import Ntrip from './components/Header/Ntrip';
import Communication from './components/Header/Communication';
import Project from './components/Header/Project';
import Skyplot from './components/Header/Skyplot';
import Point from './components/Header/Point';
import Map from './components/Header/Map';
import Placing from './components/Header/Placing';
import Learn from './components/Header/Learn';
import Calculate from './components/Header/Calculate';
import { DataContext } from './components/Functions/DataContext';
import configurationData from './components/configurationData';
import useBLE from './components/hooks/useBLE';
import base64 from 'react-native-base64';
import useWebSockets from './components/hooks/useWebSockets';

export default function App(): JSX.Element {
  const [nmeaParsed, setNmeaParsed] = useState({
    "alt": 390.506,
    "errors": 4,
    "fix": "3D",
    "hdop": 0.93,
    "lat": 49.48724413833333,
    "lon": 16.672643175,
    "pdop": 1.5,
    "processed": 228,
    "satsActive": [28, 16, 11, 14, 33],
    "satsVisible": [
      { "azimuth": 260, "elevation": 87, "prn": 2, "snr": 41, "status": "tracking" },
      { "azimuth": 257, "elevation": 46, "prn": 3, "snr": 39, "status": "tracking" },
      { "azimuth": 59, "elevation": 42, "prn": 4, "snr": 24, "status": "tracking" },
      { "azimuth": 192, "elevation": 18, "prn": 5, "snr": 42, "status": "tracking" },
      { "azimuth": 94, "elevation": 57, "prn": 6, "snr": null, "status": "in view" },
      { "azimuth": 183, "elevation": 19, "prn": 8, "snr": 32, "status": "tracking" },
      { "azimuth": 142, "elevation": 58, "prn": 9, "snr": 42, "status": "tracking" },
      { "azimuth": 69, "elevation": 6, "prn": 10, "snr": null, "status": "in view" },
      { "azimuth": 115, "elevation": 39, "prn": 11, "snr": 19, "status": "tracking" },
      { "azimuth": 276, "elevation": 7, "prn": 14, "snr": 22, "status": "tracking" },
      { "azimuth": 314, "elevation": 26, "prn": 17, "snr": 22, "status": "tracking" },
      { "azimuth": 327, "elevation": 4, "prn": 19, "snr": null, "status": "in view" },
      { "azimuth": 132, "elevation": 72, "prn": 21, "snr": 45, "status": "tracking" },
      { "azimuth": 298, "elevation": 12, "prn": 22, "snr": 24, "status": "tracking" },
      { "azimuth": 341, "elevation": 6, "prn": 27, "snr": null, "status": "in view" },
      { "azimuth": 96, "elevation": 17, "prn": 28, "snr": null, "status": "in view" },
      { "azimuth": 127, "elevation": 5, "prn": 31, "snr": 20, "status": "tracking" },
      { "azimuth": 52, "elevation": 33, "prn": 32, "snr": 22, "status": "tracking" },
      { "azimuth": 171, "elevation": 33, "prn": 36, "snr": 42, "status": "tracking" },
      { "azimuth": 134, "elevation": 23, "prn": 40, "snr": 32, "status": "tracking" },
      { "azimuth": 108, "elevation": 6, "prn": 41, "snr": null, "status": "in view" },
      { "azimuth": 195, "elevation": 32, "prn": 49, "snr": 44, "status": "tracking" },
      { "azimuth": 37, "elevation": 0, "prn": 66, "snr": 5, "status": "tracking" },
      { "azimuth": 41, "elevation": 49, "prn": 67, "snr": 28, "status": "tracking" },
      { "azimuth": 201, "elevation": 75, "prn": 68, "snr": 47, "status": "tracking" },
      { "azimuth": 213, "elevation": 23, "prn": 69, "snr": 34, "status": "tracking" }],
    "speed": 0.112972,
    "time": "2024-08-17T09:21:29.000Z",
    "track": null,
    "vdop": 1.18,
    "quality": "float",     // comment out before testing bluetooth
  },
  );
  const [rawMeasurement, setRawMeasurement] = useState('');
  const [lastGGA, setLastGGA] = useState('');
  const [lastGST, setLastGST] = useState('');
  const [data, setData] = useState(configurationData);
  let checkParsedLon = 0;


  const updateData = (newSettings: any) => {
    setData(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  };

  const { setDataStorage, getDataStorage, clearDataStorage } = useAsyncStorage(updateData);

  const getNmeaRead = (parsed: any) => {
    if (parsed.lon !== checkParsedLon) { // Update only if lon change
      //console.log(parsed);
      setNmeaParsed(prevState => ({
        ...prevState,             // Keep other properties the same
        lon: parsed.lon,          // Update lon
        lat: parsed.lat,          // Update lat
        alt: parsed.alt,           // Update alt
        pdop: parsed.pdop,
        quality: parsed.quality,
        satsVisible: parsed.satsVisible,
      }));
      checkParsedLon = parsed.lon;
    }
  };

  const getLastGGA = (lastGGA: string) => {
    setLastGGA(lastGGA);
  };

  const getLastGST = (lastGST: string) => {
    setLastGST(lastGST);
  };

  const getRawMeasurement = (data: string) => {
    setRawMeasurement(data);
  };

  const [connectionSettings, setConnectionSettings] = useState(data.connectionSettings);
  const [connectedState, setConnectedState] = useState(false);

  const {
    createConnection,
    closeConnection,
    messages,
    sendMessage,
    socket,
    rtcmNtrip,
    setRtcmNtrip,
    startSendingNtripData,
  } = useWebSockets(getNmeaRead, getLastGGA, getLastGST, getRawMeasurement, connectionSettings, setConnectedState);

  useEffect(() => {
    setConnectionSettings(prevSettings => ({
      ...prevSettings,
      isEnabled: connectedState,
    }));
    console.log('Connected state:', connectedState);
  }, [connectedState]);



  const valueContext = { data, updateData };
  const getRtcmNtrip = (rtcmNtrip: Buffer) => {
    // Directly encode the received byte array to Base64
    //const encodedData = rtcmNtrip.toString('base64');
    setRtcmNtrip(rtcmNtrip);
    console.log("Ntrip - rtcm -", rtcmNtrip);
    //console.log(encodedData);
  };


  const [modalType, setmodalType] = useState({
    point: false,
    placing: false,
    skyplot: false,
    communication: false,
    ntrip: false,
    project: false,
    map: false,
    learn: false,
    calculate: false,
    measurement: true,
  });

  const updateModalType = (newSettings: any) => {
    setmodalType(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  };

  const [placingSettings, setPlacingSettings] = useState(data.placingSettings);

  const handleAppStateChange = (nextAppState: any) => {
    if (nextAppState === 'background') {
      console.log('the app is closed');
      setDataStorage(data);
    }
  };

  useEffect(() => {
    getDataStorage();
    // Force written GGA
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
          connectedState={connectedState}
          lastGGA={lastGGA}
          modalType={modalType}
          updateModalType={updateModalType}
          nmeaParsed={nmeaParsed}
        />
        <View>
          {modalType.communication && <Communication
            getNmeaRead={getNmeaRead}
            rtcmNtrip={rtcmNtrip}
            getLastGGA={getLastGGA}
            createConnection={createConnection}
            closeConnection={closeConnection}
            connectionSettings={connectionSettings}
            setConnectionSettings={setConnectionSettings}
            messages={messages}
            sendMessage={sendMessage}
          />}
          {modalType.ntrip && <Ntrip getRtcmNtrip={getRtcmNtrip} lastGGA={lastGGA} startSendingNtripData={startSendingNtripData} socket={socket} />}
          {modalType.project && <Project clearStorage={clearDataStorage} setPlacingSettings={setPlacingSettings} />}
          {modalType.point && <Point />}
          {modalType.measurement && (
            <Measurement
              nmeaParsed={nmeaParsed}
              rawMeasurement={rawMeasurement}
              connectedState={connectedState}
              lastGST={lastGST}
            />
          )}
          {modalType.placing && <Placing nmeaParsed={nmeaParsed} placingSettings={placingSettings} setPlacingSettings={setPlacingSettings} />}
          {modalType.map && <Map updateModalType={updateModalType} placingSettings={placingSettings} setPlacingSettings={setPlacingSettings} />}
          {modalType.skyplot && <Skyplot satsVisible={nmeaParsed.satsVisible} />}
          {modalType.learn && <Learn />}
          {modalType.calculate && <Calculate />}
        </View>
      </DataContext.Provider>
    </SafeAreaView>
  );
}
