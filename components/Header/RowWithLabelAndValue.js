import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const RowWithLabelAndValue = ({label, value}) => {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label.toString()}:</Text>
      <Text style={styles.value}>{value.toString()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 14,
  },
});

export default RowWithLabelAndValue;
