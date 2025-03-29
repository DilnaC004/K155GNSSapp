/* eslint-disable no-bitwise */
import { useState, useEffect } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Snackbar from 'react-native-snackbar';
import GPS from 'gps';
import { NetworkInfo } from 'react-native-network-info';
import { Buffer } from 'buffer';
import dgram from 'react-native-udp';
import SoundPlayer from "react-native-sound-player";

function useCommunication(getNmeaRead, getLastGGA, getLastGST, getRawMeasurement, connectionSettings, setConnectionSettings, setConnectedState) {
  const [rtcmNtrip, setRtcmNtrip] = useState(Buffer.alloc(0));
  let buffer = '';  // Buffer to store partial data
  const gps = new GPS();
  const [socket, setSocket] = useState(null);
  let serverIp = null;

  updateConnectionSettings = (newSettings) => {
    setConnectionSettings((prevSettings) => ({
      ...prevSettings,
      ...newSettings,
    }));
  }

  const getBroadcastIp = (ip, netmask) => {
      const ipParts = ip.split('.').map(Number);
      const netmaskParts = netmask.split('.').map(Number);

      const ipBinary = ipParts.map(part => part.toString(2).padStart(8, '0')).join('');
      const netmaskBinary = netmaskParts.map(part => part.toString(2).padStart(8, '0')).join('');

      const inverseNetmaskBinary = netmaskBinary.split('').map(bit => bit === '1' ? '0' : '1').join('');

      const broadcastBinary = ipBinary.split('')
          .map((bit, index) => bit === '1' || inverseNetmaskBinary[index] === '1' ? '1' : '0')
          .join('');

      const broadcastParts = [];
      for (let i = 0; i < 4; i++) {
          broadcastParts.push(parseInt(broadcastBinary.slice(i * 8, i * 8 + 8), 2));
      }

      return broadcastParts.join('.');
  }

  const getBroadcastAddress = async () => {
    try {
        const ip = await NetworkInfo.getIPAddress(); // Get the device's IP address
        const netmask = await NetworkInfo.getSubnet(); // Get the device's subnet mask

        if (ip && netmask) {
            const broadcastIp = getBroadcastIp(ip, netmask);
            console.log('Broadcast IP:', broadcastIp);
            return broadcastIp;
        } else {
            console.error('Failed to retrieve IP or netmask');
            return null;
        }
    } catch (error) {
        console.error('Error getting broadcast IP:', error);
        return null;
    }
  };

  const listenForData = () => {
    const udpClient = dgram.createSocket('udp4');
    let feedbackTimeout = null;
    let isConnected = false;

    udpClient.bind(41234);

    udpClient.on('message', (message, rinfo) => {
        console.log(`Received UDP message: ${message} from ${rinfo.address}:${rinfo.port}`);

        // Handle first connection and extract server IP
        if (!isConnected) {
            isConnected = true;
            serverIp = rinfo.address; // Store server IP
            setConnectedState(true);
            SoundPlayer.playAsset(require("../Sounds/connection_success.mp3"));
            Snackbar.show({
                text: 'Přijímač připojen.',
                duration: Snackbar.LENGTH_SHORT,
                textColor: 'green',
                marginBottom: 5,
            });
            setSocket(udpClient);
        }

        // Reset the inactivity timeout
        if (feedbackTimeout) {
            clearTimeout(feedbackTimeout);
        }

        feedbackTimeout = setTimeout(() => {
            if (isConnected) {
                console.log("No messages received for 5 seconds. Closing UDP connection.");
                isConnected = false;
                setConnectedState(false);
                SoundPlayer.playAsset(require("../Sounds/disconnect.mp3"));
                Snackbar.show({
                    text: 'Žádná data nepřijata déle než 5 sekund, zkontroluj přijímač.',
                    duration: Snackbar.LENGTH_SHORT,
                    textColor: 'red',
                    marginBottom: 5,
                });
                getLastGGA('');
                getLastGST('');
                udpClient.close();
            }
        }, 5000); // 5 seconds

        // Process received data
        onNmeaUpdate(message.toString());
    });

    udpClient.on('error', (err) => {
        console.error(`UDP error: ${err}`);
        Snackbar.show({
            text: 'Chyba spojení, zkontroluj připojení.',
            duration: Snackbar.LENGTH_SHORT,
            textColor: 'red',
        });
        setSocket(null);
        udpClient.close();
    });

    udpClient.on('close', () => {
        if (isConnected) {
            isConnected = false;
            setConnectedState(false);
            setSocket(null);
            console.log('UDP socket disconnected');
            SoundPlayer.playAsset(require("../Sounds/disconnect.mp3"));
            Snackbar.show({
                text: 'Přijímač odpojen.',
                duration: Snackbar.LENGTH_SHORT,
                textColor: 'red',
            });
            getLastGGA('');
            getLastGST('');
        }
        setTimeout(listenForData, 1500); // Restart listener
    });
  };

  const closeConnection = async () => {
    if (udpClient) {
      udpClient.close();
      setSocket(null);
      setConnectedState(false);
      getLastGGA('');
      getLastGST('');
      console.log('UDP connection closed');
    }
  };

  const sendMessage = async (message) => {
    if (!serverIp) {
        console.error("Server IP not known. Cannot send message.");
        return;
    }

    socket.send(message, 0, message.length, 8080, serverIp, (err) => {
        if (err) {
            console.error('Failed to send message:', err);
        } else {
            console.log('Message sent:', message);
        }
    });
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
  let latestState = null;

  const onNmeaUpdate = (nmeaString) => {

    if (!nmeaString) {
      console.log('No Data was received');
      return;
    }

    // Add the new data to the buffer
    buffer += nmeaString;
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
      //console.log('Valid NMEA Sentence:', nmeaSentence);
      gps.update(nmeaSentence);
      if (nmeaSentence.includes('GNGGA')) {
        getLastGGA(GPS.Parse(nmeaSentence));
      }

      if (nmeaSentence.includes('GNGST')) {
        getLastGST(GPS.Parse(nmeaSentence));
      }

      gps.on('data', parsed => {
        latestState = gps.state;
      });

      if (nmeaSentence.includes('GLL')) {
        //console.log('Complete NMEA data for the second:', latestState);
        getNmeaRead(latestState);
        latestState = null;
      }
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
    if (socket && rtcmNtrip) {
      startSendingNtripData(socket);
    }
  }, [rtcmNtrip]);

  return {
    listenForData,
    closeConnection,
    sendMessage,
    rtcmNtrip,
    setRtcmNtrip,
    startSendingNtripData,
  };
}

export default useCommunication;
