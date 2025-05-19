import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import axios from "axios";
import { Calendar } from "react-native-calendars";
import Patient from "./Patient";
import type { Node } from "./App";

type Props = {
  userId: string;
  treeData: Node[];
  setTreeData: React.Dispatch<React.SetStateAction<Node[]>>;
};

const PatientDashboard: React.FC<Props> = ({ userId, treeData, setTreeData }) => {
  const [log, setLog] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const handleAddLog = async () => {
    try {
      await axios.post("http://localhost:4040/api/log", {
        user_id: userId,
        date: selectedDate,
        content: log,
      });
      Alert.alert("Success", "Log added!");
      setLog("");
    } catch (err) {
      console.error("Log submission failed:", err);
      Alert.alert("Error", "Could not add log.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Today's Date */}
      <Text style={styles.date}>
        Today: {new Date().toLocaleDateString()}
      </Text>

      {/* Log Section */}
      <View style={styles.logBox}>
        <Text style={styles.label}>Log</Text>
        <TextInput
          value={log}
          onChangeText={setLog}
          placeholder="Write a log..."
          style={styles.input}
        />

        <Text style={styles.label}>Select Date</Text>
        <Calendar
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={{
            [selectedDate]: {
              selected: true,
              selectedColor: "#4CAF50",
            },
          }}
          theme={{
            selectedDayBackgroundColor: "#4CAF50",
            todayTextColor: "#FF5722",
          }}
        />

        <TouchableOpacity style={styles.button} onPress={handleAddLog}>
          <Text style={styles.buttonText}>Add Log</Text>
        </TouchableOpacity>
      </View>

      {/* Settings Tree */}
      <Patient
        userId={userId}
        treeData={treeData}
        setTreeData={setTreeData}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  date: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  logBox: {
    marginBottom: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PatientDashboard;
