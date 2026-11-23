import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import { ref, get } from "firebase/database";

import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";

import { auth, db, clouddb } from "../FireBaseConfig";

export default function AddMemberScreen({ route, navigation }) {
  const { groupId } = route.params;

  const [userIdInput, setUserIdInput] = useState("");
  const [loading, setLoading] = useState(false);

  const addMember = async () => {
    const searchValue = userIdInput.trim();

    if (searchValue === "") {
      Alert.alert("Error", "Please enter a username and ID.");
      return;
    }

    // Make sure format is username#shortID
    if (!searchValue.includes("#")) {
      Alert.alert(
        "Invalid ID",
        "Please enter the user ID like username#A3F921.",
      );
      return;
    }

    try {
      setLoading(true);

      const [username, shortId] = searchValue.split("#");

      if (!username || !shortId) {
        Alert.alert(
          "Invalid ID",
          "Please enter the user ID like username#A3F921.",
        );
        return;
      }

      const currentUser = auth.currentUser;

      if (!currentUser) {
        Alert.alert("Error", "You must be logged in.");
        return;
      }

      // Get the group
      const groupRef = doc(clouddb, "groups", groupId);

      const groupSnapshot = await getDoc(groupRef);

      if (!groupSnapshot.exists()) {
        Alert.alert("Error", "Group does not exist.");
        return;
      }

      const groupData = groupSnapshot.data();

      if (groupData.ownerId !== currentUser.uid) {
        Alert.alert("Not Allowed", "Only the group owner can add members.");
        return;
      }

      // Get users from Realtime Database
      const usersRef = ref(db, "users");

      const usersSnapshot = await get(usersRef);

      if (!usersSnapshot.exists()) {
        Alert.alert("Error", "No users were found.");
        return;
      }

      const users = usersSnapshot.val();

      let foundUser = null;

      // Find username + first 6 characters of UID
      Object.keys(users).forEach((uid) => {
        const user = users[uid];

        const storedUsername = user.username || "";

        const storedShortId = uid.substring(0, 6);

        if (
          storedUsername.toLowerCase() === username.toLowerCase() &&
          storedShortId.toUpperCase() === shortId.toUpperCase()
        ) {
          foundUser = {
            uid: uid,
            username: storedUsername,
          };
        }
      });

      if (!foundUser) {
        Alert.alert(
          "User Not Found",
          "No user was found with that username and ID.",
        );

        return;
      }

      if (foundUser.uid === currentUser.uid) {
        Alert.alert("Already You", "You are already a member of this group.");

        return;
      }

      const currentMembers = groupData.members || [];

      if (currentMembers.includes(foundUser.uid)) {
        Alert.alert(
          "Already a Member",
          `${foundUser.username} is already in this group.`,
        );

        return;
      }

      await updateDoc(groupRef, {
        members: arrayUnion(foundUser.uid),
      });

      Alert.alert(
        "Member Added",
        `${foundUser.username} has been added to the group.`,
      );

      setUserIdInput("");

      navigation.goBack();
    } catch (error) {
      console.log("Add member error:", error);

      Alert.alert("Error", "Unable to add member.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Add Member</Text>

        <View style={styles.headerSpace} />
      </View>

      <Text style={styles.description}>
        Enter the user's username and ID to add them to your group.
      </Text>

      <Text style={styles.example}>Example: Bob#rCEP4r</Text>

      <TextInput
        style={styles.input}
        value={userIdInput}
        onChangeText={setUserIdInput}
        placeholder="username#A3F921"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.disabledButton]}
        onPress={addMember}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Adding..." : "Add Member"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    padding: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 35,
  },

  backText: {
    fontSize: 40,
    fontWeight: "300",
  },

  title: {
    fontSize: 25,
    fontWeight: "bold",
  },

  headerSpace: {
    width: 30,
  },

  description: {
    fontSize: 17,
    color: "#555",
    lineHeight: 24,
    marginBottom: 10,
  },

  example: {
    fontSize: 15,
    color: "#888",
    marginBottom: 15,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    fontSize: 17,
    backgroundColor: "#fafafa",
  },

  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },

  disabledButton: {
    opacity: 0.5,
  },

  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
});
