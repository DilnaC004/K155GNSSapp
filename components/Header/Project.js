import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, TouchableOpacity, FlatList, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons'
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DocumentPicker, DocumentPickerUtil} from 'react-native-document-picker'

import { etrs2jtsk, jtsk2etrs} from '../Calculations/transformation'



const ItemProject = ({item, onPress, backgroundColor, textColor}) => (
  <TouchableOpacity onPress={onPress} style={[styles.boldText, {backgroundColor}]}>
    <Text style={[styles.title, {color: textColor}]}>{item.title} </Text>
  </TouchableOpacity>
);

const ItemPoint = ({ item, onPress, backgroundColor, textColor, textColor1 }) => (
  <ScrollView
    horizontal
    contentContainerStyle={styles.scrollViewContent}
    showsHorizontalScrollIndicator={false}
  >
    <Text style={[styles.title, { color: textColor1 }]}>{item.title} </Text>
    <Text style={[styles.title, { color: textColor1 }]}>X </Text>
    <Text style={[styles.title, { color: textColor }]}>{item.x.toFixed(3)} </Text>
    <Text style={[styles.title, { color: textColor1 }]}>Y </Text>
    <Text style={[styles.title, { color: textColor }]}>{item.y.toFixed(3)} </Text>
    <Text style={[styles.title, { color: textColor1 }]}>H Bpv </Text>
    <Text style={[styles.title, { color: textColor }]}>{item.z.toFixed(3)} </Text>
    <Text style={[styles.title, { color: textColor1 }]}>B </Text>
    <Text style={[styles.title, { color: textColor }]}>{item.b.toFixed(7)} </Text>
    <Text style={[styles.title, { color: textColor1 }]}>L </Text>
    <Text style={[styles.title, { color: textColor }]}>{item.l.toFixed(7)} </Text>
    <Text style={[styles.title, { color: textColor1 }]}>H </Text>
    <Text style={[styles.title, { color: textColor }]}>{item.h.toFixed(3)} </Text>
  </ScrollView>
);

const Project = () => {
  const [data, setData] = useState([
    {
      title: 'Mereni 1',
      description: 'null',
      date: '21.7.2023 18:26:36',
      points: [
        {
          title: 'Bod1',
          x: 1,
          y: 2,
          z: 3,
          b: 1,
          l: 2,
          h: 3,
          ofset: 0.5,
          antena: 1.5,
          date: '21.7.2023 19:26:36',
        },
        {
          title: 'Bod2',
          x: 1,
          y: 2,
          z: 3,
          b: 1,
          l: 2,
          h: 3,
          ofset: 0.5,
          antena: 1.5,
          date: '21.7.2023 19:26:36',
        },
      ],
    },
    {
      title: 'Mereni 2',
      description: 'nukll',
      date: '21.7.2023 19:26:36',
      points: [
        {
          title: 'Bod1',
          x: 1,
          y: 2,
          z: 3,
          b: 1,
          l: 2,
          h: 3,
          ofset: 0.5,
          antena: 1.5,
          date: '21.7.2023 19:26:36',
        },
        {
          title: 'Bod2',
          x: 1,
          y: 2,
          z: 3,
          b: 1,
          l: 2,
          h: 3,
          ofset: 0.5,
          antena: 1.5,
          date: '21.7.2023 19:26:36',
        },
        {
          title: 'Bod3',
          x: 1,
          y: 2,
          z: 3,
          b: 1,
          l: 2,
          h: 3,
          ofset: 0.5,
          antena: 1.5,
          date: '21.7.2023 19:26:36',
        },
      ],
    },
    // more objects...
  ]);

  const [projectTitle, setprojectTitle] = useState('');
  const [projectId, setprojectId] = useState('null');
  const [projectDate, setprojectDate] = useState('');
  const [projectPointCount, setproctPointCount] = useState('');
  const [projectPoints, setProjectPoints] = useState([]);
  const [showFlatList, setShowFlatList] = useState(false);
  const [showPointFlatList, setShowPointFlatList] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreatePoint, setShowCreatePoint] = useState(false);

  // state for the text inputs
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDate, setNewProjectDate] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectPath, setNewProjectPath] = useState('');

  // state point inputs
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

  // functions to save measured point into AsyncStorage
  const clearStorage = async () => {
    try {
      await AsyncStorage.clear();
      alert('Storage successfully cleared!');
    } catch (e) {
      alert('Failed to clear the async storage.');
    }
  };

  setObjectValue = async (value) => {
    try {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem('key', jsonValue)
    } catch(e) {
      // save error
    }
  
    console.log('Done.')
  }

  getObjectValue = async () => {
    AsyncStorage.getItem('key')
      .then(data => {
        console.log(JSON.parse(data));
        setData(JSON.parse(data));
      })
      .catch(e => {
        console.log(e);
      });
  };


  // Function to handle picking the project path
  const pickProjectPath = async () => {
      try {
        const result = await DocumentPicker.pickDirectory();
  
        // Save the picked path to state
        setNewProjectPath(result.uri);
      } catch (error) {
        // Handle any error that occurred during the picking process
        console.log('Error while picking the project path:', error);
      }
  };

  // function to add the new project to the array
  const addProject = () => {
    // construct the new project object
    const newProject = {
      title: newProjectTitle,
      description: newProjectDescription,
      date: new Date().toLocaleString(), // Assuming you want to add the current date/time
      points: [], // add an empty array or whatever initial value you like
    };

    // add the new project to the data array
    setData([...data, newProject]);
    setObjectValue(data);

    // clear the text inputs
    setNewProjectTitle('');
    setNewProjectDate('');
    setNewProjectDescription('');

    setShowCreateProject(!showCreateProject);
  };

  const addPoint = () => {
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

        const updatedData = data.map((project, index) => {
          if (index === projectId) {
            const updatedPoints = [...project.points, newPoint];
            return { ...project, points: updatedPoints };
          }
          return project;
        });
        setData(updatedData);
        setShowCreatePoint(!showCreatePoint);
        setObjectValue(data);
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
        // Adding the newPoint to the points array
        setProjectPoints([...projectPoints, newPoint]);

        const updatedData = data.map((project, index) => {
          if (index === projectId) {
            const updatedPoints = [...project.points, newPoint];
            return { ...project, points: updatedPoints };
          }
          return project;
        });
        setData(updatedData);
        setShowCreatePoint(!showCreatePoint);
        setObjectValue(data);
      }
    }

    // Clear the input after adding the point
    setPointTitle('');
    setPointX('');
    setPointY('');
    setPointZ('');
  };

  // Function to delete a project from the data array
  const deleteProject = projectTitleToDelete => {
    const updatedData = data.filter(
      project => project.title !== projectTitleToDelete,
    );
    setData(updatedData);
  };

  // Function to delete a point from a project in the data array
  const deletePoint = (projectTitleToDelete, pointTitleToDelete) => {
    const updatedData = data.map(project => {
      if (project.title === projectTitleToDelete) {
        const updatedPoints = project.points.filter(
          point => point.title !== pointTitleToDelete,
        );
        setProjectPoints(updatedPoints);
        setproctPointCount(projectPoints.length);
        return {...project, points: updatedPoints};
      }
      return project;
    });
    setData(updatedData);
  };

  const renderItemProject = ({item}) => {
    const backgroundColor = item.title === projectTitle ? '#ccc' : '#ccc1';
    const color = item.title === projectTitle ? 'white' : 'black';

    return (
      <View style={styles.buttonContainer}>
        <ItemProject
          item={item}
          onPress={() => {
            setprojectTitle(item.title);
            setprojectDate(item.date);
            setproctPointCount(item.points.length);
            // Find the index of the selected project in the data array
            const index = data.indexOf(item);
            setprojectId(index); // Set projectId to the index of the selected project
            setProjectPoints(item.points);

            setShowFlatList(false); // Hide the FlatList after an item is selected}
          }}
          backgroundColor={backgroundColor}
          textColor={color}
        />
        <TouchableOpacity onPress={() => deleteProject(item.title)}>
          <IconMaterialIcons name="delete" size={24} color="black" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderItemPoint = ({item}) => {
    const backgroundColor = item.title === projectTitle ? '#ccc' : '#ccc1';
    const color = item.title === projectTitle ? 'white' : 'black';

    return (
      <View style={styles.buttonContainer}>
        <ItemPoint
          item={item}
          backgroundColor={backgroundColor}
          textColor={'gray'}
          textColor1={'white'}
        />
        <TouchableOpacity onPress={() => deletePoint(projectTitle, item.title)}>
          <IconMaterialIcons name="delete" size={24} color="black" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.domovContainer}>
      <View style={styles.zakazkaInfo}>
        <Text>
          <Text style={styles.boldText}>Informace o aktuální zakázce</Text>
          {'\n'}
          <Text id="INFOnazevZakazky">Název zakázky: {projectTitle}</Text>
          {'\n'}
          <Text id="INFOdatumVytvoreni">Datum vytvoření: {projectDate}</Text>
          {'\n'}
          <Text id="INFOpocetBodu">
            Počet změřených bodů: {projectPointCount}
          </Text>
        </Text>
      </View>
      <View style={styles.hrLine} />
      <View style={styles.buttonContainer}>
        <Button
          title="Vyber Zakázku"
          onPress={() => {
            setShowFlatList(!showFlatList);
          }}
        />
        <Button
          title="Vytvoř zakázku"
          onPress={() => {
            setShowCreateProject(!showCreateProject);
          }}
        />
      </View>
      {showFlatList && ( // conditional rendering based on the new piece of state
        <View style={{height: 100}}>
          <FlatList
            data={data}
            renderItem={renderItemProject}
            keyExtractor={item => item.title}
            extraData={projectTitle}
          />
        </View>
      )}
      {showCreateProject && ( // conditional rendering based on the new piece of state
        <View>
          <TextInput
            style={styles.textInput}
            placeholder="Název zakázky"
            value={newProjectTitle}
            onChangeText={setNewProjectTitle}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Popis"
            multiline={true}
            value={newProjectDescription}
            onChangeText={setNewProjectDescription}
          />
          <Button
            title="Vyber cestu k projektu"
            onPress={() => {
              DocumentPicker.pickSingle();
            }}
          />
          <Button title="Založ zakázku" onPress={addProject} />
        </View>
      )}
      <View style={styles.hrLine} />
      <View style={styles.buttonContainer}>
        <Button
          title="Zobraz uložené body"
          onPress={() => {
            if (projectId != 'null') {
              setShowPointFlatList(!showPointFlatList);
            }
          }}
        />
        <Button
          title="Vlož bod"
          onPress={() => {
            if (projectId != 'null') {
              setShowCreatePoint(!showCreatePoint);
            }
          }}
        />
      </View>
      {showPointFlatList && ( // conditional rendering based on the new piece of state
        <View style={{height: 120}}>
          <FlatList
            data={projectPoints}
            renderItem={renderItemPoint}
            keyExtractor={item => item.title}
            extraData={projectTitle}
          />
          <View style={styles.hrLine} />
        </View>
      )}
      {showCreatePoint && ( // conditional rendering based on the new piece of state
        <View>
          <View style={styles.buttonContainer}>
            <TextInput
              style={styles.textInput}
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
            style={styles.textInput}
            placeholder={switchY}
            value={pointY}
            onChangeText={setPointY}
            maxLength={11} // Set the maximum number of characters allowed
            keyboardType="numeric" // Set the keyboard to numeric mode
          />
          <TextInput
            style={styles.textInput}
            placeholder={switchX}
            value={pointX}
            onChangeText={setPointX}
            maxLength={11} // Set the maximum number of characters allowed
            keyboardType="numeric" // Set the keyboard to numeric mode
          />
          <TextInput
            style={styles.textInput}
            placeholder={switchZ}
            value={pointZ}
            onChangeText={setPointZ}
            maxLength={7} // Set the maximum number of characters allowed
            keyboardType="numeric" // Set the keyboard to numeric mode
          />
          <Button title="Ulož bod" onPress={addPoint} />
        </View>
      )}

      <View style={styles.hrLine} />

      <View style={styles.buttonContainer}>
        <Button
          title="Exportuj body"
          onPress={() => {
            getObjectValue();
          }}
        />
        <Button
          title="Importuj body"
          onPress={() => {
            if (projectId != 'null') {
            }
          }}
        />
        <Button
          title="Vše vymaž"
          onPress={() => {
            clearStorage();
          }}
        />
      </View>
    </View>
  );
};

export default Project;

const styles = {
  domovContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  zakazkaInfo: {
    marginBottom: 16,
  },
  boldText: {
    fontWeight: 'bold',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hrLine: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  plusButton: {
    marginRight: 8,
  },
  selectContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  selectInput: {
    height: 40,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalContainer: {
    flex: 1,
    padding: 16,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 16,
    padding: 8,
  },
  modalInfoText: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  seznamContainer: {
    marginBottom: 16,
  },
  modalImportContainer: {
    flex: 1,
    padding: 16,
  },
  textCenter: {
    textAlign: 'center',
    marginBottom: 16,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scrollViewContent: {
    flexDirection: 'row', // Important: Set the flexDirection to 'row' for horizontal scrolling
  },

};
