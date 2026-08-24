import AsyncStorage from '@react-native-async-storage/async-storage';

export default function useAsyncStorage(updateData) {

 const setDataStorage = async (value) => {
    const jsonValue = JSON.stringify(value);
    try {
      await AsyncStorage.setItem('key', jsonValue);
      console.log("Save data to storage");
    } catch (e) {
      console.error('Error saving data:', e);
    }
  };
 const getDataStorage = async () => {
    try {
      const dataStorage = await AsyncStorage.getItem('key');
      if (dataStorage) {
        console.log("Load data from storage");
        updateData(JSON.parse(dataStorage));
      }
    } catch (e) {
      console.error('Error retrieving data:', e);
    }
  };

 const clearDataStorage = async () => {
    try {
      await AsyncStorage.clear();
      console.log('Cleared AsyncStorage');
    } catch (e) {
      console.error('Error clearing AsyncStorage:', e);
    }
  };

return {setDataStorage,getDataStorage, clearDataStorage}
}
