import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import BottomNav from "../components/BottomNav";
import { signOut } from "firebase/auth";
import { auth } from "../FireBaseConfig";

export default function SettingsScreen({ navigation, resetQuizzes }) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate("Login");
    } catch (error) {
      console.log(error);
    }
  };

  const handleReset = () => {
    Alert.alert(
      "Reset quizzes",
      "Are you sure you want to reset all quiz progress?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => resetQuizzes && resetQuizzes(),
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Settings</Text>

      <View style={styles.buttonWrap}>
        {/* Edit Profile */}
        <TouchableOpacity
          style={styles.settingButton}
          onPress={() => navigation.navigate("EditProfile")}
          activeOpacity={0.7}
        >
          <View style={styles.textContainer}>
            <Text style={styles.buttonTitle}>Edit Profile</Text>
            <Text style={styles.buttonDescription}>
              Change your username and profile picture
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* Reset Quizzes */}
        <TouchableOpacity
          style={styles.settingButton}
          onPress={handleReset}
          activeOpacity={0.7}
        >
          <View style={styles.textContainer}>
            <Text style={styles.buttonTitle}>Reset Quizzes</Text>
            <Text style={styles.buttonDescription}>
              Clear all quiz progress
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          style={styles.settingButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <View style={styles.textContainer}>
            <Text style={styles.buttonTitle}>Logout</Text>
            <Text style={styles.buttonDescription}>
              Sign out of your account
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      <BottomNav navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    padding: 20,
    paddingTop: 60,
  },

  heading: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 25,
  },

  buttonWrap: {
    width: "100%",
  },

  settingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#5CD6C3",
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
    backgroundColor: "#D4FAF0",
  },

  textContainer: {
    flex: 1,
  },

  buttonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginBottom: 5,
  },

  buttonDescription: {
    fontSize: 13,
    color: "#666",
  },

  arrow: {
    fontSize: 26,
    color: "#888",
    marginLeft: 10,
  },
});
