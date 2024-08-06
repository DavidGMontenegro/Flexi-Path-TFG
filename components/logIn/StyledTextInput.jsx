import React from "react";
import { TextInput, StyleSheet } from "react-native";

const styles = StyleSheet.create({
    textInput: {
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#808080',
        backgroundColor: '#808080',
        paddingHorizontal: 15,
        paddingVertical: 5,
        width: 350,
        color: '#FFF'
    },
    error: {
        borderColor: '#2E86C1'
    }
})

const StyledTextInput = ({ style = {}, error, ...props}) => {
    const inputStyle = [
        styles.textInput,
        style,
        error && styles.error
    ]

    return <TextInput style={inputStyle} { ... props} />
}

export default StyledTextInput