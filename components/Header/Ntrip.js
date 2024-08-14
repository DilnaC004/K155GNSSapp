import React, { useState, useRef, useEffect, useContext } from 'react';
import { View, Text, TextInput, Button, ScrollView } from 'react-native';
import Snackbar from 'react-native-snackbar';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import SelectDropdown from 'react-native-select-dropdown';
import RowWithLabelAndValue from './RowWithLabelAndValue';
import { encode, decode, base64 } from 'base-64';
import TcpSocket from 'react-native-tcp-socket';
import { DataContext } from '../Functions/DataContext';
import { styles } from '../Styles/styles';
import FlatListMountpoint from './ProjectComponents/FlatListMountpoint';

class Mountpoint {
  constructor(sourceTableString) {
    const sourceTableData = sourceTableString.split(';');

    this.id = sourceTableData[1];
    this.name = sourceTableData[2];
    this.format = sourceTableData[3];
    this.carrier = sourceTableData[5];
    this.navSystem = sourceTableData[6];
    this.networkName = sourceTableData[7];
    this.country = sourceTableData[8];
    this.latitude = sourceTableData[9];
    this.longitude = sourceTableData[10];
    this.isVirtual = sourceTableData[11] === '1';
    this.isNetworkSolution = sourceTableData[12] === '1';
  }
}

const Ntrip = ({ getRtcmNtrip, lastGGA, startSendingNtripData, connectedDevice, }) => {
  const [intervalLastGGA, setIntervalLastGGA] = useState(0);
  const { data, updateData } = useContext(DataContext);
  const [ntripSettings, setNtripSettings] = useState(data.ntripSettings);
  const [selectedMntp, setSelectedMntp] = useState(null); // State for selected mountpoint
  const updateNtripSettings = newSettings => {
    setNtripSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
    updateData({ ntripSettings: newSettings });
  };

  const switchConnect = ntripSettings.ntripConnect ? 'Odpoj se' : 'Připoj se k Ntrip serveru';

  const handleMntpSelectChange = () => {
    console.log('Zkouším se připojit k Czepos');
    const options = {
      host: ntripSettings.ntripIp,
      port: ntripSettings.ntripPort,
    };
    // Create socket
    let client = TcpSocket.createConnection(options, () => {
      let connectionString =
        'GET / HTTP/1.0\r\n' +
        'Host: ' +
        `http://${ntripSettings.ntripIp}:${ntripSettings.ntripPort}` +
        '\r\n' +
        'User-Agent: NTRIPClient for Arduino v1.0\r\n' +
        "Connection: close\r\n\r\n";

      // Write on the socket
      client.write(connectionString);

      // setTimeout(() => {
      //   client.end();
      //   console.log('Client byl ukončen : DEBUG!!');
      // }, 10000);
    });

    client.on('data', function (data) {
      console.log('message was received', data.toString());
      const mountpoints = [];
      const sourceData = data.toString().split('\r\n');

      for (let i = 0; i < sourceData.length; i++) {
        if (sourceData[i].startsWith('STR')) {
          mountpoints.push(new Mountpoint(sourceData[i]));
        }
      }

      updateNtripSettings({
        mountpoints: mountpoints,
      });
    });

    client.on('error', function (error) {
      console.log(error);
      updateNtripSettings({ mountpoints: [], selectedMntp: null });
      Snackbar.show({
        text: `Chyba komunikace se serverem \r\nhttp://${ntripSettings.ntripIp}:${ntripSettings.ntripPort}`,
        duration: Snackbar.LENGTH_SHORT,
        textColor: 'red',
        marginBottom: 5,
      });
    });

    client.on('close', function () {
      console.log('Connection closed!');
    });
  };

  const onNtripConnect = () => {
    if (!selectedMntp) {
      Snackbar.show({
        text: "Před připojením vyber mountpoint.",
        duration: Snackbar.LENGTH_SHORT,
        textColor: 'red',
        marginBottom: 5,
      });
      return;
    }

    console.log('Zkouším stahovat ntrip korekce');

    const options = {
      host: ntripSettings.ntripIp,
      port: ntripSettings.ntripPort,
    };

    let client = TcpSocket.createConnection(options, () => {
      updateNtripSettings({ clientWrapper: client });

      let connectionString =
        'GET /' +
        selectedMntp.id +
        ' HTTP/1.0\r\n' +
        'Host: ' +
        `http://${ntripSettings.ntripIp}:${ntripSettings.ntripPort}` +
        '\r\n' +
        'User-Agent: NTRIPClient for Arduino v1.0\r\n' +
        'Authorization: ' +
        `Basic ${utf8_to_b64(
          ntripSettings.ntripUsername + ':' + ntripSettings.ntripPassword,
        )}` +
        '\r\n\r\n\r\n';

      client.write(connectionString);

      startSendingNtripData(connectedDevice); //Start sending rtcm to BLE to Ublox

      // Send the GGA message immediately after connecting
      if (lastGGA != null && selectedMntp.isVirtual) {
        console.log('Sending initial GGA', lastGGA);       // Debugging log

        // Send the GGA message immediately
        client.write(lastGGA);

        // Set up a regular interval to send GGA
        let interval = setInterval(() => {
          console.log('Sending GGA on interval', lastGGA); // Debugging log
          client.write(lastGGA);
        }, 20000);

        setIntervalLastGGA(interval);

      } else if (lastGGA == null && selectedMntp.isVirtual) {
        Snackbar.show({
          text: "Pro využítí virtuální stanice připojte GNSS přijímač",
          duration: Snackbar.LENGTH_SHORT,
          textColor: 'red',
          marginBottom: 5,
        });
      }

      updateNtripSettings({ ntripConnect: true });
    });

    client.on('data', function (data) {
      getRtcmNtrip(data.toString());
    });

    client.on('error', function (error) {
      console.log(error);
    });

    client.on('close', function () {
      console.log('Connection closed!');
      getRtcmNtrip(""); // clear RTCM ntrip
      Snackbar.show({
        text: `Ukončena komunikace se serverem \r\nhttp://${ntripSettings.ntripIp}:${ntripSettings.ntripPort}`,
        duration: Snackbar.LENGTH_SHORT,
        textColor: 'red',
        marginBottom: 5,
      });
    });
  };

  const onNtripClose = () => {
    ntripSettings.clientWrapper.end();
    clearInterval(intervalLastGGA);
    updateNtripSettings({ ntripConnect: false });
    setIntervalLastGGA(0); // Ensure the interval state is reset
  }
  

  const onSelectMountpoint = (selectedMountpoint) => {
    setSelectedMntp(selectedMountpoint); // Update selected mountpoint
  }

  useEffect(() => {
    // Whenever lastGGA is updated, send it to the Ntrip server if connected
    if (lastGGA != null && ntripSettings.ntripConnect && selectedMntp?.isVirtual) { 
      console.log('Sending GGA to Ntrip Server');
      ntripSettings.clientWrapper?.write(lastGGA);
    }
    return () => {
      updateData({
        ntripSettings: ntripSettings,
      })
    };
  }, [ntripSettings, lastGGA]);

  return (
    <View style={styles.nastContainer}>
      <Text style={styles.title}>Nastavení NTRIP připojení</Text>
      <Text>IP adresa NTRIP serveru:</Text>
      <TextInput
        style={styles.input}
        placeholder="Ip adresa serveru..."
        value={ntripSettings.ntripIp}
        onChangeText={text => updateNtripSettings({ ntripIp: text })}
      />
      <Text>Port NTRIP serveru:</Text>
      <TextInput
        style={styles.input}
        placeholder="port..."
        value={ntripSettings.ntripPort}
        onChangeText={text => updateNtripSettings({ ntripPort: text })}
      />
      <Button
        title="Vyhledej MountPointy"
        style={styles.button}
        onPress={handleMntpSelectChange}
      />
      <FlatListMountpoint
        mountpoints={ntripSettings.mountpoints}
        onSelectMountpoint={onSelectMountpoint}
      />
      <View style={styles.hrLine} />
      <Text style={styles.title}>Připojení k NTRIP serveru:</Text>
      <TextInput
        style={styles.input}
        placeholder="Uživatelské jméno"
        value={ntripSettings.ntripUsername}
        onChangeText={text => updateNtripSettings({ ntripUsername: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Heslo"
        value={ntripSettings.ntripPassword}
        onChangeText={text => updateNtripSettings({ ntripPassword: text })}
        secureTextEntry
      />
      <Button
        title={switchConnect}
        style={styles.button}
        onPress={() => {
          if (!ntripSettings.ntripConnect) {
            onNtripConnect();
          } else {
            onNtripClose();
          }
        }}
      />
    </View>
  );
};

export default Ntrip;

// Helper functions
function utf8_to_b64(str) {
  const bytes = encode(str);
  return bytes;
}
