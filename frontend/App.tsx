import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  Button,
  Alert,
} from "react-native";
import PatientDashboard from "./PatientDashboard";
import ExpertDashboard from "./ExpertDashboard";

import axios from "axios";

export type Node = {
  name: string;
  val?: boolean;
  children?: Node[];
};

export function transformToNodeTree(obj: any): Node[] {
  const walk = (val: any, key: string): Node => {
    if (typeof val === "boolean") return { name: key, val };
    return {
      name: key,
      children: Object.entries(val).map(([k, v]) => walk(v, k)),
    };
  };

  return Object.entries(obj).map(([k, v]) => walk(v, k));
}

export default function App() {
  const [treeData, setTreeData] = useState<Node[]>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
  try {
    const res = await axios.post("http://localhost:4040/api/login", {
      user_id: userId,
      password: password,
    });

    const data = res.data;

    setUserType(data.type);
    setLoggedIn(true);

    if (data.type === "Patient") {
      const settingRes = await axios.get(`http://localhost:4040/api/setting?user_id=${userId}`);
      setTreeData(settingRes.data.setting);
    }
  } catch (err) {
    console.error("Login error", err);
    Alert.alert("Error", "Unable to login.");
  }
};

  if (!loggedIn) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", padding: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
          Login
        </Text>
        <TextInput
          placeholder="User ID"
          value={userId}
          onChangeText={setUserId}
          style={{ borderWidth: 1, padding: 12, borderRadius: 6, marginBottom: 12 }}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={{ borderWidth: 1, padding: 12, borderRadius: 6, marginBottom: 12 }}
        />
        <Button title="Login" onPress={handleLogin} />
      </SafeAreaView>
    );
  }

  if (userType === "Expert") {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>
            Expert Dashboard
          </Text>
          <ExpertDashboard userId={userId} treeData={treeData} setTreeData={setTreeData}/>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>
          Patient Dashboard
        </Text>
        <PatientDashboard userId={userId} treeData={treeData} setTreeData={setTreeData} />
      </ScrollView>
    </SafeAreaView>
  );
}
