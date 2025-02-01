import React, { useState, useEffect, useContext, useCallback } from 'react';
import { SafeAreaView, View, Text, Button, PermissionsAndroid, Platform } from 'react-native';
import Snackbar from 'react-native-snackbar';
import { styles } from '../Styles/styles';
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import { DataContext } from '../Functions/DataContext';
// import WebView from 'react-native-webview';
// import MapScript from './MapScript';
import { etrs2jtsk } from '../Calculations/transformation';

const Map = ({ updateModalType }) => {
  const { data, updateData } = useContext(DataContext);
  const point = data.projects[data.projectSettings.projectId].points
  const [placingSettings, setPlacingSettings] = useState(data.placingSettings);
  const updatePlacingSettings = useCallback(
      (newSettings) => {
        setPlacingSettings((prevSettings) => ({
          ...prevSettings,
          ...newSettings,
        }));
      },
      [setPlacingSettings]
    );
    
  const [region, setRegion] = useState({
    latitude: 50.1042375,
    longitude: 14.3883522,
    latitudeDelta: 1,
    longitudeDelta: 1,
  });

  const changeToPlacing = () => {
    updateModalType({
      point: false,
      placing: true,
      skyplot: false,
      bluetooth: false,
      ntrip: false,
      project: false,
      map: false,
      learn: false,
      calculate: false,
      measurement: true,
    });
  };

  const handlePlacingButton = (pointID) => {
    console.log('Placing button pressed');
    changeToPlacing();
    updatePlacingSettings({ selectedPoint: pointID });
  };

  const CustomCallout = ({ title, description, pointIndex }) => {
    return (
      <View style={styles.mapCustomCallout}>
        <Text style={[styles.title, { fontWeight: 'bold' }]}>{title}</Text>
        <Text style={styles.title}>{description}</Text>
        <Button title='Vytyc bod' onPress={() => handlePlacingButton(pointIndex)}></Button>
      </View>
    );
  };

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
        latitudeDelta: Math.abs(maxLat - minLat) + 0.5,
        longitudeDelta: Math.abs(maxLng - minLng) + 0.5,
      };
      setRegion(newRegion);
    }
  };

  
  useEffect(() => {
    fitMapbyPoints();
  }, [point]);

  return (
    <SafeAreaView style={styles.mapContainer}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}>
        {point.map((point, index) => {
          const jtskCoordinates = etrs2jtsk(point.b, point.l, point.h);
          const pointDescription = 'Y = ' + jtskCoordinates.Y.toFixed(3) + 'm\nX = ' + jtskCoordinates.X.toFixed(3)+ 'm\nH = ' + jtskCoordinates.Hbpv.toFixed(3) + 'm';
          return (
            <Marker
              key={index}
              coordinate={{ latitude: point.b, longitude: point.l }}>
                <Callout>
                <CustomCallout
                  title={point.title}
                  description={pointDescription}
                  pointIndex={index}           
                />
              </Callout>
            </Marker>
          );
        })}
      </MapView>
    </SafeAreaView>
  );
};

export default Map;

{/* Not functioning map with tiles, will retry */}
{/* <MapView
style={styles.map}
region={region}
mapType={Platform.OS == 'android' ? 'none' : 'standard'}>
<UrlTile
  urlTemplate='http://tile.openstreetmap.org/{z}/{x}/{y}.png'
  maximumZ={19}
  tileSize={256}
/>
{point.map((point, index) => {
  const pointDescription = 'Y = ' + point.y.toFixed(3) + 'm\nX = ' + point.x.toFixed(3) + 'm\nH = ' + point.z.toFixed(3) + 'm';
  return (
    <Marker
      key={index}
      coordinate={{ latitude: point.b, longitude: point.l }}>
      <Callout>
        <CustomCallout
          title={point.title}
          description={pointDescription}
        />
      </Callout>
    </Marker>
  );
})}
</MapView> */}