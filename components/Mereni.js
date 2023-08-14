import React, {useState, useEffect} from 'react';
import { View, Text, TextInput, Button, Switch } from 'react-native';

import { etrs2jtsk } from './Calculations/transformation';

const Mereni = ({nmeaParsed, updateCoordinates}) => {
  const [nazevBodu, setNazevBodu] = React.useState('');
  const [boolRtk, setBoolRtk] = React.useState(false);
  const [boolRaw, setBoolRaw] = React.useState(false);

  const [coordX, setCoordX] = React.useState(0);
  const [coordY, setCoordY] = React.useState(0);
  const [coordZ, setCoordZ] = React.useState(0);
  const [coordPDOP, setcoordPDOP] = React.useState(0);
  const [coordAccuX, setCoordAccuX] = React.useState(0);
  const [coordAccuY, setCoordAccuY] = React.useState(0);
  const [coordAccuZ, setCoordAccuZ] = React.useState(0);
  const [coordMeasuredTime, setCoordMeasuredTime] = React.useState(0);
  const [sumCoordX, setSumCoordX] = React.useState(0);
  const [sumCoordY, setSumCoordY] = React.useState(0);
  const [sumCoordZ, setSumCoordZ] = React.useState(0);


  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
  const switchCoordinates = isEnabled ? 'ETRS89' : 'S-JTSK';
  const switchRtk = boolRtk ? 'ulož' : 'měř RTK';
  const switchRaw = boolRaw ? 'ulož' : 'měř RAW';
  const switchX = isEnabled ? 'B [°]' : 'X [m]';
  const switchY = isEnabled ? 'L [°]' : 'Y [m]';
  const switchZ = isEnabled ? 'H [m]' : 'H [m]';
  const switchCoordX = isEnabled ? coordX.toFixed(7) : etrs2jtsk(coordX, coordY, coordZ).X.toFixed(3); // OPTIMAZE TRANSFORMATION
  const switchCoordY = isEnabled ? coordY.toFixed(7) : etrs2jtsk(coordX, coordY, coordZ).Y.toFixed(3); // OPTIMAZE TRANSFORMATION
  const switchCoordZ = isEnabled ? coordZ.toFixed(3) : etrs2jtsk(coordX, coordY, coordZ).Hbpv.toFixed(3); // OPTIMAZE TRANSFORMATION

  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [formattedTime, setFormattedTime] = useState('00:00:00');

  const handleNazevBoduChange = (value) => {
    setNazevBodu(value);
  };

  const handleRtkPress = () => {
    if (!startTime) {
      setStartTime(new Date());
      setBoolRtk(!boolRtk);
      setEndTime(null);

      setCoordX(nmeaParsed.lat);

      console.log('start');
    } else {
      // If the timer is already running (start time is not null), stop the timer
      setEndTime(new Date());
      setBoolRtk(!boolRtk);
      setFormattedTime('00:00:00');
      setStartTime(null);

      setCoordAccuX(0);
      setCoordAccuY(0);
      setCoordAccuZ(0);
      setcoordPDOP(nmeaParsed.hdop);
      console.log(sumCoordX );
      console.log(coordMeasuredTime);
    
      updateCoordinates(nazevBodu, sumCoordX/coordMeasuredTime, sumCoordY/coordMeasuredTime, sumCoordZ/coordMeasuredTime, coordAccuX, coordAccuY, coordAccuZ, coordPDOP, coordMeasuredTime);

    }
  };

  const handleRawPress = () => {
    if (!startTime) {
      setStartTime(new Date());
      setBoolRaw(!boolRaw);
      setEndTime(null);
    } else {
      // If the timer is already running (start time is not null), stop the timer
      setEndTime(new Date());
      setBoolRaw(!boolRaw);
      setFormattedTime('00:00:00');
      setStartTime(null);

    }

  };

    // Use useEffect to start and stop the timer
    useEffect(() => {
      let intervalId;
      let measuredTime = 0;
      setCoordX(nmeaParsed.lat);
      setCoordY(nmeaParsed.lon);
      setCoordZ(nmeaParsed.alt);
      setcoordPDOP(nmeaParsed.hdop);


      if (startTime && !endTime) {
        // If the timer is running (start time is set, but end time is not)
        intervalId = setInterval(() => {
          const currentTime = new Date();
          measuredTime = Math.floor(
            (currentTime - startTime) / 1000,
          );
          const hours = String(Math.floor(measuredTime / 3600)).padStart(
            2,
            '0',
          );
          const minutes = String(
            Math.floor((measuredTime % 3600) / 60),
          ).padStart(2, '0');
          const seconds = String(measuredTime % 60).padStart(2, '0');
          setFormattedTime(`${hours}:${minutes}:${seconds}`);

          //Measure RTK point
          setSumCoordX(prevSumCoordX => prevSumCoordX + parseFloat(nmeaParsed.lat));
          setSumCoordY(prevSumCoordY => prevSumCoordY + parseFloat(nmeaParsed.lon));
          setSumCoordZ(prevSumCoordZ => prevSumCoordZ + parseFloat(nmeaParsed.alt));
          setCoordMeasuredTime(measuredTime);

        }, 1000);

      } else {
        // Clear the interval if the timer is not running
        clearInterval(intervalId);
        setSumCoordX(0);
        setSumCoordY(0);
        setSumCoordZ(0);
      }
      // Clean up the interval when the component unmounts
      return () => clearInterval(intervalId);
    }, [startTime, endTime, nmeaParsed]);


  return (
    <View style={styles.mereniContainer}>
        <TextInput
          style={styles.input}
          value={nazevBodu}
          placeholder="Název bodu"
          onChangeText={handleNazevBoduChange}
        />
      <View style={styles.buttonContainer}>
        <Button title={switchRtk} onPress={handleRtkPress} />
        <Button title={switchRaw} style={styles.BTRaw} onPress={handleRawPress} />
      </View>

      <View style={styles.tableContainer}>
        <View style={styles.buttonContainer}>
          <View>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>Systém :</Text>
              <Text style={styles.tableData}>{switchCoordinates}</Text>
              <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isEnabled}
            style={styles.switch}
          />
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>Doba měření :</Text>
              <Text style={styles.tableData}>{formattedTime}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>{switchY}</Text>
              <Text style={styles.tableData}>{switchCoordY}</Text>
              <Text style={styles.tableData}>{coordAccuY}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>{switchX}</Text>
              <Text style={styles.tableData}>{switchCoordX}</Text>
              <Text style={styles.tableData}>{coordAccuX}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>{switchZ}</Text>
              <Text style={styles.tableData}>{switchCoordZ}</Text>
              <Text style={styles.tableData}>{coordAccuZ}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>PDOP :</Text>
              <Text style={styles.tableData}>{coordPDOP}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Mereni;

const styles = {
  mereniContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  label: {
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 8,
    padding: 8,
  },
  zobrazCas: {
    marginBottom: 8,
  },
  slider: {
    marginBottom: 8,
  },
  vertical: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  checkboxProperty: {
    marginRight: 8,
  },
  checkboxPropertyLabel: {
    fontSize: 16,
  },
  hrLine: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  tableContainer: {
    marginBottom: 16,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tableHeader: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  tableData: {
    marginRight: 8,
  },
  BTRaw: {
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  switch: {
  },
};
