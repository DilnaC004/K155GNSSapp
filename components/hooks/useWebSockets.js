/* eslint-disable no-bitwise */
import { useState, useEffect } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Snackbar from 'react-native-snackbar';
import GPS from 'gps';

function useCommunication(getNmeaRead, getLastGGA, getRawMeasurement) {
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [rtcmNtrip, setRtcmNtrip] = useState('');
  let buffer = '';  // Buffer to store partial data
  const gps = new GPS();
  let intervalId = null;
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);

  const createConnection = (url) => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      setMessages((prevMessages) => [...prevMessages, event.data]);
      console.log('Message received:', event.data);
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  };

  const sendMessage = (message) => {
    if (socket && isConnected) {
      socket.send(message);
      console.log('Message sent:', message);
    } else {
      console.error('WebSocket is not connected');
    }
  };

  // const onNmeaUpdate = (
  //   error: BleError | null,
  //   characteristic: Characteristic | null,
  // ) => {
  //   if (error) {
  //     console.log(error);
  //     return;
  //   } else if (!characteristic?.value) {
  //     console.log('No Data was received');
  //     return;
  //   }

  //   // Decode the base64-encoded BLE characteristic value
  //   const rawData = base64.decode(characteristic.value);
  //   buffer += rawData;
  //   let startIdx;

  //   // Process the buffer for RTCM and NMEA sentences
  //   while (buffer.length > 0) {
  //     startIdx = buffer.indexOf('$');

  //     if (buffer[0] === '$') {
  //       // This is an NMEA sentence
  //       const endIdx = buffer.indexOf('\r\n');

  //       if (endIdx === -1) break; // Wait for more data if no end found
  //       let nmeaSentence = buffer.slice(startIdx, endIdx + 2);

  //       // Remove any trailing commas and white spaces
  //       nmeaSentence = nmeaSentence.trim();
  //       nmeaSentence = nmeaSentence.replace(/,+$/, '');

  //       buffer = buffer.slice(endIdx + 2);

  //       // Process NMEA sentence
  //       console.log(nmeaSentence);
  //       gps.updatePartial(nmeaSentence);
  //       if (nmeaSentence.includes('GNGGA')) {
  //         getLastGGA(nmeaSentence);
  //       }

  //       gps.on('data', parsed => {
  //         getNmeaRead(gps.state);
  //         console.log(gps.state);
  //       });

  //     } else if (buffer.charCodeAt(0) === 0xD3) {
  //       // This is an RTCM message (starts with 0xD3)
  //       if (buffer.length < 3) break; // Wait for more data

  //       // Extract the length of the RTCM message
  //       const length = ((buffer.charCodeAt(1) & 0x03) << 8) | buffer.charCodeAt(2);

  //       // Total message length = preamble (1 byte) + length (2 bytes) + message + CRC (3 bytes)
  //       const totalLength = length + 6;

  //       if (buffer.length < totalLength) break; // Wait for more data

  //       const rtcmMessage = buffer.slice(0, totalLength);
  //       buffer = buffer.slice(totalLength);

  //       // Process the RTCM message
  //       getRawMeasurement(rtcmMessage);

  //     } else {
  //       // Unknown data, possibly corruption or noise. Skip or log it.
  //       console.log("Unknown data in buffer, skipping.");
  //       buffer = buffer.slice(1); // Move by one.
  //     }
  //   }
  // };

  // DIfferent aproach, uses the checksum provided in the sentences to verify the legnth, throws less errors
  const onNmeaUpdate = (error, characteristic) => {
    if (error) {
      console.log('Error:', error);
      return;
    } else if (!characteristic?.value) {
      console.log('No Data was received');
      return;
    }

    // Decode the base64-encoded BLE characteristic value
    const rawData = base64.decode(characteristic.value);
    buffer += rawData;
    let startIdx;

    // Function to calculate the checksum
    const calculateChecksum = (sentence) => {
      let checksum = 0;
      for (let i = 1; i < sentence.length; i++) {
        checksum ^= sentence.charCodeAt(i);
      }
      return checksum.toString(16).toUpperCase().padStart(2, '0');
    };

    // Process the buffer for RTCM and NMEA sentences
    while (buffer.length > 0) {
      startIdx = buffer.indexOf('$');

      if (startIdx === -1) break; // No more complete sentences in buffer

      // Locate the end of the NMEA sentence
      const endIdx = buffer.indexOf('\r\n', startIdx);

      if (endIdx === -1) break; // Wait for more data if no end found

      let nmeaSentence = buffer.slice(startIdx, endIdx + 2);

      // Remove any trailing commas and white spaces
      nmeaSentence = nmeaSentence.trim();

      // Extract checksum if present
      const checksumIndex = nmeaSentence.indexOf('*');
      if (checksumIndex !== -1) {
        const sentenceWithoutChecksum = nmeaSentence.slice(0, checksumIndex);
        const providedChecksum = nmeaSentence.slice(checksumIndex + 1, checksumIndex + 3).toUpperCase();

        // Calculate checksum and compare
        if (providedChecksum !== calculateChecksum(sentenceWithoutChecksum)) {
          console.log('Invalid checksum:', providedChecksum, 'Calculated:', calculateChecksum(sentenceWithoutChecksum));
          buffer = buffer.slice(endIdx + 2);
          continue; // Skip this sentence
        }
      } else {
        console.log('No checksum found in NMEA sentence:', nmeaSentence);
        buffer = buffer.slice(endIdx + 2);
        continue; // Skip this sentence
      }

      buffer = buffer.slice(endIdx + 2);

      // Process the valid NMEA sentence
      console.log('Valid NMEA Sentence:', nmeaSentence);
      gps.update(nmeaSentence);
      if (nmeaSentence.includes('GNGGA')) {
        getLastGGA(nmeaSentence);
      }

      gps.on('data', parsed => {
        getNmeaRead(parsed);
        console.log('GPS State:', parsed);
      });

    }
  };

  const startStreamingData = (device) => {
    console.log("Starting the data stream")
    try {
      if (device) {
        device.monitorCharacteristicForService(
          monitoredBleCharacteristic,
          monitoredBleService,
          onNmeaUpdate,
        );
      } else {
        console.log('No Device Connected');
      }
    } catch (e) {
      console.error('Failed to stream data', e);
    }
  };

  const startSendingNtripData = (device) => {
    console.log("Sending rtcm");
    //console.log(rtcmNtrip);  // Already Base64 encoded

    try {
      if (device) {
        sendMessage(rtcmNtrip);
      } else {
        console.log('No Device Connected');
      }
    } catch (e) {
      console.error('Failed to send data', e);
    }
  };

  // Watch for changes to rtcmNtrip and send data when it changes
  useEffect(() => {
    if (connectedDevice && rtcmNtrip) {
      //console.log(rtcmNtrip);
      startSendingNtripData(connectedDevice);
    }
  }, [rtcmNtrip]);

  return {
    createConnection,
    messages,
    sendMessage,
    connectedDevice,
    rtcmNtrip,
    setRtcmNtrip,
    startSendingNtripData,
  };
}

export default useCommunication;
