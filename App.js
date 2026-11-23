import { StyleSheet, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useState, useEffect } from "react";

import { auth, clouddb } from "./FireBaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

import LoginScreen from "./pages/loginScreen";
import RegisterScreen from "./pages/registerScreen";
import HomeScreen from "./pages/homeScreen";
import InformationGameScreen from "./pages/infoScreen";
import MapScreen from "./pages/mapScreen";
import FamilyScreen from "./pages/familyScreen";
import LocalEContactScreen from "./pages/eContactScreen";
import FloodInfoScreen from "./pages/floodInfoScreen";
import QuizScreen from "./pages/quizScreen";
import SettingsScreen from "./pages/settingsScreen";
import CreateGroupScreen from "./pages/createGroupScreen";
import GroupScreen from "./pages/groupScreen";
import GroupSettingsScreen from "./pages/groupSettingsScreen";
import AddMemberScreen from "./pages/addMemberScreen";
import MemberManagementScreen from "./pages/memberManagementScreen";
import EditProfileScreen from "./pages/profileEditScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [completedQuizIds, setCompletedQuizIds] = useState([]);

  // Loads quiz progress from Firebase when the user logs in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setCompletedQuizIds([]);
        return;
      }

      try {
        const userRef = doc(clouddb, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();

          setCompletedQuizIds(data.completedQuizIds || []);
        } else {
          setCompletedQuizIds([]);
        }
      } catch (error) {
        console.log("Error loading quiz progress:", error);
      }
    });

    return unsubscribe;
  }, []);

  // Mark a quiz as completed and save it to Firebase
  const markQuizCompleted = async (quizId) => {
    try {
      const user = auth.currentUser;

      if (!user) {
        console.log("No user logged in");
        return;
      }

      if (completedQuizIds.includes(quizId)) {
        return;
      }

      const updatedQuizIds = [...completedQuizIds, quizId];

      setCompletedQuizIds(updatedQuizIds);

      // Save to Firebase
      const userRef = doc(clouddb, "users", user.uid);

      await setDoc(
        userRef,
        {
          completedQuizIds: updatedQuizIds,
        },
        { merge: true },
      );

      console.log("Quiz progress saved!");
    } catch (error) {
      console.log("Error saving quiz progress:", error);
    }
  };

  // Reset quiz progress both locally and in Firebase
  const resetQuizzes = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        setCompletedQuizIds([]);
        return;
      }

      const userRef = doc(clouddb, "users", user.uid);

      await setDoc(
        userRef,
        {
          completedQuizIds: [],
        },
        { merge: true },
      );

      setCompletedQuizIds([]);

      console.log("Quiz progress reset!");
    } catch (error) {
      console.log("Error resetting quiz progress:", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground
        source={require("./assets/FloodBackground.jpg")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              contentStyle: {
                backgroundColor: "transparent",
              },
            }}
          >
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen name="Register" component={RegisterScreen} />

            <Stack.Screen name="Home" options={{ headerShown: false }}>
              {(props) => (
                <HomeScreen {...props} completedQuizIds={completedQuizIds} />
              )}
            </Stack.Screen>

            <Stack.Screen name="Info">
              {(props) => (
                <InformationGameScreen
                  {...props}
                  completedQuizIds={completedQuizIds}
                  markQuizCompleted={markQuizCompleted}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="FloodInfo" component={FloodInfoScreen} />

            <Stack.Screen name="Quiz">
              {(props) => (
                <QuizScreen {...props} markQuizCompleted={markQuizCompleted} />
              )}
            </Stack.Screen>

            <Stack.Screen name="Map" component={MapScreen} />

            <Stack.Screen name="Family" component={FamilyScreen} />

            <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />

            <Stack.Screen name="Group" component={GroupScreen} />

            <Stack.Screen
              name="GroupSettings"
              component={GroupSettingsScreen}
            />

            <Stack.Screen name="AddMember" component={AddMemberScreen} />

            <Stack.Screen
              name="MemberManagement"
              component={MemberManagementScreen}
            />

            <Stack.Screen
              name="LocalEContact"
              component={LocalEContactScreen}
            />

            <Stack.Screen name="Settings">
              {(props) => (
                <SettingsScreen {...props} resetQuizzes={resetQuizzes} />
              )}
            </Stack.Screen>
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
