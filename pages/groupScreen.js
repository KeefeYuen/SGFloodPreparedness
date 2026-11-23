import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { ref, get } from "firebase/database";
import { db } from "../FireBaseConfig";
import { clouddb } from "../FireBaseConfig";

export default function GroupScreen({ route, navigation }) {
  const { groupId } = route.params;

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [memberUsers, setMemberUsers] = useState({});

  useEffect(() => {
    loadGroup();
  }, []);

  const loadGroup = async () => {
    try {
      const groupRef = doc(clouddb, "groups", groupId);
      const groupSnapshot = await getDoc(groupRef);

      if (groupSnapshot.exists()) {
        const groupData = groupSnapshot.data();

        setGroup({
          id: groupSnapshot.id,
          ...groupData,
        });

        // Get usernames from Realtime Database
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
      } else {
        Alert.alert("Error", "Group does not exist.");
        navigation.goBack();
      }
    } catch (error) {
      console.log("Load group error:", error);
      Alert.alert("Error", "Unable to load group.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading group...</Text>
      </View>
    );
  }

  if (!group) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.title} numberOfLines={1}>
          {group.name}
        </Text>

        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() =>
            navigation.navigate("GroupSettings", {
              groupId: groupId,
            })
          }
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* MEMBERS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Members</Text>

        <Text style={styles.memberCount}>
          {group.members?.length || 0} member(s)
        </Text>

        <View style={styles.memberRow}>
          {group.members?.map((memberId) => {
            const member = memberUsers[memberId];

            return (
              <View key={memberId} style={styles.memberContainer}>
                <View style={styles.memberCircle}>
                  <Text style={styles.memberInitial}>
                    {member?.username
                      ? member.username.charAt(0).toUpperCase()
                      : "?"}
                  </Text>
                </View>

                <Text style={styles.memberName}>
                  {member?.username || "Loading..."}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* ADD MEMBERS */}
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate("AddMember", {
            groupId: groupId,
          })
        }
      >
        <Text style={styles.buttonText}>+ Add Members</Text>
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
    marginBottom: 40,
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

  title: {
    flex: 1,
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginHorizontal: 10,
  },

  settingsButton: {
    width: 45,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
  },

  settingsIcon: {
    fontSize: 25,
  },

  section: {
    marginBottom: 30,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },

  memberCount: {
    fontSize: 18,
    color: "#555",
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
  memberRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 15,
    gap: 15,
  },

  memberContainer: {
    alignItems: "center",
    width: 65,
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

  memberName: {
    marginTop: 5,
    fontSize: 12,
    textAlign: "center",
  },
});
