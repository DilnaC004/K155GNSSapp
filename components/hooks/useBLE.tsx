/* eslint-disable no-bitwise */
import { useState, useEffect } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
} from 'react-native-ble-plx';
import { PERMISSIONS, requestMultiple } from 'react-native-permissions';
import DeviceInfo from 'react-native-device-info';
import Snackbar from 'react-native-snackbar';
import base64 from 'react-native-base64';
import GPS from 'gps';


const monitoredBleCharacteristic = '0000ffe0-0000-1000-8000-00805f9b34fb';
const monitoredBleService = '0000ffe1-0000-1000-8000-00805f9b34fb';
const writeChar = '0000ffe1-0000-1000-8000-00805f9b34fb';

const bleManager = new BleManager();

type VoidCallback = (result: boolean) => void;

interface BluetoothLowEnergyApi {
  requestPermissions(cb: VoidCallback): Promise<void>;
  scanForPeripherals(): void;
  connectToDevice: (device: Device) => Promise<void>;
  disconnectFromDevice: () => void;
  connectedDevice: Device | null;
  allDevices: Device[];
  rtcmNtrip: string;
  setRtcmNtrip: (data: string) => void;
  startSendingNtripData: (device: Device) => void;
}

function useBLE(getNmeaRead: (parsed: any) => void, getLastGGA: (lastGGA: string) => void, getRawMeasurement: (lastGGA: string) => void): BluetoothLowEnergyApi {
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [rtcmNtrip, setRtcmNtrip] = useState('');
  let buffer = '';  // Buffer to store partial data
  const gps = new GPS();
  let intervalId: NodeJS.Timeout | null = null;

  const requestPermissions = async (cb: VoidCallback) => {
    if (Platform.OS === 'android') {
      const apiLevel = await DeviceInfo.getApiLevel();

      if (apiLevel < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Bluetooth Low Energy requires Location',
            buttonNeutral: 'Ask Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        cb(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        const result = await requestMultiple([
          PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
          PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ]);

        const isGranted =
          result['android.permission.BLUETOOTH_CONNECT'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.BLUETOOTH_SCAN'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.ACCESS_FINE_LOCATION'] ===
          PermissionsAndroid.RESULTS.GRANTED;

        cb(isGranted);
      }
    } else {
      cb(true);
    }
  };

  const isDuplicateDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex(device => nextDevice.id === device.id) > -1;

  const scanForPeripherals = () =>
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log(error);
      }
      if (device) {
        setAllDevices((prevState: Device[]) => {
          if (!isDuplicateDevice(prevState, device)) {
            return [...prevState, device];
          }
          return prevState;
        });
      }
    });

  const connectToDevice = async (device: Device) => {
    try {
      const deviceConnection = await bleManager.connectToDevice(device.id);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      console.log(deviceConnection.serviceUUIDs);
      setConnectedDevice(deviceConnection);
      setIsConnected(true);
      bleManager.stopDeviceScan();
      startStreamingData(deviceConnection);
      Snackbar.show({
        text: 'Connected to device: ' + (device.name ? device.name : device.id),
        duration: Snackbar.LENGTH_SHORT,
        textColor: 'red',
        marginBottom: 5,
      });
    } catch (e) {
      console.error('FAILED TO CONNECT', e);
      setIsConnected(false);
    }
  };

  const disconnectFromDevice = async () => {
    if (connectedDevice) {
      try {
        await bleManager.cancelDeviceConnection(connectedDevice.id);
        setConnectedDevice(null);
        setIsConnected(false); // Ensure the state is reset to false
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        Snackbar.show({
          text: 'Disconnected from device: ' + (connectedDevice.name ? connectedDevice.name : connectedDevice.id),
          duration: Snackbar.LENGTH_SHORT,
          textColor: 'red',
          marginBottom: 5,
        });
      } catch (e) {
        console.error('Failed to disconnect', e);
      }
    }
  };

  const onNmeaUpdate = (
    error: BleError | null,
    characteristic: Characteristic | null,
  ) => {
    if (error) {
      console.log(error);
      return;
    } else if (!characteristic?.value) {
      console.log('No Data was received');
      return;
    }
    
    // Decode the base64-encoded BLE characteristic value
    const rawData = base64.decode(characteristic.value);
    buffer += rawData;
    let startIdx;

    // Process the buffer for RTCM and NMEA sentences
    while (buffer.length > 0) {
      startIdx = buffer.indexOf('$');

      if (buffer[0] === '$') {
        // This is an NMEA sentence
        const endIdx = buffer.indexOf('\r\n');

        if (endIdx === -1) break; // Wait for more data if no end found
        let nmeaSentence = buffer.slice(startIdx, endIdx + 2);

        // Remove any trailing commas and white spaces
        nmeaSentence = nmeaSentence.trim();
        nmeaSentence = nmeaSentence.replace(/,+$/, '');

        buffer = buffer.slice(endIdx + 2);

        // Process NMEA sentence
        gps.updatePartial(nmeaSentence);
        if (nmeaSentence.includes('GNGGA')) {
          getLastGGA(nmeaSentence);
        }

        gps.on('data', parsed => {
          getNmeaRead(gps.state);
        });

      } else if (buffer.charCodeAt(0) === 0xD3) {
        // This is an RTCM message (starts with 0xD3)
        if (buffer.length < 3) break; // Wait for more data

        // Extract the length of the RTCM message
        const length = ((buffer.charCodeAt(1) & 0x03) << 8) | buffer.charCodeAt(2);

        // Total message length = preamble (1 byte) + length (2 bytes) + message + CRC (3 bytes)
        const totalLength = length + 6;

        if (buffer.length < totalLength) break; // Wait for more data

        const rtcmMessage = buffer.slice(0, totalLength);
        buffer = buffer.slice(totalLength);

        // Process the RTCM message
        getRawMeasurement(rtcmMessage);

      } else {
        // Unknown data, possibly corruption or noise. Skip or log it.
        console.log("Unknown data in buffer, skipping.");
        buffer = buffer.slice(1); // Move by one.
      }
    }
  };


  const startStreamingData = async (device: Device) => {
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

  const startSendingNtripData = async (device: Device) => {
    console.log("Sending rtcm")
    const base64Data = base64.encode(rtcmNtrip);
    console.log(base64Data);
    try {
      if (device) {
        await device?.writeCharacteristicWithoutResponseForService(
          monitoredBleCharacteristic,
          writeChar,
          base64Data

        );
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
    scanForPeripherals,
    requestPermissions,
    connectToDevice,
    allDevices,
    connectedDevice,
    disconnectFromDevice,
    rtcmNtrip,
    setRtcmNtrip,
    startSendingNtripData,
  };
}

export default useBLE;
