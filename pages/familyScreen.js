import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Switch,
  ScrollView,
} from "react-native";
import { auth, db, clouddb } from "../FireBaseConfig";
import { ref, onValue, get, update } from "firebase/database";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";
import BottomNav from "../components/BottomNav";

export default function FamilyScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [memberUsers, setMemberUsers] = useState({});
  const [groups, setGroups] = useState([]);
  const [locationSharing, setLocationSharing] = useState({});
  const [loadingGroups, setLoadingGroups] = useState(true);

  const user = auth.currentUser;

  // Load user profile
  useEffect(() => {
    if (!user) return;

    const userRef = ref(db, `users/${user.uid}`);

    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();

        setUsername(data.username || "");
        setProfilePic(data.profilePic || "");
      }
    });

    return () => unsubscribe();
  }, []);

  // Load groups
  useFocusEffect(
    useCallback(() => {
      loadGroups();
    }, []),
  );

  const loadGroups = async () => {
    if (!user) return;

    try {
      setLoadingGroups(true);

      const groupsRef = collection(clouddb, "groups");

      const q = query(groupsRef, where("members", "array-contains", user.uid));

      const querySnapshot = await getDocs(q);

      const groupList = [];

      querySnapshot.forEach((document) => {
        groupList.push({
          id: document.id,
          ...document.data(),
        });
      });

      setGroups(groupList);

      // Load location settings
      const locationSettings = {};

      for (const group of groupList) {
        const settingsRef = doc(
          clouddb,
          "groups",
          group.id,
          "locationSettings",
          user.uid,
        );

        const settingsSnapshot = await getDoc(settingsRef);

        if (settingsSnapshot.exists()) {
          locationSettings[group.id] =
            settingsSnapshot.data().showLocations === true;
        } else {
          locationSettings[group.id] = false;
        }
      }

      setLocationSharing(locationSettings);

      // Get all users
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
      console.log("Load groups error:", error);
    } finally {
      setLoadingGroups(false);
    }
  };

  // Toggle group
  const toggleGroupLocations = async (groupId, value) => {
    if (!user) return;

    setLocationSharing((previous) => ({
      ...previous,
      [groupId]: value,
    }));

    try {
      const settingsRef = doc(
        clouddb,
        "groups",
        groupId,
        "locationSettings",
        user.uid,
      );

      await setDoc(settingsRef, {
        showLocations: value,
      });

      console.log(`Group ${groupId} locations:`, value ? "ON" : "OFF");
    } catch (error) {
      console.log("Toggle group locations error:", error);

      setLocationSharing((previous) => ({
        ...previous,
        [groupId]: !value,
      }));
    }
  };

  const shortId = user?.uid.substring(0, 6);

  return (
    <View style={styles.container}>
      {/* PROFILE */}
      <View style={styles.profileSection}>
        {profilePic ? (
          <Image source={{ uri: profilePic }} style={styles.profilePicture} />
        ) : (
          <View style={styles.defaultProfile}>
            <Text style={styles.defaultProfileText}>
              {username.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <View>
          <Text style={styles.username}>{username}</Text>

          <Text style={styles.userId}>
            {username}#{shortId}
          </Text>
        </View>
      </View>

      {/* GROUPS */}
      <ScrollView style={styles.groupArea}>
        <Text style={styles.sectionTitle}>Groups</Text>

        {/* LOADING */}
        {loadingGroups && (
          <Text style={styles.emptyText}>Loading groups...</Text>
        )}

        {/* NO GROUPS */}
        {!loadingGroups && groups.length === 0 && (
          <Text style={styles.emptyText}>
            You haven't joined any groups yet.
          </Text>
        )}

        {/* GROUP LIST */}
        {!loadingGroups &&
          groups.map((group) => (
            <TouchableOpacity
              key={group.id}
              style={styles.groupCard}
              onPress={() =>
                navigation.navigate("Group", {
                  groupId: group.id,
                })
              }
            >
              {/* GROUP NAME */}
              <Text style={styles.groupName}>{group.name}</Text>

              {/* MEMBER ICONS */}
              <View style={styles.memberRow}>
                {group.members?.slice(0, 3).map((memberId) => {
                  const member = memberUsers[memberId];

                  return (
                    <View key={memberId} style={styles.memberCircle}>
                      <Text>
                        {member?.username
                          ? member.username.charAt(0).toUpperCase()
                          : "?"}
                      </Text>
                    </View>
                  );
                })}

                {/* ADD MEMBER */}
                <TouchableOpacity
                  style={styles.addMemberCircle}
                  onPress={() =>
                    navigation.navigate("AddMember", {
                      groupId: group.id,
                    })
                  }
                >
                  <Text style={styles.plusText}>+</Text>
                </TouchableOpacity>
              </View>

              {/* GROUP LOCATION SWITCH */}
              <View style={styles.locationRow}>
                <Text>Show location of members</Text>

                <Switch
                  value={locationSharing[group.id] === true}
                  onValueChange={(value) =>
                    toggleGroupLocations(group.id, value)
                  }
                />
              </View>
            </TouchableOpacity>
          ))}
      </ScrollView>

      {/* CREATE GROUP */}
      <TouchableOpacity
        style={styles.createGroup}
        onPress={() => navigation.navigate("CreateGroup")}
      >
        <View style={styles.createCircle}>
          <Text style={styles.createPlus}>+</Text>
        </View>

        <Text style={styles.createText}>Create Group</Text>
      </TouchableOpacity>

      <BottomNav navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },

  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderColor: "#5CD6C3",
    backgroundColor: "#D4FAF0",
  },

  profilePicture: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },

  defaultProfile: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  defaultProfileText: {
    fontSize: 24,
    fontWeight: "bold",
  },

  username: {
    fontSize: 20,
    fontWeight: "bold",
  },

  userId: {
    color: "#777",
    marginTop: 3,
  },

  groupArea: {
    flex: 1,
    padding: 20,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },

  groupCard: {
    borderWidth: 1,
    borderColor: "#5CD6C3",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    backgroundColor: "#D4FAF0",
  },

  groupName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },

  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  memberCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  addMemberCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },

  plusText: {
    fontSize: 26,
  },

  locationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  createGroup: {
    alignItems: "center",
    padding: 10,
    paddingBottom: 60,
    borderTopWidth: 1,
    borderColor: "#5CD6C3",
    backgroundColor: "#D4FAF0",
  },

  createCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },

  createPlus: {
    fontSize: 30,
  },

  createText: {
    marginTop: 5,
    fontSize: 15,
    fontWeight: "600",
  },

  emptyText: {
    textAlign: "center",
    color: "#777",
    marginTop: 20,
  },
});
