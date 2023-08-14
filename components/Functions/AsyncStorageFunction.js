  export const setObjectValue = async (value) => {
    const jsonValue = JSON.stringify(value)
    AsyncStorage.setItem('key', jsonValue).then(() => console.log('Done.')).catch(e => {console.log(e)});

  }

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
      alert('Storage successfully cleared!');
    } catch (e) {
      alert('Failed to clear the async storage.');
    }
  };