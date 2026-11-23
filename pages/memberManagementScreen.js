import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";

import { ref, get } from "firebase/database";

import { doc, getDoc, updateDoc, arrayRemove } from "firebase/firestore";

import { auth, db, clouddb } from "../FireBaseConfig";

export default function MemberManagementScreen({ route, navigation }) {
  const { groupId } = route.params;

  const [group, setGroup] = useState(null);
  const [memberUsers, setMemberUsers] = useState({});
  const [loading, setLoading] = useState(true);

  const currentUser = auth.currentUser;

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);

      // Get group
      const groupRef = doc(clouddb, "groups", groupId);
      const groupSnapshot = await getDoc(groupRef);

      if (!groupSnapshot.exists()) {
        Alert.alert("Error", "Group does not exist.");
        navigation.goBack();
        return;
      }

      const groupData = groupSnapshot.data();

      setGroup({
        id: groupSnapshot.id,
        ...groupData,
      });

      // Get users from Realtime Database
      const usersRef = ref(db, "users");
      const usersSnapshot = await get(usersRef);

      if (usersSnapshot.exists()) {
        const users = usersSnapshot.val();
        const userMap = {};

        Object.keys(users).forEach((uid) => {
          userMap[uid] = users[uid];
        });

        setMemberUsers(userMap);
      }
    } catch (error) {
      console.log("Load members error:", error);
      Alert.alert("Error", "Unable to load members.");
    } finally {
      setLoading(false);
    }
  };

  const removeMember = (memberId) => {
    const member = memberUsers[memberId];

    const username = member?.username || "this member";

    Alert.alert(
      "Remove Member",
      `Are you sure you want to remove ${username} from the group?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              const groupRef = doc(clouddb, "groups", groupId);

              await updateDoc(groupRef, {
                members: arrayRemove(memberId),
              });

              // Update local group immediately
              setGroup((previous) => ({
                ...previous,
                members: previous.members.filter((id) => id !== memberId),
              }));

              Alert.alert(
                "Member Removed",
                `${username} has been removed from the group.`,
              );
            } catch (error) {
              console.log("Remove member error:", error);
              Alert.alert("Error", "Unable to remove member.");
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading members...</Text>
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Manage Members</Text>

        <View style={{ width: 30 }} />
      </View>

      <Text style={styles.memberCount}>
        {group.members?.length || 0} member(s)
      </Text>

      <ScrollView>
        {group.members?.map((memberId) => {
          const member = memberUsers[memberId];

          const username = member?.username || "Unknown User";

          const isCurrentUser = memberId === currentUser?.uid;

          const isGroupOwner = memberId === group.ownerId;

          return (
            <View key={memberId} style={styles.memberCard}>
              {/* PROFILE ICON */}
              <View style={styles.memberCircle}>
                <Text style={styles.memberInitial}>
                  {username.charAt(0).toUpperCase()}
                </Text>
              </View>

              {/* NAME */}
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{username}</Text>

                {isGroupOwner && (
                  <Text style={styles.ownerText}>Group Owner</Text>
                )}

                {isCurrentUser && !isGroupOwner && (
                  <Text style={styles.youText}>You</Text>
                )}
              </View>

              {/* REMOVE BUTTON */}
              {isOwner && !isGroupOwner && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeMember(memberId)}
                >
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
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

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  backButton: {
    fontSize: 40,
    fontWeight: "300",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
  },

  memberCount: {
    fontSize: 16,
    color: "#666",
    marginBottom: 15,
  },

  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  memberCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },

  memberInitial: {
    fontSize: 20,
    fontWeight: "bold",
  },

  memberInfo: {
    flex: 1,
    marginLeft: 15,
  },

  memberName: {
    fontSize: 16,
    fontWeight: "600",
  },

  ownerText: {
    fontSize: 12,
    color: "#777",
    marginTop: 3,
  },

  youText: {
    fontSize: 12,
    color: "#777",
    marginTop: 3,
  },

  removeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#ffdddd",
  },

  removeText: {
    color: "#d00",
    fontWeight: "bold",
  },
});
