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
  const [region, setRegion] = useState({
    latitude: 50.1042375,
    longitude: 14.3883522,
    latitudeDelta: 1,
    longitudeDelta: 1,
  });

  useEffect(() => {
    Snackbar.show({
      text: 'Tato funkce je ve vývoji',
      duration: Snackbar.LENGTH_SHORT,
      textColor: 'red',
      marginBottom: 5,
    });
  }, []);

  const fitMapbyPoints = () => {
    if (point.length > 0) {
      const latitudes = point.map((point) => point.b);
      const longitudes = point.map((point) => point.l);

      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);

      const newRegion = {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: Math.abs(maxLat - minLat) + 0.05,
        longitudeDelta: Math.abs(maxLng - minLng) + 0.05,
      };
      console.log(point);
      console.log(newRegion);
      setRegion(newRegion);
    }
  };

  
  useEffect(() => {
    fitMapbyPoints();
  }, [point]);

  return (
    <View style={styles.mapContainer}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}>
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