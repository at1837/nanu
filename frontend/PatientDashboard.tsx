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
import { Picker } from "@react-native-picker/picker";

type Props = {
  userId: string;
  treeData: Node[];
  setTreeData: React.Dispatch<React.SetStateAction<Node[]>>;
};

const generateTimeSlots = () => {
  const slots: string[] = [];
  const start = 8 * 60; 
  const end = 18 * 60; 

  for (let t = start; t <= end; t += 30) {
    const hour = Math.floor(t / 60);
    const minutes = t % 60;
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
    slots.push(`${displayHour}:${displayMinutes} ${ampm}`);
  }

  return slots;
};

const PatientDashboard: React.FC<Props> = ({ userId, treeData, setTreeData }) => {
  const [log, setLog] = useState("");
  const [slot, setSlot] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("");
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

  const handleBook = async () => {
    try {
      await axios.post("http://localhost:4040/api/book", {
        user_id: userId,
        email,
        name,
        service,
        date: selectedDate,
        slot,
      });
      Alert.alert("Success", "Book added!");
      setLog("");
    } catch (err) {
      let message = "Could not book. Please try again.";

      if (axios.isAxiosError(err) && err.response?.data?.message) {
        message = err.response.data.message;
      }

      Alert.alert("Error", message);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.date}>
        Today: {new Date().toLocaleDateString()}
      </Text>

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

      <View style={styles.logBox}>
        <Text style={styles.label}>book a time</Text>
        
        <Text style={styles.label}>Select Slot</Text>
        <Picker
          selectedValue={slot}
          onValueChange={(value) => setSlot(value)}
          style={styles.input}
        >
          <Picker.Item label="Select a slot..." value="" />
          {generateTimeSlots().map((time) => (
            <Picker.Item key={time} label={time} value={time} />
          ))}
        </Picker>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="input a name..."
          style={styles.input}
        />

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="input a email..."
          style={styles.input}
        />

        <TextInput
          value={service}
          onChangeText={setService}
          placeholder="input a service..."
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

        <TouchableOpacity style={styles.button} onPress={handleBook}>
          <Text style={styles.buttonText}>Book</Text>
        </TouchableOpacity>
      </View>

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
