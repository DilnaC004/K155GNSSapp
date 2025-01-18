import React from "react";
import { Text, Image, View, ScrollView, Linking } from "react-native";
import { styles } from "../Styles/styles";
import { TaskInfoText } from "./TaskInfoText";

export default TaskInfo = ({ taskNumber }) => {
    

    return (
        <View style={styles.scrollViewContainer}>
            <ScrollView contentContainerStyle={styles.scrollView}>
                {TaskInfoText[taskNumber]}
            </ScrollView>
        </View>
    );
};