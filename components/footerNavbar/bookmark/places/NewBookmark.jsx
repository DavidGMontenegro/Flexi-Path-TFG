import React, { useEffect, useState } from "react";
import { Image, Keyboard, Platform } from "react-native";
import { View, Text, TouchableHighlight, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { FIRESTORE_DB, FIRESTORE_STORAGE } from "../../../../firebase-config";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { useAuth } from "../../../../AuthContext";
import StyledTextInput from "../../../logIn/StyledTextInput";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "@expo/vector-icons/AntDesign";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

export default function NewBookmark() {
  const navigation = useNavigation();
  const route = useRoute();
  const { uid } = useAuth();
  const destination = route.params?.destination;
  const [direction, setDirection] = useState(destination || null);
  const [name, setName] = useState(destination?.name || "");
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [category, setCategory] = useState(null);
  const [customCategory, setCustomCategory] = useState(null);
  const [image, setImage] = useState(null);
  const [categoriesVector, setCategoriesVector] = useState([]);

  const handleKeyboardDidHide = () => {
    setKeyboardOpen(false);
  };

  const handleKeyboardDidShow = () => {
    setKeyboardOpen(true);
  };

  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "android" ? "keyboardDidHide" : "keyboardWillHide",
      handleKeyboardDidHide
    );

    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "android" ? "keyboardDidShow" : "keyboardWillShow",
      handleKeyboardDidShow
    );

    const fetchCategories = async () => {
      try {
        const categoriesRef = collection(
          FIRESTORE_DB,
          "users",
          uid,
          "PersonalLocations",
          "PlacesBookmarks",
          "Categories"
        );
        const querySnapshot = await getDocs(categoriesRef);
        const categoriesVector = querySnapshot.docs.map((doc) => ({
          label: doc.id,
          value: doc.id,
        }));

        categoriesVector.push({
          label: "Custom...",
          value: "Custom",
        });
        setCategoriesVector(categoriesVector);
      } catch (error) {
        console.error("Error fetching categories: ", error);
      }
    };

    fetchCategories();

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const handleSaveBookmark = async () => {
    if (direction && name && (category || customCategory)) {
      try {
        let imageUrl = null;

        if (image) {
          const response = await fetch(image);
          const blob = await response.blob();
          const storageRef = ref(
            FIRESTORE_STORAGE,
            `${uid}/${category}/${name}`
          );
          const uploadTask = uploadBytesResumable(storageRef, blob);
          const snapshot = await uploadTask;
          imageUrl = await getDownloadURL(snapshot.ref);
        }

        const categoryToUse = category === "Custom" ? customCategory : category;

        const bookmarksCollectionRef = collection(
          FIRESTORE_DB,
          "users",
          uid,
          "PersonalLocations",
          "PlacesBookmarks",
          "Categories",
          categoryToUse,
          "data"
        );
        const newBookmarkDocRef = doc(bookmarksCollectionRef, name);

        await setDoc(newBookmarkDocRef, {
          name: name,
          direction: direction.name,
          formatted_address: direction.formatted_address,
          coords: direction?.geometry?.location || direction?.coords,
          image: imageUrl,
        });

        const categoryDocRef = doc(
          collection(
            FIRESTORE_DB,
            "users",
            uid,
            "PersonalLocations",
            "PlacesBookmarks",
            "Categories"
          ),
          categoryToUse
        );
        const categoryDocSnapshot = await getDoc(categoryDocRef);

        if (categoryDocSnapshot.exists()) {
          const currentCount = categoryDocSnapshot.data().count || 0;
          const updatedCount = currentCount + 1;

          await setDoc(
            categoryDocRef,
            { count: updatedCount },
            { merge: true }
          );
        } else {
          await setDoc(categoryDocRef, { count: 1 });
        }

        console.log("Bookmark added:", name);
        navigation.navigate("BookmarkPage");
      } catch (error) {
        console.error("Error creating the bookmark:", error);
      }
    } else {
      alert("Fields must be fulfilled.");
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableHighlight
            onPress={() => navigation.navigate("BookmarkPage")}
            underlayColor="#2E86C100"
          >
            <Ionicons name="arrow-back" size={26} color="#FFF" />
          </TouchableHighlight>
          <Text style={styles.headerText}>New bookmark</Text>
          <View style={{ width: "26" }} />
        </View>
      </View>
      <View style={styles.form}>
        {!keyboardOpen && (
          <View style={{ alignItems: "center" }}>
            <Text style={styles.label}>Bookmark image</Text>
            <TouchableHighlight
              onPress={pickImage}
              underlayColor="#2E86C100"
              style={{
                backgroundColor: "#808080",
                width: "50%",
                aspectRatio: 1,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 10,
              }}
            >
              <View style={{ justifyContent: "center", alignItems: "center" }}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.image} />
                ) : (
                  <>
                    <Ionicons name="document-outline" size={75} color="#FFF" />
                    <Text style={{ fontSize: 16, marginTop: 20 }}>
                      Upload image ...
                    </Text>
                  </>
                )}
              </View>
            </TouchableHighlight>
          </View>
        )}
        <View style={{ marginTop: 20 }}>
          <Text style={styles.label}>What category does it fall into?</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Dropdown
              style={[styles.dropdown, { flex: 1 }]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={{ color: "white" }}
              iconStyle={styles.iconStyle}
              data={categoriesVector}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Select category"
              value={category}
              onChange={(item) => setCategory(item.value)}
              renderLeftIcon={() => (
                <AntDesign
                  style={styles.icon}
                  color="black"
                  name="down"
                  size={16}
                />
              )}
            />
            {category === "Custom" && (
              <StyledTextInput
                style={{ flex: 1, marginLeft: 10 }}
                placeholder="Custom category"
                value={customCategory}
                onChangeText={(text) => setCustomCategory(text)}
              />
            )}
          </View>
        </View>
        <View style={{ marginTop: 20 }}>
          <Text style={styles.label}>Name</Text>
          <StyledTextInput
            style={{ width: "100%", fontSize: 15 }}
            placeholder="Name"
            value={name || ""}
            onChangeText={(name) => setName(name)}
          />
        </View>
        <View style={{ height: 200, marginTop: 20 }}>
          <Text style={styles.label}>Direction</Text>
          <GooglePlacesAutocomplete
            enablePoweredByContainer={false}
            fetchDetails={true}
            placeholder={direction?.formatted_address || "Search..."}
            onPress={(data, details) => setDirection(details)}
            query={{
              key: "---",
              language: "es",
              components: "country:es",
            }}
            styles={{
              textInput: {
                backgroundColor: "#808080",
                fontSize: 15,
                color: "white",
              },
            }}
          />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableHighlight
            onPress={() => navigation.navigate("BookmarkPage")}
            underlayColor="#2E86C100"
            style={[styles.button, { backgroundColor: "#808080" }]}
          >
            <Text style={{ fontSize: 18 }}>Cancel</Text>
          </TouchableHighlight>
          <TouchableHighlight
            onPress={handleSaveBookmark}
            underlayColor="#2E86C100"
            style={[styles.button, { backgroundColor: "#FFA500" }]}
          >
            <Text style={{ fontSize: 18 }}>Add bookmark</Text>
          </TouchableHighlight>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#252525",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#2E86C1",
    paddingTop: 85,
    paddingBottom: 50,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "85%",
  },
  headerText: {
    fontSize: 32,
    color: "white",
    fontWeight: "300",
  },
  form: {
    marginVertical: 10,
    width: "90%",
  },
  label: {
    fontWeight: "300",
    fontSize: 16,
    color: "white",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  button: {
    backgroundColor: "#808080",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  dropdown: {
    backgroundColor: "#808080",
    height: 50,
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  placeholderStyle: {
    fontSize: 15,
  },
  icon: {
    marginRight: 10,
    marginLeft: 5,
  },
  image: {
    height: "97%",
    aspectRatio: 1,
    borderRadius: 5,
  },
});