# K155GNSSapp

How to set up development environment - https://reactnative.dev/docs/environment-setup

run project with - yarn start

Which NMEA sentences does SW Maps use? Why can't I see the GNSS skyplot and accuracy?
SW Maps uses the NMEA GGA and RMC sentences for position and time, GSA and GSV sentences for skyplot display, and the GST sentence for accuracy. Enable these messages in your receiver.

packages:
- yarn add react-native-vector-icons
- yarn add react-native-ble-plx
- npm i gps 
- yarn add @react-native-async-storage/async-storage - https://react-native-async-storage.github.io/async-storage/docs/api
- yarn add react-native-document-picker 
- npm i react-native-fs
- npm i react-native-snackbar
- npm i react-native-select-dropdown
- npm i react-native-tcp-socket
- npm i react-native-bluetooth-classic - https://github.com/kenjdavidson/react-native-bluetooth-classic
- npm install react-native-compass-heading - https://github.com/firofame/react-native-compass-heading
- npm install react-native-maps - https://github.com/react-native-maps/react-native-maps

# TODO
- separate ubx and nmea from bluetooth datastream
- connect rtcm data from ntrip to bluetooth
- write raw data
- continuous measurement on satellite
- firebase upload
- add unpaired bluetooth devices - DONE ON BLE
- i18n
- dodelat preposilani RTK korekci do GNSS - moznost vypnuti, restartu, ukladani mnozstvi stazenych dat
- fix icons from png back to vector images