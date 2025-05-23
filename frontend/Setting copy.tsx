import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import type { Node } from "./App";
import axios from "axios";

type Props = {
  userId: string;
  treeData: Node[];
  setTreeData: React.Dispatch<React.SetStateAction<Node[]>>;
};

const Patient: React.FC<Props> = ({ userId, treeData, setTreeData }) => {
  const [inputName, setInputName] = useState("");
  const [showPromptFor, setShowPromptFor] = useState<string | null>(null);

  const updateTree = (nodes: Node[]) => {
    setTreeData(nodes);
    try {
      axios.patch("http://localhost:4040/api/setting", {
        setting: nodes,
      });
    } catch (err) {
      console.error("Failed to update setting:", err);
    }
  };

  const addChild = (nodes: Node[], parent: string, childName: string): Node[] => {
    return nodes.map((node) => {
      if (node.name === parent) {
        const newChild: Node = {
          name: childName,
          val: false,
          children: [],
        };
        return {
          ...node,
          children: [...(node.children || []), newChild],
        };
      }
      return {
        ...node,
        children: node.children ? addChild(node.children, parent, childName) : node.children,
      };
    });
  };

  const deleteNode = (nodes: Node[], target: string): Node[] => {
    return nodes
      .map((node) => {
        if (node.name === target) return null;
        return {
          ...node,
          children: node.children ? deleteNode(node.children, target) : node.children,
        };
      })
      .filter(Boolean) as Node[];
  };


  const handleAddNode = (parentName: string) => {
    setShowPromptFor(parentName);
  };

  const handleConfirmAdd = () => {
    if (!showPromptFor || !inputName.trim()) {
      setShowPromptFor(null);
      return;
    }
    const newName = inputName.trim();
    const updated = addChild(treeData, showPromptFor, newName);
    updateTree(updated);
    setInputName("");
    setShowPromptFor(null);
  };

  const handleDeleteNode = (name: string) => {
    const updated = deleteNode(treeData, name);
    updateTree(updated);
  };

  return (
    <View style={styles.container}>
      {treeData.map((node) => {
        const isLeaf = !node.children || node.children.length === 0;

        return (
          <View key={node.name} style={styles.node}>
            <View style={styles.item}>
              <Text style={styles.label}>{node.name}</Text>
              <View style={styles.buttonGroup}>
                {!isLeaf && (
                  <TouchableOpacity onPress={() => handleAddNode(node.name)} style={styles.actionButton}>
                    <Text style={styles.actionText}>＋</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => handleDeleteNode(node.name)} style={styles.actionButton}>
                  <Text style={styles.actionText}>−</Text>
                </TouchableOpacity>
              </View>
            </View>

            {node.children && node.children.length > 0 && (
              <View style={styles.children}>
                <Patient userId={userId} treeData={node.children} setTreeData={setTreeData} />
              </View>
            )}
          </View>
        );
      })}

      {showPromptFor && (
        <View style={styles.promptBox}>
          <Text>New node name for "{showPromptFor}":</Text>
          <TextInput
            style={styles.promptInput}
            placeholder="Enter name"
            value={inputName}
            onChangeText={setInputName}
          />
          <TouchableOpacity onPress={handleConfirmAdd} style={styles.promptConfirm}>
            <Text style={styles.promptConfirmText}>Add</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingLeft: 4,
  },
  node: {
    marginVertical: 4,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    flex: 1,
    fontSize: 16,
  },
  children: {
    paddingLeft: 20,
  },
  buttonGroup: {
    flexDirection: "row",
    marginLeft: 8,
  },
  actionButton: {
    paddingHorizontal: 8,
  },
  actionText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  promptBox: {
    backgroundColor: "#eee",
    padding: 10,
    margin: 10,
    borderRadius: 6,
  },
  promptInput: {
    borderWidth: 1,
    borderColor: "#999",
    padding: 6,
    marginTop: 4,
    marginBottom: 6,
    borderRadius: 4,
  },
  promptConfirm: {
    backgroundColor: "#4caf50",
    padding: 6,
    alignItems: "center",
    borderRadius: 4,
  },
  promptConfirmText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default Patient;
