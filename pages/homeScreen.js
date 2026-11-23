import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import BottomNav from "../components/BottomNav";

export default function HomeScreen({ navigation, completedQuizIds }) {
  const totalQuizzes = 4;
  const completedCount = completedQuizIds?.length || 0;

  const progressPercentage = Math.round((completedCount / totalQuizzes) * 100);

  const [floodStatus, setFloodStatus] = useState("Loading...");
  const [floodMessage, setFloodMessage] = useState(
    "Checking current flood alerts...",
  );
  const [floodActive, setFloodActive] = useState(false);

  useEffect(() => {
    const getFloodStatus = async () => {
      try {
        const response = await fetch(
          "https://api-open.data.gov.sg/v2/real-time/api/weather/flood-alerts",
        );

        const data = await response.json();

        if (data.code !== 0) {
          throw new Error("API request failed");
        }

        const records = data.data?.records || [];

        // Check if there are any readings containing flood information
        const hasFloodAlert = records.some(
          (record) =>
            record.item &&
            Array.isArray(record.item.readings) &&
            record.item.readings.length > 0,
        );

        if (hasFloodAlert) {
          setFloodStatus("Flood Alert");
          setFloodMessage("Flood information is currently available.");
          setFloodActive(true);
        } else {
          setFloodStatus("No Flood Alerts");
          setFloodMessage("No active flood alerts detected.");
          setFloodActive(false);
        }
      } catch (error) {
        console.log("Error getting flood status:", error);

        setFloodStatus("Unavailable");
        setFloodMessage("Unable to check flood alerts.");
        setFloodActive(null);
      }
    };

    getFloodStatus();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Flood Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusHeading}>Flood Status</Text>

            <View
              style={[
                styles.statusIcon,
                {
                  backgroundColor:
                    floodActive === null
                      ? "#FFF4E5"
                      : floodActive
                        ? "#FFE5E5"
                        : "#E5F7EA",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusIconText,
                  {
                    color:
                      floodActive === null
                        ? "#F57C00"
                        : floodActive
                          ? "#D32F2F"
                          : "#2E7D32",
                  },
                ]}
              >
                {floodActive === null ? "?" : floodActive ? "!" : "✓"}
              </Text>
            </View>
          </View>

          <Text
            style={[
              styles.statusText,
              {
                color: floodActive ? "#D32F2F" : "#2E7D32",
              },
            ]}
          >
            {floodStatus}
          </Text>

          <Text style={styles.statusDescription}>{floodMessage}</Text>
        </View>

        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Stay Prepared 👋</Text>

          <Text style={styles.welcomeText}>
            Learn how to stay safe before, during and after a flood.
          </Text>
        </View>

        {/* Quiz Progress */}
        <TouchableOpacity
          style={styles.quizCard}
          onPress={() => navigation.navigate("Info")}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Quiz Progress</Text>

            <Text style={styles.cardArrow}>›</Text>
          </View>

          <Text style={styles.progressText}>
            {completedCount}/{totalQuizzes} completed
          </Text>

          {/* Progress Bar */}
          <View style={styles.progressBarBackground}>
            <View
              style={[styles.progressBar, { width: `${progressPercentage}%` }]}
            />
          </View>

          <Text style={styles.percentageText}>{progressPercentage}%</Text>
        </TouchableOpacity>

        {/* Main Features */}
        <Text style={styles.sectionTitle}>Explore</Text>

        {/* Flood Information */}
        <TouchableOpacity
          style={styles.featureCard}
          onPress={() => navigation.navigate("Info")}
          activeOpacity={0.8}
        >
          <View style={styles.featureIcon}>
            <Text style={styles.featureEmoji}>🌧️</Text>
          </View>

          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Flood Information</Text>

            <Text style={styles.featureDescription}>
              Learn about flooding and how to stay safe.
            </Text>
          </View>

          <Text style={styles.featureArrow}>›</Text>
        </TouchableOpacity>

        {/* Map */}
        <TouchableOpacity
          style={styles.featureCard}
          onPress={() => navigation.navigate("Map")}
          activeOpacity={0.8}
        >
          <View style={styles.featureIcon}>
            <Text style={styles.featureEmoji}>📍</Text>
          </View>

          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Flood Map</Text>

            <Text style={styles.featureDescription}>
              View your location and group members.
            </Text>
          </View>

          <Text style={styles.featureArrow}>›</Text>
        </TouchableOpacity>

        {/* Emergency Contacts */}
        <TouchableOpacity
          style={styles.featureCard}
          onPress={() => navigation.navigate("LocalEContact")}
          activeOpacity={0.8}
        >
          <View style={styles.featureIcon}>
            <Text style={styles.featureEmoji}>📞</Text>
          </View>

          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Emergency Contacts</Text>

            <Text style={styles.featureDescription}>
              Quickly access emergency services and contacts.
            </Text>
          </View>

          <Text style={styles.featureArrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>

      <BottomNav navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },

  scrollContent: {
    padding: 20,
    paddingTop: 55,
    paddingBottom: 100,
  },

  statusCard: {
    borderWidth: 1,
    borderColor: "#5CD6C3",
    borderRadius: 12,
    padding: 16,
    marginBottom: 25,
    backgroundColor: "#D4FAF0",
  },

  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  statusHeading: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
  },

  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  statusIconText: {
    fontSize: 21,
    fontWeight: "700",
  },

  statusText: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 5,
  },

  statusDescription: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },

  welcomeSection: {
    marginBottom: 25,
  },

  welcomeTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#222",
    marginBottom: 6,
  },

  welcomeText: {
    fontSize: 14,
    color: "#222",
    lineHeight: 20,
  },

  quizCard: {
    borderWidth: 1,
    borderColor: "#5CD6C3",
    borderRadius: 12,
    padding: 16,
    marginBottom: 28,
    backgroundColor: "#D4FAF0",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#222",
  },

  cardArrow: {
    fontSize: 26,
    color: "#888",
  },

  progressText: {
    fontSize: 14,
    color: "#666",
    marginTop: 10,
    marginBottom: 10,
  },

  progressBarBackground: {
    height: 8,
    backgroundColor: "#eee",
    borderRadius: 5,
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 5,
  },

  percentageText: {
    fontSize: 13,
    color: "#666",
    marginTop: 8,
    textAlign: "right",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
    marginBottom: 12,
  },

  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#5CD6C3",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    backgroundColor: "#D4FAF0",
  },

  featureIcon: {
    width: 45,
    height: 45,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  featureEmoji: {
    fontSize: 22,
  },

  featureText: {
    flex: 1,
  },

  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginBottom: 4,
  },

  featureDescription: {
    fontSize: 12,
    color: "#666",
    lineHeight: 17,
  },

  featureArrow: {
    fontSize: 25,
    color: "#888",
    marginLeft: 8,
  },

  bottomSpace: {
    height: 20,
  },
});
