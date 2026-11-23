import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";

import { auth, db } from "../FireBaseConfig";
import { ref, get, update } from "firebase/database";
import { updateProfile } from "firebase/auth";

export default function EditProfileScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          navigation.navigate("Login");
          return;
        }

        setEmail(user.email || "");

        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          setUsername(data.username || "");
        }
      } catch (error) {
        console.log("Error loading profile:", error);
        Alert.alert("Error", "Could not load your profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Error", "You are not logged in.");
      return;
    }

    if (!username.trim()) {
      Alert.alert("Invalid username", "Please enter a username.");
      return;
    }

    try {
      setSaving(true);

      const userRef = ref(db, `users/${user.uid}`);

      await update(userRef, {
        username: username.trim(),
      });

      await updateProfile(user, {
        displayName: username.trim(),
      });

      Alert.alert(
        "Profile Updated",
        "Your profile has been successfully updated.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error) {
      console.log("Error saving profile:", error);

      Alert.alert("Error", "Could not save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Edit Profile</Text>

      <View style={styles.inputSection}>
        <Text style={styles.label}>Username</Text>

        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Enter username"
          autoCapitalize="none"
          maxLength={30}
        />
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.label}>Email</Text>

        <View style={styles.emailBox}>
          <Text style={styles.emailText}>{email}</Text>
        </View>

        <Text style={styles.emailDescription}>
          Email cannot be changed here.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
        activeOpacity={0.8}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Changes</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
        disabled={saving}
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
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

  loadingContainer: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },

  heading: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 30,
  },

  inputSection: {
    marginBottom: 20,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    backgroundColor: "#fff",
  },

  emailBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: "#f5f5f5",
  },

  emailText: {
    fontSize: 16,
    color: "#666",
  },

  emailDescription: {
    fontSize: 12,
    color: "#888",
    marginTop: 6,
  },

  saveButton: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 10,
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  cancelButton: {
    alignItems: "center",
    paddingVertical: 15,
    marginTop: 5,
  },

  cancelText: {
    fontSize: 15,
    color: "#666",
  },
});
