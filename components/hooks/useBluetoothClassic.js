import {useState, useEffect} from 'react';
import {View, Text, Button} from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';
import NmeaViewer from '../Header/NmeaViewer';
import RNBluetoothClassic, {
  BluetoothEventType,
} from 'react-native-bluetooth-classic';
import {styles} from '../Styles/styles';

export default function useBluetoothClassic() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [devices, setDevices] = useState([]);
  const [connectedDeviceClassic, setCoonectedDevicesClassic] = useState(null);
  const [nmeaRead, setNmeaRead] = useState([]);
  let intervalId;

  useEffect(() => {
    if(connectedDeviceClassic != null){
        setReadBluetoothConnection(storeData);
        console.log('start reading')
    }
    return () => {};
  }, [isEnabled]);

  function BluetoothClassicComponent() {
    return (
        <View>
          <Text style={styles.title}>Nastavení Bluetooth připojení:</Text>
          <Button
            title="Scan for Bluetooth devices"
            onPress={() => {
              scanForDevices();
            }}
          />
          <SelectDropdown
            style={styles.selectDropdown}
            data={devices.map(mntp => mntp.name)}
            disabled={devices.length === 0}
            defaultButtonText="žádné připojené zařízení"
            defaultValue={0}
            buttonStyle={styles.dropdownBtnStyle}
            onSelect={(_, index) => {
              setCoonectedDevicesClassic(devices[index]);
            }}
            renderDropdownIcon={() => {}}
            dropdownIconPosition={'right'}
          />
          <Button
            title={isEnabled ? 'Připoj' : 'Odpoj'}
            onPress={() => {
              if (isEnabled) {
                startBluetoothConnection();
              } else {
                stopBluetoothConnection();
              }
            }}
          />
        <NmeaViewer nmeaMessages={nmeaRead}/>
        </View>
      );
  }

  const scanForDevices = async () => {
    try {
      let paired = await RNBluetoothClassic.getBondedDevices();
      const pairedDeviced = paired;
      setDevices(pairedDeviced);
      let unpaired = await RNBluetoothClassic.startDiscovery();
      const unpairedDeviced = paired;
    } catch (err) {
      console.log('error:', err);
    }
  };

  const stopBluetoothConnection = async () => {
    RNBluetoothClassic.disconnectFromDevice(connectedDeviceClassic.address);
    RNBluetoothClassic.
    console.log('Disconnected from ' + connectedDeviceClassic.name);
    setCoonectedDevicesClassic(null);
    setIsEnabled(!isEnabled);
    clearInterval(intervalId); // WHY THIS IS NOT WORKING
    setNmeaRead([]);
  };

  const startBluetoothConnection = async () => {
    try{
      await RNBluetoothClassic.connectToDevice(connectedDeviceClassic.address, {
        CONNECTOR_TYPE: 'rfcomm',
        DELIMITER: '\n',
        DEVICE_CHARSET: 'ascii',
      });
      setIsEnabled(!isEnabled);
      console.log('Connecting to ' + connectedDeviceClassic.name);
    } catch (err) {
      console.log(err);
      setIsEnabled(true);
    }
  };

  const readBluetoothConnection = async () => {
    //console.log(connectedDeviceClassic.address); 
      try{
        let readDataAvailable = await RNBluetoothClassic.availableFromDevice(connectedDeviceClassic.address);
        if(readDataAvailable > 0){
            let storeData = [];
          for (let i = 0; i < readDataAvailable; i++) {
            let readData = await RNBluetoothClassic.readFromDevice(connectedDeviceClassic.address);
            storeData.push(readData);
            //setNmeaRead(prevData => [...prevData, storeData]);
          }
          console.log('store data: '+ storeData);
          setNmeaRead(storeData);
        }
      } catch (err) {
        console.log(err);
      }
  };

  const setReadBluetoothConnection = () =>{
    if(!isEnabled && connectedDeviceClassic != null){
    intervalId = setInterval(() => {
      readBluetoothConnection();
    }, 1000);
  }
  };

  return {nmeaRead, BluetoothClassicComponent};
}
