import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const NAV_ITEMS = [
  { title: "🏠", screen: "Home" },
  { title: "ℹ️", screen: "Info" },
  { title: "🗺️", screen: "Map" },
  { title: "👪", screen: "Family" },
  { title: "📞", screen: "LocalEContact" },
  { title: "⚙️", screen: "Settings" },
];

export default function BottomNav({ navigation }) {
  return (
    <View style={styles.buttonNavContainer}>
      {NAV_ITEMS.map((item) => (
        <NavButton
          key={item.screen}
          label={item.title}
          onPress={() => navigation.navigate(item.screen)}
        />
      ))}
    </View>
  );
}

function NavButton({ label, onPress }) {
  return (
    <TouchableOpacity
      style={styles.navButton}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
    >
      <Text style={styles.navButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonNavContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 55,
    paddingVertical: 8,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  navButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 22,
  },
  navButtonText: {
    fontSize: 22,
  },
});
