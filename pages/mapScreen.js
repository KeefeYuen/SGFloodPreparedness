import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import BottomNav from "../components/BottomNav";

import { auth, db, clouddb } from "../FireBaseConfig";

import { ref, update, onValue } from "firebase/database";

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

export default function MapScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [groupVisibility, setGroupVisibility] = useState({});

  const user = auth.currentUser;

  // Get user location
  useEffect(() => {
    if (!user) return;

    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          alert("Location permission denied");
          return;
        }

        // Get cached location first
        const lastLocation = await Location.getLastKnownPositionAsync();

        if (lastLocation) {
          setLocation({
            latitude: lastLocation.coords.latitude,
            longitude: lastLocation.coords.longitude,
          });
        }

        // Get updated location
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const myLocation = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        };

        setLocation(myLocation);

        // Save user location
        await update(ref(db, `users/${user.uid}`), {
          lastLocation: {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            updatedAt: Date.now(),
          },
        });
      } catch (error) {
        console.log("Location error:", error);
      }
    };

    getLocation();
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadGroups = async () => {
      try {
        const groupsRef = collection(clouddb, "groups");

        const q = query(
          groupsRef,
          where("members", "array-contains", user.uid),
        );

        const querySnapshot = await getDocs(q);

        const visibility = {};

        // Check each group separately
        for (const groupDocument of querySnapshot.docs) {
          const groupId = groupDocument.id;

          const settingsRef = doc(
            clouddb,
            "groups",
            groupId,
            "locationSettings",
            user.uid,
          );

          const settingsSnapshot = await getDoc(settingsRef);

          visibility[groupId] =
            settingsSnapshot.exists() &&
            settingsSnapshot.data().showLocations === true;
        }

        setGroupVisibility(visibility);
      } catch (error) {
        console.log("Load group settings error:", error);
      }
    };

    loadGroups();
  }, []);

  useEffect(() => {
    if (!user) return;

    const settingsListeners = [];

    const loadListeners = async () => {
      try {
        const groupsRef = collection(clouddb, "groups");

        const q = query(
          groupsRef,
          where("members", "array-contains", user.uid),
        );

        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((groupDocument) => {
          const groupId = groupDocument.id;

          const settingsRef = doc(
            clouddb,
            "groups",
            groupId,
            "locationSettings",
            user.uid,
          );
        });
      } catch (error) {
        console.log("Group listener error:", error);
      }
    };

    loadListeners();

    return () => {
      settingsListeners.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  // Get group members
  useEffect(() => {
    if (!user) return;

    let unsubscribeUsers = null;

    const loadGroupMembers = async () => {
      try {
        const groupsRef = collection(clouddb, "groups");

        const q = query(
          groupsRef,
          where("members", "array-contains", user.uid),
        );

        const querySnapshot = await getDocs(q);

        // Store member IDs together with their group IDs
        const memberGroups = {};

        querySnapshot.forEach((groupDocument) => {
          const group = groupDocument.data();

          const groupId = groupDocument.id;

          if (group.members) {
            group.members.forEach((memberId) => {
              if (memberId === user.uid) {
                return;
              }

              if (!memberGroups[memberId]) {
                memberGroups[memberId] = [];
              }

              memberGroups[memberId].push(groupId);
            });
          }
        });

        // Listen for user location changes
        const usersRef = ref(db, "users");

        unsubscribeUsers = onValue(usersRef, (snapshot) => {
          if (!snapshot.exists()) {
            setGroupMembers([]);
            return;
          }

          const users = snapshot.val();

          const members = [];

          Object.keys(memberGroups).forEach((memberId) => {
            const member = users[memberId];

            if (!member) return;

            if (!member.lastLocation) {
              return;
            }

            members.push({
              id: memberId,
              username: member.username || "Unknown",
              profilePic: member.profilePic || "",
              latitude: member.lastLocation.latitude,
              longitude: member.lastLocation.longitude,
              updatedAt: member.lastLocation.updatedAt || null,
              groupIds: memberGroups[memberId],
            });
          });

          setGroupMembers(members);
        });
      } catch (error) {
        console.log("Load group members error:", error);
      }
    };

    loadGroupMembers();

    return () => {
      if (unsubscribeUsers) {
        unsubscribeUsers();
      }
    };
  }, []);

  const shouldShowMember = (member) => {
    if (!member.groupIds) {
      return false;
    }
    return member.groupIds.some((groupId) => groupVisibility[groupId] === true);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 1.3521,
          longitude: 103.8198,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        loadingEnabled={true}
      >
        {/* User location */}
        {location && (
          <Marker
            coordinate={location}
            title="You are here"
            description="Your current location"
          />
        )}

        {/* Group member location */}
        {groupMembers.filter(shouldShowMember).map((member) => (
          <Marker
            key={member.id}
            coordinate={{
              latitude: member.latitude,
              longitude: member.longitude,
            }}
            title={member.username}
            description="Group member"
          />
        ))}
      </MapView>

      <BottomNav navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  map: {
    flex: 1,
  },
});
