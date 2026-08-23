import React, { useState, useEffect, useContext } from 'react';
import { View, Button, Dimensions, Text } from 'react-native';
import { DataContext } from '../Functions/DataContext';
import { styles } from '../Styles/styles';
import Snackbar from 'react-native-snackbar';
import CreatePoint from './ProjectComponents/CreatePoint';
import CreateProject from './ProjectComponents/CreateProject';
import FlatListProject from './ProjectComponents/FlatListProject';
import FlatListPoint from './ProjectComponents/FlatListPoint';
import ProjectDescription from './ProjectComponents/ProjectDescription';
import ExportModal from './ProjectComponents/ExportModal';
import ImportModal from './ProjectComponents/ImportModal';
import FlatListStaticPoints from './ProjectComponents/FlatListStaticPoints';

export default Project = ({ clearStorage, setPlacingSettings, connectionSettings }) => {
  const { data, updateData } = useContext(DataContext);
  const [pointSettings, setPointSettings] = useState(data.pointSettings);
  const updatePointSettings = newSettings => {
    setPointSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  };
  const [projectSettings, setProjectSettings] = useState(data.projectSettings);
  const updateProjectSettings = newSettings => {
    setProjectSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  };

  // Nothing exists until the user makes a project, so every button that reaches
  // into data.projects has to check first
  const hasProject = data.projects?.[projectSettings.projectId] != null;

  const warnNoProject = () => {
    Snackbar.show({
      text: 'Zvol zakázku!',
      duration: Snackbar.LENGTH_SHORT,
      textColor: 'red',
      marginBottom: 5,
    });
  };

  const closeAll = () => {
    updateProjectSettings({
      showFlatList: false,
      showCreatePoint: false,
      showCreateProject: false,
      showPointFlatList: false,
      showExportModal: false,
      showImportModal: false,
      showStaticPoints: false
    });
  }

  useEffect(() => {
    return () => {
      updateData({
        pointSettings: pointSettings,
        projectSettings: projectSettings,
      });
    };
  }, [pointSettings, projectSettings]);

  return (
    <View style={styles.nastContainer}>
      <Text style={styles.headline}>Správa dat</Text>
      <ProjectDescription projectSettings={projectSettings} />
      <View style={styles.buttonContainer}>
        <Button
          title="Vyber Zakázku"
          onPress={() => {
            closeAll();
            updateProjectSettings({
              showFlatList: !projectSettings.showFlatList,
            });
          }}
        />
        <Button
          title="Vytvoř zakázku"
          onPress={() => {
            closeAll();
            updateProjectSettings({
              showCreateProject: !projectSettings.showCreateProject,
            });
          }}
        />
      </View>
      {projectSettings.showFlatList && ( // conditional rendering based on the new piece of state
        <FlatListProject
          projectSettings={projectSettings}
          updateProjectSettings={updateProjectSettings}
          setPlacingSettings={setPlacingSettings}
        />
      )}
      {projectSettings.showCreateProject && ( // conditional rendering based on the new piece of state
        <CreateProject updateProjectSettings={updateProjectSettings}/>
      )}
      <View style={styles.buttonContainer}>
        <Button
          title="Zobraz uložené body"
          onPress={() => {
            closeAll();
            if (!hasProject) {
              warnNoProject();
              return;
            }
            updateProjectSettings({
              showPointFlatList: !projectSettings.showPointFlatList,
            });
          }}
        />
        <Button
          title="Vlož bod"
          onPress={() => {
            closeAll();
            if (!hasProject) {
              warnNoProject();
              return;
            }
            updateProjectSettings({
              showCreatePoint: !projectSettings.showCreatePoint,
            });
          }}
        />
      </View>
      {projectSettings.showPointFlatList &&
        hasProject && ( // conditional rendering based on the new piece of state
          <FlatListPoint
            projectSettings={projectSettings}
            updateProjectSettings={updateProjectSettings}
            placing={false}
          />
        )}
      {projectSettings.showCreatePoint && ( // conditional rendering based on the new piece of state
        <CreatePoint
          updatePointSetting={updatePointSettings}
          pointSettings={pointSettings}
          projectSettings={projectSettings}
        />
      )}
      <View style={styles.buttonContainer}>
        <Button
          title="Export"
          onPress={() => {
            closeAll();
            if (!hasProject) {
              warnNoProject();
              return;
            }
            updateProjectSettings({
              showExportModal: !projectSettings.showExportModal,
            });
          }}
        />
        <Button
          title="Import"
          onPress={() => {
            closeAll();
            if (!hasProject) {
              warnNoProject();
              return;
            }
            updateProjectSettings({
              showImportModal: !projectSettings.showImportModal,
            });
          }}
        />
        {projectSettings.showExportModal &&
          hasProject && (
            <ExportModal
              projectSettings={projectSettings}
              updateProjectSettings={updateProjectSettings}
            />
          )}
        {projectSettings.showImportModal &&
          hasProject && (
            <ImportModal
              projectSettings={projectSettings}
              updateProjectSettings={updateProjectSettings}
            />
          )}
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Statická měření na přijímači"
          onPress={() => {
            closeAll();
            updateProjectSettings({
              showStaticPoints: !projectSettings.showStaticPoints,
            });
          }}
        />
      </View>
      {projectSettings.showStaticPoints && (
        <FlatListStaticPoints connectionSettings={connectionSettings} />
      )}
    </View>
  );
};
