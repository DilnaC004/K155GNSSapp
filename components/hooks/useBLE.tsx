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


const HEART_RATE_UUID = '0000180d-0000-1000-8000-00805f9b34fb';
const HEART_RATE_CHARACTERISTIC = '00002a37-0000-1000-8000-00805f9b34fb';

const bleManager = new BleManager();

type VoidCallback = (result: boolean) => void;

interface BluetoothLowEnergyApi {
  requestPermissions(cb: VoidCallback): Promise<void>;
  scanForPeripherals(): void;
  connectToDevice: (deviceId: Device) => Promise<void>;
  disconnectFromDevice: () => void;
  connectedDevice: Device | null;
  allDevices: Device[];
  onDataReceived: (data: string) => void;
}

function useBLE(): BluetoothLowEnergyApi {
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [heartRate, setHeartRate] = useState<number>(0);

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

  const isDuplicteDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex(device => nextDevice.id === device.id) > -1;

  const scanForPeripherals = () =>
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log(error);
      }
      if (device) {
          setAllDevices((prevState: Device[]) => {
            if (!isDuplicteDevice(prevState, device)) {
              return [...prevState, device];
            }
            return prevState;
          });
      }
    });

    const connectToDevice = async (device: Device) => {
      try {
        const deviceConnection = await bleManager.connectToDevice(device.id);
        setConnectedDevice(deviceConnection);
        const services = await deviceConnection.discoverAllServicesAndCharacteristics();
        console.log("Dostupne sluzby: " + services.serviceUUIDs);
        bleManager.stopDeviceScan();
        Snackbar.show({
          text: 'Connected to device', // Access the error message using err.message
          duration: Snackbar.LENGTH_SHORT,
          textColor: 'red',
          marginBottom: 5,
        });
      } catch (e) {
        console.log('FAILED TO CONNECT', e);
      }
    };

  
    const disconnectFromDevice = () => {
      if (connectedDevice) {
        bleManager.cancelDeviceConnection(connectedDevice.id);
        setConnectedDevice(null);
        setHeartRate(0);
      }
    };

    const onDataReceived = (data: string) => {
      // Handle received data
      console.log(data);
      // Process received data as needed
    };

    useEffect(() => {
      if (connectedDevice) {    
        //const subscription = bleManager.monitorCharacteristicForDevice(     // alternativa
          //String(connectedDevice),
        const subscription = connectedDevice.monitorCharacteristicForService(   
          '0000ffe0-0000-1000-8000-00805f9b34fb', // HM -10 BLE
          '0000ffe1-0000-1000-8000-00805f9b34fb', // HM -10 BLE
          (error, characteristic) => {
            if (error) {
              console.error('Error monitoring characteristic:', error, connectedDevice.id);
              return;
            }
            if (characteristic) {
              // Characteristic value received
              const data = characteristic.value;
              if (data) {
                onDataReceived(data);
              }
            }
          }
        );
        return () => {
          // Clean up subscription when component unmounts
          subscription.remove();
        };
      }
    }, [connectedDevice, onDataReceived]);

  return {
    scanForPeripherals,
    requestPermissions,
    connectToDevice,
    allDevices,
    connectedDevice,
    disconnectFromDevice,
    onDataReceived,
  };
}

export default useBLE;