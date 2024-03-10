import React, { useState, useEffect, useContext } from 'react';
import { SafeAreaView, View, Text, Button, PermissionsAndroid, Platform } from 'react-native';
import Snackbar from 'react-native-snackbar';
import { styles } from '../Styles/styles';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { debounce } from 'lodash';
import configurationData from '../configurationData';
import { DataContext } from '../Functions/DataContext';


export const Map = ({}) => {
  const { data } = useContext(DataContext);
  const point = data.projects[data.projectSettings.projectId].points
  const [initialRegion, setInitialRegion] = useState(null);
  const [region, setRegion] = useState(initialRegion);
  const debouncedSetRegion = debounce(setRegion, 100);

  useEffect(() => {
    Snackbar.show({
      text: 'Tato funkce je ve vývoji',
      duration: Snackbar.LENGTH_SHORT,
      textColor: 'red',
      marginBottom: 5,
    });
  }, []);

  useEffect(() => {
    if (point.length > 0 && !initialRegion) {
      const latitudes = point.map((point) => point.b);
      const longitudes = point.map((point) => point.l);

      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);

      const deltaLat = Math.abs(maxLat - minLat);
      const deltaLng = Math.abs(maxLng - minLng);

      setInitialRegion({
        latitude: (maxLat + minLat) / 2,
        longitude: (maxLng + minLng) / 2,
        latitudeDelta: deltaLat * 1.5, // Add some padding to the delta
        longitudeDelta: deltaLng * 1.5, // Add some padding to the delta
      });
    }
  }, [point]);

  useEffect(() => {   /// SMAZAT
    console.log('InitialRegion: ', initialRegion);
  }, [initialRegion]);

  const onRegionChange = (newRegion) => {
    debouncedSetRegion(newRegion);
  };

  useEffect(() => {
    return () => {
      debouncedSetRegion.cancel();
    };
  }, []);

  return (
    <View style={styles.mapContainer}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onRegionChange={onRegionChange}
      >
        {point.map((point, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: point.b, longitude: point.l }}
            title={point.title}
            calloutEnabled={true}
          />
        ))}
      </MapView>
    </View>
  );
};

export default Map;