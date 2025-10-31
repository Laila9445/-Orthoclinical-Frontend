import React from "react";
import { SafeAreaView } from "react-native";
import PrescriptionSystemScreen from "../../screens/PrescriptionSystemScreen";

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <PrescriptionSystemScreen />
    </SafeAreaView>
  );
}
