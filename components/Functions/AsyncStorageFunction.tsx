import AsyncStorage from '@react-native-async-storage/async-storage';

export default function useAsyncStorage() {

 const setDataStorage = async (value: any) => {
    const jsonValue = JSON.stringify(value);
    AsyncStorage.setItem('key', jsonValue)
      .then(() => console.log('Saved data into Storage ' + value))
      .catch(e => {
        console.error('Error saving data:', e);
      });
  };
 const getDataStorage = async () => {
    try {
      const dataStorage = await AsyncStorage.getItem('key');
      if (dataStorage) {
        return JSON.parse(dataStorage);
      }
    } catch (e) {
      console.error('Error retrieving data:', e);
      return null;
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
