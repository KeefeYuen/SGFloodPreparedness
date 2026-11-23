import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

const QUIZZES = [
  {
    id: 1,
    title: "Quiz 1",
    image: require("../assets/quiz1.jpg"),
    scenario: "Flood waters have covered the path. What should you do?",
    answer: "A",
    answers: {
      A: "Avoid it",
      B: "Walk into the flood water",
    },
    hotspots: {
      A: { top: "18%", left: "14%", width: "30%", height: "18%" },
      B: { top: "58%", left: "56%", width: "30%", height: "18%" },
    },
    correctExplanation:
      "Correct. Avoid walking through moving water above ankle height, as it could cause you to fall.",
    wrongExplanation:
      "Not quite. Walking through flood water is dangerous because it can be deeper or moving fast.",
  },
  {
    id: 2,
    title: "Quiz 2",
    image: require("../assets/quiz2.jpg"),
    scenario:
      "While waiting for a bus, you receive an alert about the risk of flash floods along your route. What do you do?",
    answer: "B",
    answers: {
      A: "Keep ignoring the alert",
      B: "Find an alternative route even if it might take longer.",
    },
    hotspots: {
      A: { top: "30%", left: "60%", width: "26%", height: "16%" },
      B: { top: "50%", left: "10%", width: "30%", height: "18%" },
    },
    correctExplanation:
      "Correct. Avoiding flooded areas and stay on high ground as much as possible. A small detour is worth it to stay dry and safe.",
    wrongExplanation:
      "Not quite. Ignoring a flood warning can leave you unprepared when the situation gets worse.",
  },
  {
    id: 3,
    title: "Quiz 3",
    image: require("../assets/quiz3.jpg"),
    scenario: "You are driving and the road is flooded.",
    answer: "A",
    answers: {
      A: "Go back and find another way.",
      B: "Just drive through it.",
    },
    hotspots: {
      A: { top: "24%", left: "12%", width: "32%", height: "18%" },
      B: { top: "54%", left: "54%", width: "30%", height: "18%" },
    },
    correctExplanation:
      "Correct. You should avoid driving through flooded roads with water above kerb height. If driving through a flood is unavoidable, drive slowly and avoid braking.",
    wrongExplanation:
      "Not quite. You should avoid driving through flooded roads with water above kerb height. You should only drive through a flooded area if it’s unavoidable and passable. Drive slowly and steadily and avoid braking to keep engine speed high and constant.",
  },
  {
    id: 4,
    title: "Quiz 4",
    image: require("../assets/quiz4.jpg"),
    scenario:
      "Floodwaters have entered your home and your living room floor is wet.",
    answer: "B",
    answers: {
      A: "Turn on the radio. This is the closest you've come to a seaside holiday",
      B: "Do not touch any electrical switches or appliances",
    },
    hotspots: {
      A: { top: "20%", left: "58%", width: "28%", height: "18%" },
      B: { top: "60%", left: "14%", width: "32%", height: "18%" },
    },
    correctExplanation:
      "Correct. Touching electric switches or appliances when wet is dangerous. There are also better things to do, like moving your things to higher shelves or higher ground.",
    wrongExplanation:
      "Not quite. Avoid touching electric switches or appliances if you’re wet or standing in water. You could be electrocuted! Use the time to move essential items to higher ground instead.",
  },
];

export default function QuizScreen({ route, navigation, markQuizCompleted }) {
  const quizId = route?.params?.quizId;
  const quiz = useMemo(
    () => QUIZZES.find((item) => item.id === quizId),
    [quizId],
  );
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  if (!quiz) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Quiz not found</Text>
      </View>
    );
  }

  const handleChoicePress = (choice) => {
    if (hasAnswered) {
      return;
    }

    setSelectedChoice(choice);
    setHasAnswered(true);

    if (choice === quiz.answer && markQuizCompleted) {
      markQuizCompleted(quiz.id);
    }
  };

  const isCorrect = selectedChoice === quiz.answer;
  const explanationText = isCorrect
    ? quiz.correctExplanation
    : quiz.wrongExplanation;

  return (
    <View style={styles.container}>
      <Text style={styles.quizTitle}>{quiz.title}</Text>
      <Text style={styles.scenario}>{quiz.scenario}</Text>

      <View style={styles.imagePlaceholder}>
        <Image
          source={quiz.image}
          style={styles.quizImage}
          resizeMode="contain"
        />

        {hasAnswered ? (
          <View style={styles.explanationOverlay} pointerEvents="none">
            <Text style={styles.explanationText}>{explanationText}</Text>
          </View>
        ) : (
          ["A", "B"].map((choice) => {
            const hotspot = quiz.hotspots?.[choice];

            if (!hotspot) {
              return null;
            }

            const isSelected = selectedChoice === choice;
            const isAnswer = quiz.answer === choice;
            const answerTextStyle = [
              styles.hotspotLabel,
              hasAnswered && isSelected && styles.hotspotLabelSelected,
              hasAnswered &&
                isSelected &&
                isAnswer &&
                styles.hotspotLabelCorrect,
              hasAnswered &&
                isSelected &&
                !isAnswer &&
                styles.hotspotLabelWrong,
            ];

            return (
              <TouchableOpacity
                key={choice}
                style={[
                  styles.hotspot,
                  hotspot,
                  hasAnswered &&
                    selectedChoice === choice &&
                    styles.answerSelected,
                  hasAnswered &&
                    selectedChoice === choice &&
                    choice === quiz.answer &&
                    styles.answerCorrect,
                  hasAnswered &&
                    selectedChoice === choice &&
                    choice !== quiz.answer &&
                    styles.answerWrong,
                ]}
                onPress={() => handleChoicePress(choice)}
                activeOpacity={0.85}
              >
                <Text style={answerTextStyle}>
                  {quiz.answers?.[choice] ?? choice}
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {hasAnswered ? (
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.doneButtonText}>Back to quizzes</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    padding: 20,
    paddingTop: 5,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
  },
  quizTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 10,
  },
  scenario: {
    fontSize: 16,
    color: "#333",
    marginBottom: 16,
    lineHeight: 22,
  },
  imagePlaceholder: {
    flex: 1,
    minHeight: 420,
    borderRadius: 16,
    backgroundColor: "#e9eef5",
    borderWidth: 1,
    borderColor: "#d0d7e2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    overflow: "hidden",
    position: "relative",
  },
  imagePlaceholderText: {
    color: "#6b7280",
    fontSize: 16,
    position: "absolute",
    top: 12,
    alignSelf: "center",
  },
  hotspot: {
    position: "absolute",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#0f172a",
    backgroundColor: "rgba(255,255,255,0.88)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  hotspotLabel: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
  },
  hotspotLabelSelected: {
    color: "#1d4ed8",
  },
  hotspotLabelCorrect: {
    color: "#166534",
  },
  hotspotLabelWrong: {
    color: "#991b1b",
  },
  answerSelected: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },
  answerCorrect: {
    borderColor: "#16a34a",
    backgroundColor: "#dcfce7",
  },
  answerWrong: {
    borderColor: "#dc2626",
    backgroundColor: "#fee2e2",
  },
  explanationOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    backgroundColor: "rgba(255, 255, 255, 0.35)",
  },
  explanationText: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
    color: "#111827",
    textAlign: "center",
    backgroundColor: "rgba(255, 255, 255, 0.72)",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
  },
  doneButton: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  quizImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    alignSelf: "center",
  },
});
