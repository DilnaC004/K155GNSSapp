import { React, useContext } from 'react';
import {View} from 'react-native';
import {styles} from '../../Styles/styles';
import RowWithLabelAndValue from '../RowWithLabelAndValue';
import { DataContext } from '../../Functions/DataContext';

export default ProjectDescription = ({projectSettings}) => {
  const { data } = useContext(DataContext);

  return (
    <View style={styles.zakazkaInfo}>
        <RowWithLabelAndValue
          label="Název zakázky"
          value={data.projects[projectSettings.projectId]?.title || ""}
        />
        <RowWithLabelAndValue
          label="Datum vytvoření"
          value={data.projects[projectSettings.projectId]?.date || ""}
        />
        <RowWithLabelAndValue
          label="Počet změřených bodů"
          value={data.projects[projectSettings.projectId]?.pointCount?.toString() || ""}
        />
        <RowWithLabelAndValue
          label="Popis"
          value={data.projects[projectSettings.projectId]?.description || ""}
        />
    </View>
  );
};
