import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Switch,
  Alert,
  ScrollView,
} from "react-native";

import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  arrayRemove,
} from "firebase/firestore";

import { auth, clouddb } from "../FireBaseConfig";

export default function GroupSettingsScreen({ route, navigation }) {
  const { groupId } = route.params;

  const [group, setGroup] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [locationSharing, setLocationSharing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const currentUser = auth.currentUser;

  useEffect(() => {
    loadGroup();
  }, []);

  const loadGroup = async () => {
    try {
      const groupRef = doc(clouddb, "groups", groupId);

      const groupSnapshot = await getDoc(groupRef);

      if (!groupSnapshot.exists()) {
        Alert.alert("Error", "Group does not exist.");

        navigation.goBack();
        return;
      }

      const data = groupSnapshot.data();

      setGroup({
        id: groupSnapshot.id,
        ...data,
      });

      setGroupName(data.name || "");

      setLocationSharing(data.locationSharing || false);
    } catch (error) {
      console.log("Load group settings error:", error);

      Alert.alert("Error", "Unable to load group.");
    } finally {
      setLoading(false);
    }
  };

  const saveGroupName = async () => {
    if (groupName.trim() === "") {
      Alert.alert("Error", "Group name cannot be empty.");
      return;
    }

    try {
      setSaving(true);

      const groupRef = doc(clouddb, "groups", groupId);

      await updateDoc(groupRef, {
        name: groupName.trim(),
      });

      setGroup({
        ...group,
        name: groupName.trim(),
      });

      Alert.alert("Success", "Group name updated.");
    } catch (error) {
      console.log("Update group name error:", error);

      Alert.alert("Error", "Unable to update group name.");
    } finally {
      setSaving(false);
    }
  };

  const toggleLocationSharing = async (value) => {
    try {
      setLocationSharing(value);

      const groupRef = doc(clouddb, "groups", groupId);

      await updateDoc(groupRef, {
        locationSharing: value,
      });
    } catch (error) {
      console.log("Location sharing error:", error);

      setLocationSharing(!value);

      Alert.alert("Error", "Unable to update location sharing.");
    }
  };

  const leaveGroup = () => {
    if (!currentUser) {
      return;
    }

    if (group?.ownerId === currentUser.uid) {
      Alert.alert(
        "Cannot Leave Group",
        "The group owner cannot leave the group. Delete the group instead.",
      );

      return;
    }

    Alert.alert("Leave Group", "Are you sure you want to leave this group?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Leave",
        style: "destructive",
        onPress: async () => {
          try {
            const groupRef = doc(clouddb, "groups", groupId);

            await updateDoc(groupRef, {
              members: arrayRemove(currentUser.uid),
            });

            Alert.alert("Success", "You have left the group.");

            navigation.navigate("Family");
          } catch (error) {
            console.log("Leave group error:", error);

            Alert.alert("Error", "Unable to leave group.");
          }
        },
      },
    ]);
  };

  const deleteGroup = () => {
    if (!currentUser) {
      return;
    }

    if (group?.ownerId !== currentUser.uid) {
      Alert.alert("Not Allowed", "Only the group owner can delete the group.");

      return;
    }

    Alert.alert(
      "Delete Group",
      "Are you sure you want to delete this group? This cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const groupRef = doc(clouddb, "groups", groupId);

              await deleteDoc(groupRef);

              Alert.alert("Group Deleted", "The group has been deleted.");

              navigation.navigate("Family");
            } catch (error) {
              console.log("Delete group error:", error);

              Alert.alert("Error", "Unable to delete group.");
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  if (!group) {
    return null;
  }

  const isOwner = group.ownerId === currentUser?.uid;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Group Settings</Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* GROUP NAME */}
        <Text style={styles.sectionTitle}>Group Name</Text>

        <TextInput
          style={styles.input}
          value={groupName}
          onChangeText={setGroupName}
          placeholder="Group name"
          maxLength={40}
        />

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.disabledButton]}
          onPress={saveGroupName}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? "Saving..." : "Save Group Name"}
          </Text>
        </TouchableOpacity>

        {/* MEMBERS */}
        <Text style={styles.sectionTitle}>Members</Text>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.navigate("MemberManagement", { groupId })}
        >
          <Text style={styles.optionIcon}>👥</Text>

          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Manage Members</Text>

            <Text style={styles.optionDescription}>
              {group.members?.length || 0} member(s)
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* LEAVE GROUP */}
        <Text style={styles.sectionTitle}>Group Actions</Text>

        <TouchableOpacity style={styles.dangerButton} onPress={leaveGroup}>
          <Text style={styles.dangerIcon}>🚪</Text>

          <Text style={styles.dangerText}>Leave Group</Text>
        </TouchableOpacity>

        {/* DELETE GROUP */}
        {isOwner && (
          <TouchableOpacity style={styles.deleteButton} onPress={deleteGroup}>
            <Text style={styles.dangerIcon}>🗑️</Text>

            <Text style={styles.deleteText}>Delete Group</Text>
          </TouchableOpacity>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    padding: 20,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    fontSize: 17,
    color: "#777",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },

  backButton: {
    width: 45,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
  },

  backText: {
    fontSize: 40,
    fontWeight: "300",
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },

  headerSpacer: {
    width: 45,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 25,
    marginBottom: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: "#5CD6C3",
    borderRadius: 10,
    padding: 14,
    fontSize: 17,
    backgroundColor: "#fafafa",
  },

  saveButton: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  disabledButton: {
    opacity: 0.5,
  },

  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#5CD6C3",
    backgroundColor: "#D4FAF0",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },

  optionIcon: {
    fontSize: 23,
    marginRight: 15,
  },

  optionTextContainer: {
    flex: 1,
  },

  optionTitle: {
    fontSize: 17,
    fontWeight: "600",
  },

  optionDescription: {
    color: "#777",
    marginTop: 3,
  },

  arrow: {
    fontSize: 28,
    color: "#999",
  },

  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderWidth: 1,
    borderColor: "#5CD6C3",
    backgroundColor: "#D4FAF0",
    borderRadius: 12,
    marginBottom: 10,
  },

  dangerIcon: {
    fontSize: 22,
    marginRight: 15,
  },

  dangerText: {
    fontSize: 17,
    fontWeight: "600",
  },

  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderWidth: 1,
    borderColor: "#5CD6C3",
    backgroundColor: "#fff5f5",
    borderRadius: 12,
  },

  deleteText: {
    color: "#d00",
    fontSize: 17,
    fontWeight: "600",
  },

  bottomSpace: {
    height: 40,
  },
});
