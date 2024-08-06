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
  onDataReceived: (data: string) => void;
}

function useBLE(lastGGA: string): BluetoothLowEnergyApi {
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

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
      Snackbar.show({
        text: 'Connected to device: ' + (device.name ? device.name : device.id),
        duration: Snackbar.LENGTH_SHORT,
        textColor: 'red',
        marginBottom: 5,
      });
      if (connectedDevice) {
        startStreamingData(connectedDevice);
      }
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

  const onDataReceived = (data: string) => {
    try {
      var decodedData = base64.decode(data);
      data = decodedData;
      console.log(data);
    } catch {
      console.log("An error occured in onDataReceived")
    }
  };

  const startStreamingData = async (connectedDevice: Device) => {
    if (connectedDevice)
      try {
        await connectedDevice.writeCharacteristicWithoutResponseForService(
          monitoredBleService,
          writeChar,
          base64.encode(lastGGA)
        );
        const currentNMEA = await connectedDevice.readCharacteristicForService(
          monitoredBleService,
          monitoredBleCharacteristic
        );

        if (currentNMEA.value) {
          console.log("Response: " + currentNMEA.value);
          onDataReceived(currentNMEA.value);
        } else {
          console.log("No Value!");
        }
      } catch (error: any) {
        console.error("Error in startStreamingData:", error);
        throw new Error(error);
      }
  };

  useEffect(() => {
    if (connectedDevice) {
      startStreamingData(connectedDevice);
    }
  }, [connectedDevice]);

  // useEffect(() => {
  //   let subscription: any;
  //   if (isConnected && connectedDevice) {
  //     subscription = connectedDevice.monitorCharacteristicForService(monitoredBleCharacteristic, monitoredBleService,
  //       (error, characteristic) => {
  //         if (error) {
  //           console.log('Error monitoring characteristic:', error);
  //           return;
  //         }
  //         if (characteristic?.value) {
  //           onDataReceived(characteristic.value);
  //         }
  //       }
  //     );
  //     return () => {
  //       subscription.remove();
  //     };
  //   }
  // }, [isConnected, connectedDevice]);

  // useEffect(() => {
  //   if (isConnected && connectedDevice) {
  //     connectedDevice.readCharacteristicForService(monitoredBleCharacteristic, monitoredBleService)
  //     .then(characteristic => {
  //       console.log('Read characteristic value:', characteristic.value)
  //     })
  //     .catch(error => {
  //       console.error('Read characteristic error:', error)
  //     })
  //   }
  // }, [isConnected, connectedDevice]);

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