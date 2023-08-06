import React, {useState} from 'react';
import { View, Text, TextInput, Button, Switch} from 'react-native';

import { etrs2jtsk, jtsk2etrs} from '../Calculations/transformation'


const Importuj = ({ projectPoints, setProjectPoints }) => {

  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
  const switchCoordinates = isEnabled ? 'ETRS89' : 'S-JTSK';
  const switchX = isEnabled ? 'L [DMS]' : 'X [m]';
  const switchY = isEnabled ? 'B [DMS]' : 'Y [m]';
  const switchZ = isEnabled ? 'H [DMS]' : 'H [m]';
  const [pointTitle, setPointTitle] = useState('');
  const [pointX, setPointX] = useState('');
  const [pointY, setPointY] = useState('');
  const [pointZ, setPointZ] = useState('');

  const handleSavePoint = () => {
    const x = parseFloat(pointX);
    const y = parseFloat(pointY);
    const z = parseFloat(pointZ);

    if (isEnabled) {
      if (
        y <= 51.1 &&
        y >= 48.4 &&
        x <= 19.5 &&
        x >= 12 &&
        z <= 1700 &&
        z >= 0
      ) {

        const jtsk = etrs2jtsk(y, x, z);

        const newPoint = {
          title: pointTitle,
          b: x,
          l: y,
          h: z,
          x: jtsk.X,
          y: jtsk.Y,
          z: jtsk.Hbpv,
          type: 1,
          // Add other properties as needed...
          date: new Date().toLocaleString(), // Assuming you want to add the current date/time
        };
        console.log(newPoint);
        // Adding the newPoint to the points array
        setProjectPoints([...projectPoints, newPoint]);
        console.log(projectPoints);
      }
    } else {
      if (
        y <= 945650 &&
        y >= 373500 &&
        x <= 1201640 &&
        x >= 967980 &&
        z <= 1700 &&
        z >= 0
      ) {
        const etrs = jtsk2etrs(y, x, z);
        const newPoint = {
          title: pointTitle,
          b: etrs.B,
          l: etrs.L,
          h: etrs.H,
          x: x,
          y: y,
          z: z,
          type: 1,
          // Add other properties as needed...
          date: new Date().toLocaleString(), // Assuming you want to add the current date/time
        };
        // Adding the newPoint to the points array
        console.log(newPoint);
        setProjectPoints([...projectPoints, newPoint]);
      }
    }

    // Clear the input after adding the point
    setPointTitle('');
    setPointX('');
    setPointY('');
    setPointZ('');
  };

  // Assuming you have a function to convert DMS (Degrees Minutes Seconds) to Decimal degrees
  const convertDMSToDecimal = (dmsValue) => {
    // Implement your conversion logic here...
    // For example, convert "48°51'29.5"N" to decimal degrees.
    // Return the decimal degrees value.
    return decimalDegrees;
  };

  return (

    <View>
      <View style={styles.buttonContainer}>
      <TextInput
        style={styles.input}
        placeholder="Název bodu"
        value={pointTitle}
        onChangeText={setPointTitle}
      />
        <Text>{switchCoordinates}</Text>
        <Switch
        trackColor={{false: '#767577', true: '#81b0ff'}}
        thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleSwitch}
        value={isEnabled}
        style={styles.switch}
      />
      </View>
      <TextInput
        style={styles.input}
        placeholder={switchY}
        value={pointY}
        onChangeText={setPointY}
        maxLength={11} // Set the maximum number of characters allowed
        keyboardType="numeric" // Set the keyboard to numeric mode
      />
      <TextInput
        style={styles.input}
        placeholder={switchX}
        value={pointX}
        onChangeText={setPointX}
        maxLength={11} // Set the maximum number of characters allowed
        keyboardType="numeric" // Set the keyboard to numeric mode
      />
      <TextInput
        style={styles.input}
        placeholder={switchZ}
        value={pointZ}
        onChangeText={setPointZ}
        maxLength={7} // Set the maximum number of characters allowed
        keyboardType="numeric" // Set the keyboard to numeric mode
      />
      <Button title="Ulož bod" onPress={handleSavePoint} />
    </View>
  );
};

export default Importuj;

const styles = {
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 8,
    padding: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  switch: {
    outerWidth: 50
  }
};

