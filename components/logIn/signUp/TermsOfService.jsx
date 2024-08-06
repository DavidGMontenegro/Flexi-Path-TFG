import React, { useState } from "react";
import { View, StyleSheet, Text, Image, TouchableHighlight, ScrollView } from "react-native";
import SignUpForm from "./SignUpForm";
import SignUpEmail from "./SignUpEmail";
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons";

export default function TermsOfService() {
  const navigation = useNavigation();

  const [emailSent, setEmailSent] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          style={styles.image}
          source={require("../../../assets/logIn/mapDecoration.jpg")}
          resizeMode="cover"
        />
        <Text style={styles.title}>Terms of Service</Text>
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.textContainer}><ScrollView>
            
                
          <Text style={styles.text}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Tortor at auctor urna nunc id cursus. Mattis vulputate enim nulla aliquet porttitor lacus. In ante metus dictum at tempor commodo. Viverra suspendisse potenti nullam ac tortor vitae purus faucibus. Tortor at risus viverra adipiscing at. Lectus mauris ultrices eros in cursus turpis massa tincidunt dui. Nulla facilisi cras fermentum odio eu feugiat pretium. In dictum non consectetur a erat nam at lectus urna. Congue nisi vitae suscipit tellus mauris a. Bibendum neque egestas congue quisque egestas diam. Lectus urna duis convallis convallis. Mattis vulputate enim nulla aliquet porttitor lacus. Euismod in pellentesque massa placerat duis ultricies lacus.
Eu consequat ac felis donec et odio pellentesque diam. Est ante in nibh mauris cursus mattis molestie a. Placerat orci nulla pellentesque dignissim. Faucibus et molestie ac feugiat. Nec tincidunt praesent semper feugiat nibh. Suscipit tellus mauris a diam maecenas sed enim ut. Amet porttitor eget dolor morbi non arcu risus quis varius. Facilisis leo vel fringilla est ullamcorper eget nulla. Pellentesque elit eget gravida cum sociis natoque penatibus et magnis. Vulputate mi sit amet mauris commodo quis imperdiet. Pharetra pharetra massa massa ultricies mi quis.
Nam aliquam sem et tortor. Laoreet non curabitur gravida arcu. Id diam maecenas ultricies mi eget mauris pharetra et. Donec ac odio tempor orci dapibus ultrices in. Mauris in aliquam sem fringilla ut morbi tincidunt. Dolor morbi non arcu risus quis. Dolor sit amet consectetur adipiscing elit ut aliquam purus sit. Sollicitudin aliquam ultrices sagittis orci a scelerisque purus. Egestas diam in arcu cursus euismod quis. Montes nascetur ridiculus mus mauris vitae ultricies leo integer. Et netus et malesuada fames ac turpis egestas maecenas pharetra. Eget magna fermentum iaculis eu non diam. Urna porttitor rhoncus dolor purus non. Ac odio tempor orci dapibus ultrices in iaculis. At erat pellentesque adipiscing commodo elit at imperdiet dui.
          </Text>
            </ScrollView>
        </View>
        <TouchableHighlight
          onPress={() => {navigation.navigate("SignUp")}}
          underlayColor="#2E86C100"
          style={styles.buttonContainer}
        >
          <View style={styles.button}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
            <Text style={styles.buttonText}>Return to homepage</Text>
          </View>
        </TouchableHighlight>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#252525",
  },
  imageContainer: {
    width: "100%",
    position: "absolute",
    top: 0,
  },
  contentContainer: {
    marginTop: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 200,
  },
  title: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 42,
    color: "white",
    fontWeight: "900",
  },
  subtitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#FFF",
  },
  line: {
    borderBottomColor: "#FFF",
    borderBottomWidth: 1,
    width: "100%",
    marginBottom: 20,
  },
  textContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#808080",
    borderRadius: 10,
    margin: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    height: 500
  },
  text: {
    fontSize: 16,
    color: "#000",
    paddingRight: 20
  },
  buttonContainer: {
    alignItems: "center",
  },
  button: {
    flexDirection: "row",
    backgroundColor: "#2E86C1",
    borderRadius: 15,
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    marginLeft: 10,
  }
});
