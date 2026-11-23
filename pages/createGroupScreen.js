import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, clouddb } from "../FireBaseConfig";

export default function CreateGroupScreen({ navigation }) {
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);

  const createGroup = async () => {
    if (groupName.trim() === "") {
      Alert.alert("Error", "Please enter a group name.");
      return;
    }

    if (!auth.currentUser) {
      Alert.alert("Error", "You must be logged in.");
      return;
    }

    try {
      setLoading(true);

      const userId = auth.currentUser.uid;

      const groupRef = await addDoc(collection(clouddb, "groups"), {
        name: groupName.trim(),
        ownerId: userId,
        members: [userId],
        createdAt: serverTimestamp(),
      });

      console.log("Group created:", groupRef.id);

      Alert.alert("Success", "Group created successfully!");

      navigation.replace("Group", {
        groupId: groupRef.id,
      });
    } catch (error) {
      console.log("Create group error:", error);

      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Group</Text>
      <TextInput
        style={styles.input}
        placeholder="Group name"
        value={groupName}
        onChangeText={setGroupName}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={createGroup}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Creating..." : "Create Group"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },

  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "bold",
  },
});
