import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import BottomNav from "../components/BottomNav";

const FloodInfo = {
  1: {
    title: "What is a Flood?",
    content:
      "A flood occurs when water covers land that is normally dry. Flooding can happen when there is heavy rainfall, overflowing drains, rivers, or other sources of water.",
  },
  2: {
    title: "Flash floods",
    content:
      "In most instances, our drains can cope with the rain. However, there could be times when extremely heavy rainfall over a short period could exceed our drains’ capacity. This is when flash floods – small and localised floods that typically do not last for more than an hour – may occur.",
  },
  3: {
    title: "Coastal floods",
    content:
      "Singapore generally experiences two high tides per day. From time to time, Singapore may also experience storm surges, which is when an intense low pressure at the centre of a storm meets strong winds. These storm surges usually last three to five days and can raise sea levels at our shorelines. Such events could lead to coastal flooding and inundate low-lying coastal areas, even in the absence of rain. Should there be a rare event where rising sea levels, storm surges, and/or high tides all occur at more or less the same time, water levels could rise by up to five metres. This could pose a serious threat to a small island like Singapore. ",
  },
  4: {
    title: "Flood response",
    content:
      "Floods can occur suddenly, and quick response time is crucial. PUB Singapore's National Water Agency have a fleet of up to 13 Flood Response Vehicles (QRTs) equipped with features such as a GPS tracker and a pan-tilt-zoom camera to stream real-time vehicle location and flood conditions on the road to their Joint Operations Centre (JOC). These enable the officers at the JOC to monitor incidents in real-time and deploy vehicles swiftly. During heavy rain events, QRTs are deployed to potential flood locations to keep the public out of harm’s way. The vehicles, with their mounted LED signs and blinker lights, are also able to drive through higher floodwaters of up to 700 millimetres to close off flooded road sections and divert traffic. Flood protection devices, such as portable flood barriers and inflatable flood bags, stored in the vehicles can be quickly deployed to divert water away from roads or residents’ homes.",
  },
  5: {
    title: "What to Do After a Flood",
    content:
      "Wait until authorities confirm that the area is safe before returning. Avoid contact with floodwater where possible and check your surroundings for hazards.",
  },
};

export default function FloodInfoScreen({ navigation, route }) {
  const { infoId } = route.params;
  const info = FloodInfo[infoId];

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>{info.title}</Text>

        <Text style={styles.content}>{info.content}</Text>
      </ScrollView>

      <BottomNav navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    padding: 20,
    paddingTop: 60,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
  },

  content: {
    fontSize: 16,
    lineHeight: 25,
    color: "#333",
  },
});
