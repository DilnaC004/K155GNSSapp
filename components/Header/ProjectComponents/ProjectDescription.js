import React from 'react';
import {View} from 'react-native';
import {styles} from '../../Styles/styles';
import RowWithLabelAndValue from '../RowWithLabelAndValue';

export default ProjectDescription = ({projectSettings}) => {
  return (
    <View style={styles.zakazkaInfo}>
        <RowWithLabelAndValue
          label="Název zakázky"
          value={projectSettings.title}
        />
        <RowWithLabelAndValue
          label="Datum vytvoření"
          value={projectSettings.date}
        />
        <RowWithLabelAndValue
          label="Počet změřených bodů"
          value={projectSettings.projectPointCount}
        />
        <RowWithLabelAndValue
          label="Popis"
          value={projectSettings.description}
        />
    </View>
  );
};
