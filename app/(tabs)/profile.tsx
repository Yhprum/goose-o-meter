import { useSession } from "@/hooks/useAuth";
import { firestore, storage } from "@/lib/firebase";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useState } from "react";
import { Button, Image, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";

export default function ProfileScreen() {
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState<string>();
  const [originalProfileImage, setOriginalProfileImage] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const session = useSession();
  const router = useRouter();

  const userRef = session.user ? doc(firestore, "rooms", "RLHXAPTnHK9gMybwIh7F", "geese", session.user.uid) : null;

  useEffect(() => {
    if (userRef)
      getDoc(userRef).then((doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setName(data?.name);
          setProfileImage(data?.profileImage);
          setOriginalProfileImage(data?.profileImage);
        }
      });
  }, [session.user]);

  const pickImage = async () => {
    // Request permissions
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      console.log(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string, path: string) => {
    if (!uri || !path) return null;

    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const imageRef = ref(storage, `profileImages/${path}.jpg`);

      await uploadBytes(imageRef, blob);
      const downloadURL = await getDownloadURL(imageRef);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image: ", error);
      return null;
    }
  };

  const updateUser = async () => {
    if (!userRef || !session.user) {
      return;
    }

    setIsLoading(true);
    try {
      // Only upload if profile image has changed from original
      if (profileImage && profileImage !== originalProfileImage) {
        const imageUrl = await uploadImage(profileImage, session.user.uid);
        await setDoc(userRef, { name, profileImage: imageUrl }, { merge: true });
      } else {
        await setDoc(userRef, { name }, { merge: true });
      }

      router.push("/(tabs)");
    } catch (error) {
      console.error("Error updating profile:", error);
      // Optionally add error handling UI here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.label}>Profile Picture:</Text>
      {profileImage && <Image source={{ uri: profileImage }} style={styles.profileImage} />}

      <TouchableOpacity onPress={pickImage} style={styles.button}>
        <Text style={styles.buttonText}>Upload Profile Picture</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Name:</Text>
      <TextInput
        autoComplete="given-name"
        style={[styles.input, { width: "80%" }]}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
        returnKeyType="done"
      />

      <Button title={isLoading ? "Saving..." : "Save Changes"} onPress={updateUser} disabled={isLoading} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#FFF6E5", // Warm cream background
  },
  label: {
    fontSize: 18,
    marginVertical: 10,
    fontFamily: "ComicSans",
  },
  input: {
    height: 40,
    borderColor: "#A76A61", // Vintage rose
    borderWidth: 1,
    width: "100%",
    paddingHorizontal: 10,
    marginBottom: 20,
    fontFamily: "ComicSans",
    backgroundColor: "#FAF0E6", // Lighter cream for input
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50, // Circle crop
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#A76A61", // Vintage rose
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "ComicSans",
  },
});
