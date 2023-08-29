import AsyncStorage from '@react-native-async-storage/async-storage';

export const setObjectValue = async (value: any) => {
  const jsonValue = JSON.stringify(value);
  AsyncStorage.setItem('key', jsonValue)
    .then(() => console.log('Saved data into Storage ' + value))
    .catch(e => {
      console.log(e);
    });
};
export const getObjectValue = async () => {
  try {
    const dataStorage = await AsyncStorage.getItem('key');
    if (dataStorage) {
      setData(JSON.parse(dataStorage)); // You need to have a state variable "data" to set the parsed data.
    }
  } catch (e) {
    console.log(e);
  }
};
export const clearStorage = async () => {
  try {
    await AsyncStorage.clear();
    Alert.alert('Storage successfully cleared!');
  } catch (e) {
    Alert.alert('Failed to clear the async storage.');
  }
};