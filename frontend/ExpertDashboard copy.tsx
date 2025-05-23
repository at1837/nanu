import React, { useEffect, useState } from "react";
import Patient from "./Setting";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";
import axios from "axios";
import type { Node } from "./App";

type Props = {
  userId: string;
  treeData: Node[];
  setTreeData: React.Dispatch<React.SetStateAction<Node[]>>;
};

type UserSetting = {
  user_id: string;
  setting: Node[];
};

const ExpertDashboard: React.FC<Props> = ({ userId, treeData, setTreeData }) => {
  const [allSettings, setAllSettings] = useState<UserSetting[]>([]);
  const [settings, setSettings] = useState<UserSetting>();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const UpdateSettings = async () => {
    try {
      const res = await axios.patch("http://localhost:4040/api/setting", {
        params: { sertting: userId },
      });
      setAllSettings(res.data);
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    }
  };

  useEffect(() => {
    const fetchAllSettings = async () => {
      try {
        const res = await axios.get("http://localhost:4040/api/setting", {
          params: { user_id: userId },
        });
        setAllSettings(res.data);
        setSettings(res.data[0]);
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      }
    };

    fetchAllSettings();
  }, [userId]);

  const toggleExpand = (name: string) => {
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const ReadOnlySetting: React.FC<UserSetting> = ({ user_id, setting }) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => setExpanded(!expanded);

    const renderTree = (nodes: Node[]) => {
      return nodes.map((node) => {
        const isGroup = !!node.children;
        return (
          <View key={node.name} style={styles.node}>
            <View style={styles.item}>
              <Text style={styles.label}>{node.name}</Text>
              {typeof node.val === "boolean" && <Switch value={node.val} disabled />}
            </View>
            {isGroup && node.children && (
              <View style={styles.children}>{renderTree(node.children)}</View>
            )}
          </View>
        );
      });
    };

    return (
      <View style={styles.readOnlyBox}>
        <TouchableOpacity onPress={toggleExpand} style={styles.userBox}>
          <Text style={styles.userText}>
            {expanded ? "▼ " : "▶ "} {user_id}
          </Text>
        </TouchableOpacity>
        {expanded && <View style={styles.settingsBox}>{renderTree(setting)}</View>}
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        {treeData.map((node) => {
          const isExpandable = !!node.children;
          const isExpanded = expanded[node.name] ?? true;

          return (
            <View key={node.name} style={styles.node}>
              <View style={styles.item}>
                {isExpandable ? (
                  <TouchableOpacity
                    onPress={() => toggleExpand(node.name)}
                    style={styles.arrowBox}
                  >
                    <Text style={styles.arrow}>{isExpanded ? "▼" : "▶"}</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.arrowPlaceholder} />
                )}
                <Text style={styles.label}>{node.name}</Text>
                {typeof node.val === "boolean" && (
                  <Switch
                    value={!!node.val}
                    onValueChange={(val) =>
                      setTreeData((prev) =>
                        prev.map((n) =>
                          n.name === node.name ? { ...n, val } : n
                        )
                      )
                    }
                  />
                )}
              </View>
              {isExpandable && isExpanded && node.children && (
                <View style={styles.children}>
                  <Patient
                    userId={userId}
                    treeData={node.children}
                    setTreeData={setTreeData}
                  />
                </View>
              )}
            </View>
          );
        })}
      </View>

      <View>
        {allSettings.map((entry) => (
          <ReadOnlySetting
            key={entry.user_id}
            user_id={entry.user_id}
            setting={entry.setting}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  readOnlyBox: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  userBox: {
    padding: 12,
    backgroundColor: "#e0e0e0",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  userText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  settingsBox: {
    padding: 12,
  },
  node: {
    marginBottom: 4,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 15,
    flex: 1,
  },
  children: {
    paddingLeft: 16,
    marginTop: 4,
  },
  arrowBox: {
    marginRight: 8,
  },
  arrowPlaceholder: {
    width: 16,
    marginRight: 8,
  },
  arrow: {
    fontSize: 14,
  },
});

export default ExpertDashboard;
