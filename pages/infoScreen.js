import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import BottomNav from "../components/BottomNav";

const FloodInfo = [
  { id: 1, title: "What is a Flood?" },
  { id: 2, title: "Flash Flood" },
  { id: 3, title: "Coastal Flood" },
  { id: 4, title: "Flood Response" },
  { id: 5, title: "What to Do After a Flood" },
];

const Quizzes = [
  { id: 1, title: "Quiz 1" },
  { id: 2, title: "Quiz 2" },
  { id: 3, title: "Quiz 3" },
  { id: 4, title: "Quiz 4" },
];

export default function InformationGameScreen({
  navigation,
  completedQuizIds = [],
}) {
  const completedCount = completedQuizIds.length;

  return (
    <View style={styles.container}>
      <View style={styles.headingRow}>
        <Text style={styles.heading}>Flood Info</Text>
      </View>
      <View style={styles.table}>
        {FloodInfo.map((info) => (
          <TouchableOpacity
            key={info.id}
            style={styles.row}
            onPress={() =>
              navigation.navigate("FloodInfo", { infoId: info.id })
            }
          >
            <Text style={styles.cellTitle}>{info.title}</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.headingRow}>
        <Text style={styles.heading}>Quizzes</Text>
        <Text style={styles.counter}>
          ({completedCount}/{Quizzes.length} completed)
        </Text>
      </View>

      <View style={styles.table}>
        {Quizzes.map((quiz) => (
          <TouchableOpacity
            key={quiz.id}
            style={styles.row}
            onPress={() => navigation.navigate("Quiz", { quizId: quiz.id })}
          >
            <Text style={styles.cellTitle}>{quiz.title}</Text>
            <Text style={styles.cellCheck}>
              {completedQuizIds.includes(quiz.id) ? "✓" : ""}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <BottomNav navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    padding: 10,
  },

  heading: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
  },

  headingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingTop: 10,
  },

  counter: {
    fontSize: 14,
    color: "#666",
  },

  table: {
    borderWidth: 1,
    borderColor: "#5CD6C3",
    borderRadius: 10,
    overflow: "hidden",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#5CD6C3",
    backgroundColor: "#D4FAF0",
  },

  cellTitle: {
    fontSize: 16,
  },

  cellCheck: {
    fontSize: 18,
    fontWeight: "700",
  },

  arrow: {
    fontSize: 24,
    color: "#888",
  },
});
