// LoginScreen.js
import { auth } from "@/lib/firebase";
import { Link, useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { Button, Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import GooseOMeterLogo from "../assets/images/goose.svg";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        router.replace("/(tabs)");
      })
      .catch((err) => setError(err.message));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <GooseOMeterLogo width={Dimensions.get("window").width} height={60} />
      </View>

      <Text style={styles.label}>Email:</Text>
      <TextInput style={styles.input} placeholder="Enter email" value={email} onChangeText={setEmail} keyboardType="email-address" />

      <Text style={styles.label}>Password:</Text>
      <TextInput style={styles.input} placeholder="Enter password" value={password} onChangeText={setPassword} secureTextEntry />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <Link style={styles.linkText} href="/register">
        Don't have an account? Sign up
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#FFF6E5", // Warm cream background
  },
  header: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  label: {
    fontSize: 18,
    marginVertical: 10,
  },
  input: {
    height: 40,
    borderColor: "#A76A61", // Vintage rose
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 4,
    backgroundColor: "#FAF0E6", // Lighter cream for input
    fontFamily: "ComicSans",
  },
  button: {
    backgroundColor: "#A76A61", // Vintage rose
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "ComicSans",
  },
  linkText: {
    color: "#A76A61", // Vintage rose
    textAlign: "center",
    marginTop: 20,
    fontFamily: "ComicSans",
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 24,
    color: "#333",
    fontFamily: "ComicSans",
  },
  errorText: {
    color: "#FF7C6E", // Soft coral for errors
    marginBottom: 12,
    textAlign: "center",
    fontFamily: "ComicSans",
  },
});
