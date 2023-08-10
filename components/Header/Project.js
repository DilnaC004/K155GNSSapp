import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, Text, TextInput, Button, ScrollView, TouchableOpacity, FlatList, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons'
import AsyncStorage from '@react-native-async-storage/async-storage';
import DocumentPicker, {
  DirectoryPickerResponse,
  DocumentPickerResponse,
  isCancel,
  isInProgress,
  types,
} from 'react-native-document-picker'
import RNFS from 'react-native-fs';


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
    <Text style={[styles.title, { color: textColor1 }]}>B </Text>
    <Text style={[styles.title, { color: textColor }]}>{item.b.toFixed(7)} </Text>
    <Text style={[styles.title, { color: textColor1 }]}>L </Text>
    <Text style={[styles.title, { color: textColor }]}>{item.l.toFixed(7)} </Text>
    <Text style={[styles.title, { color: textColor1 }]}>H </Text>
    <Text style={[styles.title, { color: textColor }]}>{item.h.toFixed(3)} </Text>
  </ScrollView>
);

const Project = ({data, setData, projectId, setprojectId, saveDataToAsyncStorage}) => {

  const [projectTitle, setprojectTitle] = useState('');
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
    const jsonValue = JSON.stringify(value)
    AsyncStorage.setItem('key', jsonValue).then(console.log('Done.')).catch(e => {console.log(e)});

  }

  getObjectValue = async () => {
    AsyncStorage.getItem('key')
      .then(data => {
        setData(JSON.parse(data));
      })
      .catch(e => {
        console.log(e);
      });
  };

  const updateAsyncStorage = (newPoint) => {
    // Adding the newPoint to the points array
    console.log(newPoint);
    // Adding the newPoint to the points array
    setProjectPoints([...projectPoints, newPoint]);

    const updatedData = data.map((project, index) => {
      if (index === projectId) {
        const updatedPoints = [...project.points, newPoint];
        return {...project, points: updatedPoints};
      }
      return project;
    });
    setData(updatedData);
    setShowCreatePoint(!showCreatePoint);
    saveDataToAsyncStorage(updatedData);
  };

  // function to add the new project to the array
  const addProject = () => {
    // construct the new project object
    const newProject = {
      title: newProjectTitle,
      description: newProjectDescription,
      path: newProjectPath,
      date: new Date().toLocaleString(), // Assuming you want to add the current date/time
      points: [], // add an empty array or whatever initial value you like
    };
    // add the new project to the data array
    if(data.length === 0){
      const updatedData = [...data, newProject];
      setData(updatedData);
      saveDataToAsyncStorage(updatedData);

    } else {
      const updatedData = newProject;
      setData(updatedData);
      saveDataToAsyncStorage(updatedData);

    }


    // clear the text inputs
    setNewProjectTitle('');
    setNewProjectDate('');
    setNewProjectDescription('');

    setShowCreateProject(!showCreateProject);
  };

  // add point into list of points and async storage NEED TO OPTIMAZE
  const addPoint = () => {
    const x = parseFloat(pointX);
    const y = parseFloat(pointY);
    const z = parseFloat(pointZ);

    if (isEnabled) {
      const newPoint = {
        title: pointTitle,
        b: x,
        l: y,
        h: z,
        accuB:0,
        accuL:0,
        accuH:0,
        pdop:0,
        time:0,
        ofset: 0,
        antena: 0,
        code:'input',
        date: new Date().toLocaleString(), 
      };
      updateAsyncStorage(newPoint);
    } else {
      const etrs = jtsk2etrs(y, x, z);
      const newPoint = {
        title: pointTitle,
        b: etrs.B,
        l: etrs.L,
        h: etrs.H,
        accuB:0,
        accuL:0,
        accuH:0,
        pdop:0,
        time:0,
        ofset: 0,
        antena: 0,
        code:'input',
        date: new Date().toLocaleString(), // Assuming you want to add the current date/time
      };
      updateAsyncStorage(newPoint);
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

  // Function to export points into txt
  const exportPoints = async () =>{
    try {
      const filePath = `${data[projectId].path.uri}/project.txt`;
      await RNFS.writeFile(filePath, JSON.stringify(data), 'utf8');
      console.log('Project data saved to file:', filePath);
    } catch (error) {
      console.error('Error saving project data:', error);
    }
  }

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
              DocumentPicker.pickDirectory().then(setNewProjectPath).catch(e => {console.log(e)});
            }}
          />
          <Button title="Založ zakázku" onPress={() => {
            addProject(); 
            setObjectValue(data);
            }} />
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
            //exportPoints();
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
            setData([]);
            setProjectPoints([]);
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
