import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, ScrollView, FlatList, TouchableOpacity, Buffer} from 'react-native';
import axios from 'axios';


const DATA = [
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
    title: 'RTK3-MSM',
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
    title: 'Second Item',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d72',
    title: 'Third Item',
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa963',
    title: 'Second Item',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e42972',
    title: 'Third Item',
  },

];

const Item = ({item, onPress, backgroundColor, textColor}) => (
  <TouchableOpacity onPress={onPress} style={[styles.item, {backgroundColor}]}>
    <Text style={[styles.title, {color: textColor}]}>{item.title}</Text>
  </TouchableOpacity>
);


const Ntrip = () => {
  const [ntripIp, setNtripIp] = useState('http://195.245.209.181:2101');//http://euref-ip.net 195.245.209.181
  const [ntripPort, setNtripPort] = useState('80'); //80 2101 
  const [ntripUsername, setNtripUsername] = useState('cvutvyuka');
  const [ntripPassword, setNtripPassword] = useState('k155dremejakokone');
  const [mountpoint, setmountpoint] = useState('CPRG3-MSM'); //CPRG3-MSM

  const [selectedId, setSelectedId] = useState();
  const [showFlatList, setShowFlatList] = useState(false); 

  const [advice, setAdvice] = useState("");
  const getRandomId = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return (Math.floor(Math.random() * 
        (max - min + 1)) + min).toString();
};

  const getAdvice = () => {
    axios
        .get("http://api.adviceslip.com/advice/" + 
            getRandomId(1, 200))
        .then((response) => {
            setAdvice(response.data.slip.advice);
        });
};


  const renderItem = ({item}) => {
    const backgroundColor = item.id === selectedId ? '#ccc' : '#ccc1';
    const color = item.id === selectedId ? 'white' : 'black';

    return (
      <Item
        item={item}
        onPress={() => {
        setSelectedId(item.id);
        setShowFlatList(false); // Hide the FlatList after an item is selected}
        }}
        backgroundColor={backgroundColor}
        textColor={color}
      />
    );
  };

  const handleNtripIpChange = (value) => {
    setNtripIp(value);
  };

  const handleNtripPortChange = (value) => {
    setNtripPort(value);
  };

  const handleNtripUsernameChange = (value) => {
    setNtripUsername(value);
  };

  const handleNtripPasswordChange = (value) => {
    setNtripPassword(value);
  };


  const handleNtripConnect = () => {

  };

  const handleMntpSelectChange = () => {
    // Perform logic based on MNTP selection change
    //setShowFlatList(true); // set to true when button is clicked

    console.log('Zkouším se připojit k Czepos');
    
    console.log(`${ntripIp}`);
    axios.get(`${ntripIp}`)
    .then((response) => {
        console.log(response);
    }).catch(
      err=> console.log(err)
      );


 /*
    axios
    .get("http://euref-ip.net")
    .then((response) => {
      console.log(response);
    });
*/
  };

  const handleMntpSelectConnected = () => {
    // Perform logic based on MNTP selection change
    setShowFlatList(false); // set to true when button is clicked
    setSelectedId(item.id);
  };

  return (
    <View style={styles.nastContainer}>

      <Text style={styles.title}>Nastavení NTRIP připojení:</Text>
      <TextInput
        style={styles.input}
        placeholder="Ip adresa serveru..."
        value={ntripIp}
        onChangeText={handleNtripIpChange}
      />
      <TextInput
        style={styles.input}
        placeholder="port..."
        value={ntripPort}
        onChangeText={handleNtripPortChange}
      />
      <Button title="MountPointy" style={styles.button} onPress={handleMntpSelectChange} />
      <View style={styles.hrLine} />
      <View style={{ height: 150 }}>
      {showFlatList && ( // conditional rendering based on the new piece of state
        <FlatList
          data={DATA}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          extraData={selectedId}
        />
      )}
      </View>
      <Text style={styles.title}>Připojení k MountPointu:</Text>
      <TextInput
        style={styles.input}
        placeholder="Uživatelské jméno"
        value={ntripUsername}
        onChangeText={handleNtripUsernameChange}
      />
      <TextInput
        style={styles.input}
        placeholder="Heslo"
        value={ntripPassword}
        onChangeText={handleNtripPasswordChange}
        secureTextEntry
      />
      <Button title="Připoj" id="NTRIPpripoj" style={styles.button} onPress={handleNtripConnect} />
      <View style={styles.hrLine} />
      <Text style={styles.title}>Podrobnosti mountpointu</Text>

      <View id="mntpTable" style={styles.mntpTable} >
      <Text>{selectedId}</Text>
      </View>
      <View style={styles.container}>
            <Text style={styles.advice}>{advice}</Text>
            <Button title="Get Advice" 
                onPress={getAdvice} color="green" />
      </View>
      
    </View>
  );
};

export default Ntrip;

const styles = {
  nastContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  appVersion: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  appVersionNumber: {
    fontWeight: 'normal',
  },
  appRelease: {
    fontWeight: 'normal',
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
  refreshButton: {
    marginRight: 8,
    padding: 8,
  },
  refreshIcon: {
    width: 24,
    height: 24,
  },
  selectContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginRight: 8,
  },
  select: {
    height: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 8,
    padding: 8,
  },
  button: {
    marginBottom: 8,
  },
  mntpTable: {
    marginBottom: 16,
  },
  item: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
};

// Helper functions
function utf8_to_b64(str) {
  return Buffer.from(str, 'utf-8').toString('base64');
}

function b64_to_utf8(str) {
  return Buffer.from(str, 'base64').toString('utf-8');
}