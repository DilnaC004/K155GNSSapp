# K155GNSSapp

How to set up development environment - https://reactnative.dev/docs/environment-setup

run project with - yarn start

packages:
- yarn add react-native-vector-icons
- yarn add react-native-ble-plx
- npm i gps 
- yarn add @react-native-async-storage/async-storage - https://react-native-async-storage.github.io/async-storage/docs/api
- yarn add react-native-document-picker 
- npm i react-native-fs
- npm i react-native-bluetooth-classic - https://github.com/kenjdavidson/react-native-bluetooth-classic

# TODO
- separate ubx and nmea from bluetooth datastream
- connect rtcm data from ntrip to bluetooth
- connect bluetooth datastream to GPS.js object, not just GGA
- write raw data
- rewrite newPoint - updateCoordinates - Measurement.js

- view Points in JTSK coordinates
- map
- skyplot
- continuous measurement on satellite
- placing
- import points
- firebase upload
- add unpaired bluetooth devices
- i18n