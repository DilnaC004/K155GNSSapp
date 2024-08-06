/* eslint-disable no-bitwise */
import {useState, useEffect} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
} from 'react-native-ble-plx';
import {PERMISSIONS, requestMultiple} from 'react-native-permissions';
import DeviceInfo from 'react-native-device-info';
import Snackbar from 'react-native-snackbar';
import base64 from 'react-native-base64';

const monitoredBleCharacteristic = '0000ffe0-0000-1000-8000-00805f9b34fb';
const monitoredBleService = '0000ffe1-0000-1000-8000-00805f9b34fb';
const writeChar = "0000fff2-0000-1000-8000-00805f9b34fb";
const bleManager = new BleManager();

type VoidCallback = (result: boolean) => void;

interface BluetoothLowEnergyApi {
  requestPermissions(cb: VoidCallback): Promise<void>;
  scanForPeripherals(): void;
  connectToDevice: (device: Device) => Promise<void>;
  disconnectFromDevice: () => void;
  connectedDevice: Device | null;
  allDevices: Device[];
}

function useBLE(lastGGA: string, getNmeaRead: (nmeaSentence: string) => void): BluetoothLowEnergyApi {
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  let buffer = '';  // Buffer to store partial data

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

  const disconnectFromDevice = () => {
    if (connectedDevice) {
      bleManager.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
      setIsConnected(false);
      Snackbar.show({
        text: 'Disconnected from device: ' + (connectedDevice.name ? connectedDevice.name : connectedDevice.id),
        duration: Snackbar.LENGTH_SHORT,
        textColor: 'red',
        marginBottom: 5,
      });
    }
  };

  const onHeartRateUpdate = (
    error: BleError | null,
    characteristic: Characteristic | null,
  ) => {
    if (error) {
      console.log(error);
      return -1;
    } else if (!characteristic?.value) {
      console.log('No Data was recieved');
      return -1;
    }

    const rawData = base64.decode(characteristic.value);
    // Append the new data to the buffer
    buffer += rawData;

    // Split the buffer by the NMEA sentence delimiter '$'
    let startIdx;
    while ((startIdx = buffer.indexOf('$')) !== -1) {
      // Check if there is another '$' indicating the end of the current NMEA sentence
      let endIdx = buffer.indexOf('$', startIdx + 1);
      if (endIdx === -1) {
      // If there is no second '$', break the loop to wait for more data
      break;
    }
    // Extract the NMEA sentence
    const nmeaSentence = buffer.slice(startIdx, endIdx);
    buffer = buffer.slice(endIdx);  // Update the buffer to remove the processed NMEA sentence
    getNmeaRead(nmeaSentence);
    }
  };

  const startStreamingData = async (device: Device) => {
    if (device) {
      device.monitorCharacteristicForService(
        monitoredBleCharacteristic,
        monitoredBleService,
        onHeartRateUpdate,
      );
    } else {
      console.log('No Device Connected');
    }
  };

  return {
    scanForPeripherals,
    requestPermissions,
    connectToDevice,
    allDevices,
    connectedDevice,
    disconnectFromDevice,
  };
}

export default useBLE;