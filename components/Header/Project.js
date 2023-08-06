import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, TouchableOpacity, FlatList, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons'

import Importuj from './Import'

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

  const [data, setData] = useState( [
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
        ]
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
    ]
  },
    // more objects...
  ]);

  const [projectTitle, setprojectTitle] = useState('');
  const [projectId, setprojectId] = useState("null");
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

    // Function to handle picking the project path
    const pickProjectPath = async () => {
      /*
      try {
        const result = await DocumentPicker.pick({
          type: [DocumentPickerUtil.allFiles()],
        });
  
        // Save the picked path to state
        setNewProjectPath(result.uri);
      } catch (error) {
        // Handle any error that occurred during the picking process
        console.log('Error while picking the project path:', error);
      }
      */
    };

  // function to add the new project to the array
  const addProject = () => {
    // construct the new project object
    const newProject = {
      title: newProjectTitle,
      description: newProjectDescription,
      date: new Date().toLocaleString(), // Assuming you want to add the current date/time
      points: []  // add an empty array or whatever initial value you like
    };

    // add the new project to the data array
    setData([...data, newProject]);

    // clear the text inputs
    setNewProjectTitle('');
    setNewProjectDate('');
    setNewProjectDescription('');

    setShowCreateProject(!showCreateProject);
  };

  // Function to delete a project from the data array
  const deleteProject = (projectTitleToDelete) => {
      const updatedData = data.filter((project) => project.title !== projectTitleToDelete);
      setData(updatedData);
  };

  // Function to delete a point from a project in the data array
  const deletePoint = (projectTitleToDelete, pointTitleToDelete) => {
    const updatedData = data.map((project) => {
      if (project.title === projectTitleToDelete) {
        const updatedPoints = project.points.filter((point) => point.title !== pointTitleToDelete);
        setProjectPoints(updatedPoints);
        setproctPointCount(projectPoints.length);
        return { ...project, points: updatedPoints };
      }
      return project;
    });
    setData(updatedData);
  };

  const [isModalVisible, setModalVisible] = React.useState(false);

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
          {"\n"}
          <Text id="INFOnazevZakazky">Název zakázky: {projectTitle}</Text>
          {"\n"}
          <Text id="INFOdatumVytvoreni">Datum vytvoření: {projectDate}</Text>
          {"\n"}
          <Text id="INFOpocetBodu">Počet změřených bodů: {projectPointCount}</Text>
        </Text>
      </View>
      <View style={styles.hrLine} />
      <View style={styles.buttonContainer}>
        <Button title="Vyber Zakázku" onPress={() => {setShowFlatList(!showFlatList);}} />
        <Button title="Vytvoř zakázku" onPress={() => {setShowCreateProject(!showCreateProject);}} />
      </View>
      {showFlatList && ( // conditional rendering based on the new piece of state
        <View style={{ height: 100 }}>
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
          <TextInput style={styles.textInput} placeholder="Název zakázky" value={newProjectTitle} onChangeText={setNewProjectTitle} />
          <TextInput style={styles.textInput} placeholder="Popis" multiline={true} value={newProjectDescription} onChangeText={setNewProjectDescription}/>
          <Button title="Vyber cestu k projektu" onPress={pickProjectPath} />
          <Button title="Založ zakázku" onPress={addProject} />
        </View>
      )}
      <View style={styles.hrLine} />
      <View style={styles.buttonContainer}>
        <Button title="Zobraz uložené body" onPress={() => {if (projectId != "null") {setShowPointFlatList(!showPointFlatList)}}}/>
        <Button title="Vlož bod" onPress={() => {if (projectId != "null") {setShowCreatePoint(!showCreatePoint)}}} />
      </View>
      {showPointFlatList && ( // conditional rendering based on the new piece of state
        <View style={{ height: 100 }}>
          <FlatList
            data={projectPoints}
            renderItem={renderItemPoint}
            keyExtractor={item => item.title}
            extraData={projectTitle}
          />
        </View>
      )}
      {showCreatePoint && ( // conditional rendering based on the new piece of state
        <Importuj projectPoints={projectPoints} setProjectPoints={setProjectPoints} />
      )}

      <View style={styles.hrLine} />

      <View style={styles.buttonContainer}>
        <Button title="Exportuj body" onPress={() => {if (projectId != "null") {}}}/>
        <Button title="Importuj body" onPress={() => {if (projectId != "null") {}}} />
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
