# K155GNSSapp

How to set up development environment - https://reactnative.dev/docs/environment-setup
For methods other than the one described below, please refer to the link above.

Summary for Windows and Android:
## 1. Install Node.js and Java Development Kit (JDK)
Install the Chocolatey package manager from: https://chocolatey.org
### Use an administrator command prompt to install Node.js and JDK:
choco install -y nodejs-lts microsoft-openjdk17

- Node.js: Make sure you have Node.js version 18 or newer.
- JDK: We recommend JDK version 17. Higher versions may cause issues.

### Verify the installation:
Open a new command prompt and run:
node -v
java -version

## 2. Set Up Android Studio and Android SDK
Download and install Android Studio from: https://developer.android.com/studio
### During installation, select the following components:
- Android SDK
- Android SDK Platform
- Android Virtual Device (AVD)

### After installation:
Open SDK Manager in Android Studio (More Actions → SDK Manager).
On the SDK Platforms tab:
Expand Android 14 (UpsideDownCake) and check:
- Android SDK Platform 34
- Intel x86 Atom_64 System Image or Google APIs Intel x86 Atom System Image

### On the SDK Tools tab:
Expand Android SDK Build-Tools and check version 34.0.0.
Click Apply to download and install the required files.

## 3. Set Environment Variables
Go to: Control Panel → User Accounts → User Accounts → Change my environment variables
Add a new user variable:
- Name: ANDROID_HOME
- Value: %LOCALAPPDATA%\Android\Sdk

### Edit the Path variable and add:
%LOCALAPPDATA%\Android\Sdk\platform-tools

## 4. Start a Virtual Device (AVD)
In Android Studio, open AVD Manager (More Actions → AVD Manager).
### Create a new device:
Click Create Virtual Device...
Choose any phone model → Next
Select the UpsideDownCake (API Level 34) system image
Development was tested specifically on Pixel 6
Complete the HAXM installation (if not already installed)
Click Finish and launch the AVD by clicking the green arrow

## 5. Install Dependencies and Run the App
### Install dependencies:
npm install (--force)

### Start the project:
npm start
a (press a to run the app on Android)

# Packages:
Packages can be found in the node_modules folder

# TODO
- separate ubx and nmea from datastream
- write raw data
- continuous measurement on satellite
- firebase upload
- dodelat preposilani RTK korekci do GNSS - moznost vypnuti, restartu, ukladani mnozstvi stazenych dat
- implement a cap for RTCM data
- divide receiver settings into measurement and general settings (dark theme, font size, i18n - localization)
- polish the exports to match the collumns
 
# Rozšíření vývoje GNSS aplikace - František Gurecký
Přílohy bakalářské práce jsou k nalezení ve složce **thesis**.
Attachments related to the bachelor's thesis are located in the **thesis** folder.