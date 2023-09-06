import React, {useState, useRef, useEffect, useContext} from 'react';
import {View, Text, TextInput, Button, ScrollView} from 'react-native';
import Snackbar from 'react-native-snackbar';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import SelectDropdown from 'react-native-select-dropdown';
import RowWithLabelAndValue from './RowWithLabelAndValue';
import {encode} from 'base-64';
import TcpSocket from 'react-native-tcp-socket';
import { DataContext } from '../Functions/DataContext';
import { styles } from '../Styles/styles';

class Mountpoint {
  constructor(sourceTableString) {
    const sourceTableData = sourceTableString.split(';');

    this.id = sourceTableData[1];
    this.name = sourceTableData[2];
    this.format = sourceTableData[3];
    this.carrier = sourceTableData[4];
    this.navSystem = sourceTableData[6];
    this.networkName = sourceTableData[7];
    this.country = sourceTableData[8];
    this.latitude = sourceTableData[9];
    this.longitude = sourceTableData[10];
    this.isVirtual = sourceTableData[11] === '1';
    this.isNetworkSolution = sourceTableData[12] === '1';
  }
}

const Ntrip = ({getRtcmNtrip, lastGGA}) => {
  const [intervalLastGGA, setIntervalLastGGA] = useState(0);
  const [clientWrapper, setClientWrapper] = useState(null);
  const { data, updateData} = useContext(DataContext);
  const [ntripSettings, setNtripSettings] = useState(data.ntripSettings);
  const updateNtripSettings = newSettings => {
    setNtripSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  };

  const switchConnect  = ntripSettings.ntripConnect ? 'Odpoj se' : 'Připoj se k Ntrip serveru';
  const mountpointSelectRef = useRef();

  const handleMntpSelectChange = () => {
    // Perform logic based on MNTP selection change
    //setShowFlatList(true); // set to true when button is clicked

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

      setTimeout(() => {
        client.end();
        console.log('Client byl ukončen : DEBUG!!');
      }, 10000);
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
        selectedMntp: mountpoints[0],
      });

      mountpointSelectRef.current.selectIndex(0);
    });

    client.on('error', function (error) {
      console.log(error);
      updateNtripSettings({mountpoints: [], selectedMntp: null});
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

  //TODO : dodelat preposilani RTK korekci do GNSS - moznost vypnuti, restartu, ukladani mnozstvi stazenych dat
  const onNtripConnect = () => {
    console.log('Zkouším stahovat ntrip korekce');

    const options = {
      host: ntripSettings.ntripIp,
      port: ntripSettings.ntripPort,
    };

    console.log(options);
    // Create socket
    let client = TcpSocket.createConnection(options, () => {
      let connectionString =
        'GET /' +
        ntripSettings.selectedMntp.id +
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

      // Write on the socket
      client.write(connectionString);

      if(ntripSettings.selectedMntp.isVirtual && lastGGA !=null){
        console.log('Sending GGA')

        let interval = setInterval(() => {
          client.write(lastGGA);
        },20000);

        setIntervalLastGGA(interval);

      } else if(lastGGA == null){
        Snackbar.show({
          text: "Pro využítí virtuální stanice připojte GNSS přijímač",
          duration: Snackbar.LENGTH_SHORT,
          textColor: 'red',
          marginBottom: 5,
        });
      }

      updateNtripSettings({ntripConnect:true});
/*
      setTimeout(() => {
        client.end();
        console.log('Client byl ukončen : DEBUG!!');
        updateNtripSettings({ntripConnect:false});
      }, 10000);
      */
    });

    setClientWrapper(client);

    client.on('data', function (data) {
      getRtcmNtrip(data);
    });

    client.on('error', function (error) {
      console.log(error);
    });

    client.on('close', function () {
      console.log('Connection closed!');
      Snackbar.show({
        text: `Ukončena komunikace se serverem \r\nhttp://${ntripSettings.ntripIp}:${ntripSettings.ntripPort}`,
        duration: Snackbar.LENGTH_SHORT,
        textColor: 'red',
        marginBottom: 5,
      });
    });
  };

  const onNtripClose = () => {
    clientWrapper.end();
    clearInterval(intervalLastGGA);
    updateNtripSettings({ntripConnect:false});
  }

  useEffect(() => {
    console.log(ntripSettings);
    return () => {
      console.log(ntripSettings);
      updateData({
        ntripSettings:ntripSettings,
      })
    };
  },[]);

  return (
    <ScrollView style={styles.nastContainer}>
      <Text style={styles.title}>Nastavení NTRIP připojení</Text>
      <Text>IP adresa NTRIP serveru:</Text>
      <TextInput
        style={styles.input}
        placeholder="Ip adresa serveru..."
        value={ntripSettings.ntripIp}
        onChangeText={text => updateNtripSettings({ntripIp: text})}
      />
      <Text>Port NTRIP serveru:</Text>
      <TextInput
        style={styles.input}
        placeholder="port..."
        value={ntripSettings.ntripPort}
        onChangeText={text => updateNtripSettings({ntripPort: text})}
      />
      <Text>Vyber mountpoint:</Text>
      <View style={styles.selectDropdown}>
        <SelectDropdown
          style={styles.selectDropdown}
          ref={mountpointSelectRef}
          data={ntripSettings.mountpoints.map(mntp => mntp.name)}
          disabled={ntripSettings.mountpoints.length === 0}
          defaultValueByIndex={0}
          defaultButtonText="žádná data"
          buttonStyle={styles.dropdownBtnStyle}
          onSelect={(_, index) => {
            updateNtripSettings({
              selectedMntp: ntripSettings.mountpoints[index],
            });
          }}
          renderDropdownIcon={isOpened => {
            return (
              <FontAwesome5
                name={isOpened ? 'chevron-up' : 'chevron-down'}
                color={'#444'}
                size={18}
              />
            );
          }}
          dropdownIconPosition={'right'}
        />
      </View>
      <Button
        title="Vyhledej MountPointy"
        style={styles.button}
        onPress={handleMntpSelectChange}
      />
      <View style={styles.hrLine} />
      <Text style={styles.title}>Připojení k NTRIP serveru:</Text>
      <TextInput
        style={styles.input}
        placeholder="Uživatelské jméno"
        value={ntripSettings.ntripUsername}
        onChangeText={text => updateNtripSettings({ntripUsername: text})}
      />
      <TextInput
        style={styles.input}
        placeholder="Heslo"
        value={ntripSettings.ntripPassword}
        onChangeText={text => updateNtripSettings({ntripPassword: text})}
        secureTextEntry
      />
      <Button
        title={switchConnect}
        style={styles.button}
        onPress={() => {
            if(!ntripSettings.ntripConnect){
                onNtripConnect();
            } else {
                onNtripClose();
            }
          }}
      />
      <View style={styles.hrLine} />
      {ntripSettings.selectedMntp !== null && (
        <View style={styles.mountpointInfo}>
          <Text style={styles.title}>Podrobnosti mountpointu</Text>
          <RowWithLabelAndValue
            label="Název"
            value={ntripSettings.selectedMntp.id}
          />
          <RowWithLabelAndValue
            label="Formát dat"
            value={ntripSettings.selectedMntp.format}
          />
          <RowWithLabelAndValue
            label="Navigační sytémy"
            value={ntripSettings.selectedMntp.navSystem}
          />
          <RowWithLabelAndValue
            label="Je virtuální"
            value={ntripSettings.selectedMntp.isVirtual ? 'Ano' : 'Ne'}
          />
        </View>
      )}
    </ScrollView>
  );
};

export default Ntrip;

// Helper functions
function utf8_to_b64(str) {
  const bytes = encode(str);
  return bytes;
}
