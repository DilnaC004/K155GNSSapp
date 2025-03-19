import { StyleSheet, Dimensions } from 'react-native';

export const styles = {
  mereniContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  label: {
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 8,
    padding: 8,
  },
  vertical: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  hrLine: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  tableContainer: {
    marginBottom: 16,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tableHeader: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  tableData: {
    marginRight: 8,
  },
  BTRaw: {
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  switch: {
    outerWidth: 50,
  },
  text: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scrollViewContent: {
    flexDirection: 'row', // Added for horizontal scrolling
  },
  scrollView: {
    marginHorizontal: 10,
  },
  scrollViewContainer: {
    height: 4*Dimensions.get('window').height/7,
    paddingTop: 10,
  },
  messageContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 1,
  },
  nastContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  appVersion: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  appVersionNumber: {
    fontWeight: 'normal',
  },
  appRelease: {
    fontWeight: 'normal',
  },
  nastCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  refreshButton: {
    padding: 8,
    marginBottom: 20
  },
  refreshIcon: {
    width: 24,
    height: 24,
  },
  selectContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginRight: 8,
  },
  select: {
    height: 40,
  },
  button: {
    marginBottom: 8,
  },
  mntpTable: {
    marginBottom: 16,
  },
  domovContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  zakazkaInfo: {
    marginBottom: 16,
  },
  boldText: {
    fontWeight: 'bold',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  plusButton: {
    marginRight: 8,
  },
  selectInput: {
    height: 40,
  },
  modalContainer: {
    flex: 1,
    padding: 16,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 16,
    padding: 8,
  },
  modalInfoText: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  headerInfoText: {
    fontSize: 8,
    alignSelf: 'center',
  },
  seznamContainer: {
    marginBottom: 16,
  },
  modalImportContainer: {
    flex: 1,
    padding: 16,
  },
  textCenter: {
    textAlign: 'center',
    marginBottom: 16,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  dropdownBtnStyle: {
    width: '100%',
    height: 35,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginTop: 8,
    marginBottom: 8,
  },
  dropdownBtnTxtStyle: { color: '#444', textAlign: 'left' },
  button: {
    marginBottom: 8,
  },
  nastContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  hrLine: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 25,
    marginBottom: 8,
  },
  nastCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 8,
    padding: 8,
  },
  dropdownBtnStyle: {
    width: '100%',
    height: 35,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginTop: 8,
    marginBottom: 8,
  },
  dropdownBtnTxtStyle: { color: '#444', textAlign: 'left' },
  button: {
    marginBottom: 8,
  },
  mountpointInfo: {
    paddingBottom: 25,
  },
  // Placing
  placingContainer: {
    ...StyleSheet.absoluteFillObject,
    height: Dimensions.get('window').height-100,
    width: Dimensions.get('window').width,
  },
  precisePlacingContainer: {
    height: Dimensions.get('window').width*2/3,
    padding: 20,
    backgroundColor: '#F5FCFF',
    justifyContent: 'center',
    alignSelf: 'center'
  },
  arrow: {
    position: 'absolute',
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  compassWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    position: 'relative',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
    height: Dimensions.get('screen').height,
    width: Dimensions.get('screen').width,
    justifyContent: 'flex-end',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  webView: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  mapCustomCallout: {
    width: 150, 
    height: 125, 
    backgroundColor: 'white', 
    borderRadius: 10,
    alignItems: 'center',
  },
  icon: {
    width: 30,
    height: 30,
    borderWidth: 2,
  },
  skyplotContainer: {
    height: 500,
    padding: 10,
    backgroundColor: '#F5FCFF',
    alignItems: 'center',
  },
  satelliteContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 8,
  },
  satelliteText: {
    fontSize: 16,
    color: 'black',
  },
  exportButtonContainer: {
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    height: Dimensions.get("window").height/4,
  },
  exportButton: {
    fontSize: 15,
    padding: 20,
    marginBottom: 16
  },
  importButtonContainer: {
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    height: Dimensions.get("window").height/5,
  },
  headline: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 20,
  },
  description: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 5,
  },
};
