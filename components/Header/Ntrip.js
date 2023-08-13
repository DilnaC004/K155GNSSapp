import React, {useState, useRef} from 'react';
import {View, Text, TextInput, Button, ScrollView} from 'react-native';
import Snackbar from 'react-native-snackbar';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import SelectDropdown from 'react-native-select-dropdown';
import RowWithLabelAndValue from './RowWithLabelAndValue';
import axios from 'axios';
import {encode} from 'base-64';
import TcpSocket from 'react-native-tcp-socket';

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

const Ntrip = () => {
  const [ntripSettings, setNtripSettings] = useState({
    ntripIp: '195.245.209.181',
    ntripPort: '2101',
    ntripUsername: 'cvutvyuka',
    ntripPassword: 'k155dremejakokone',
    selectedMntp: null,
    mountpoints: [],
  });

  const mountpointSelectRef = useRef();

  // Funkce pro aktualizaci nastavení
  const updateNtripSettings = newSettings => {
    setNtripSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  };

  const handleMntpSelectChange = () => {
    // Perform logic based on MNTP selection change
    //setShowFlatList(true); // set to true when button is clicked

    console.log('Zkouším se připojit k Czepos');

    console.log(`http://${ntripSettings.ntripIp}:${ntripSettings.ntripPort}`);
    axios
      .get(`http://${ntripSettings.ntripIp}:${ntripSettings.ntripPort}`)
      .then(response => {
        const mountpoints = [];
        const sourceData = response.data.split('\r\n');

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
      })
      .catch(err => {
        console.log(err.message);
        updateNtripSettings({mountpoints: [], selectedMntp: null});
        Snackbar.show({
          text: `Chyba komunikace se serverem \r\nhttp://${ntripSettings.ntripIp}:${ntripSettings.ntripPort}`,
          duration: Snackbar.LENGTH_SHORT,
          textColor: 'red',
          marginBottom: 5,
        });
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
    const client = TcpSocket.createConnection(options, () => {
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

      setTimeout(() => {
        client.end();
        console.log('Client byl ukončen : DEBUG!!');
      }, 10000);
    });

    client.on('data', function (data) {
      console.log('message was received', data);
    });

    client.on('error', function (error) {
      console.log(error);
    });

    client.on('close', function () {
      console.log('Connection closed!');
    });
  };

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
        title="Připoj se k NTRIP serveru"
        id="NTRIPpripoj"
        style={styles.button}
        onPress={onNtripConnect}
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

const styles = {
  nastContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  hrLine: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  nastCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 8,
    padding: 8,
  },
  dropdownBtnStyle: {
    width: '100%',
    height: 35,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginTop: 8,
    marginBottom: 8,
  },
  dropdownBtnTxtStyle: {color: '#444', textAlign: 'left'},
  button: {
    marginBottom: 8,
  },
  mountpointInfo: {
    paddingBottom: 25,
  },
};

// Helper functions
function utf8_to_b64(str) {
  const bytes = encode(str);
  return bytes;
}
