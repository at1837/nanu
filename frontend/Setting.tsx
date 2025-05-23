import React, { useState, useMemo } from "react";
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
  refresh?: () => void;
};

type FlatNode = {
  name: string;
  val: boolean;
  depth: number;
  parentName: string | null;
};

const Patient: React.FC<Props> = ({ userId, treeData, setTreeData, refresh }) => {
  const [inputName, setInputName] = useState("");
  const [showPromptFor, setShowPromptFor] = useState<string | null>(null);

  const flattenTree = (
    nodes: Node[],
    depth = 0,
    parentName: string | null = null
  ): FlatNode[] => {
    let result: FlatNode[] = [];
    for (const node of nodes) {
      result.push({ name: node.name, val: node.val, depth, parentName });
      if (node.children) {
        result = result.concat(flattenTree(node.children, depth + 1, node.name));
      }
    }
    return result;
  };

  const flatList = useMemo(() => flattenTree(treeData), [treeData]);

  const updateTree = (nodes: Node[]) => {
    setTreeData(nodes);
    try {
      axios.patch("http://localhost:4040/api/setting", {
        setting: nodes,
      });
      refresh();
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
    return nodes.map((node) => {
      if (node.children) {
        const hasTarget = node.children.some((child) => child.name === target);
        if (hasTarget) {
          return {
            ...node,
            children: node.children.filter((child) => child.name !== target),
          };
        } else {
          return {
            ...node,
            children: deleteNode(node.children, target),
          };
        }
      }
      return node;
    });
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
      {flatList.map((node) => (
        <View key={node.name} style={[styles.node, { paddingLeft: node.depth * 20 }]}>
          <View style={styles.item}>
            <Text style={styles.label}>{node.name}</Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                onPress={() => handleAddNode(node.name)}
                style={styles.actionButton}
              >
                <Text style={styles.actionText}>＋</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteNode(node.name)}
                style={styles.actionButton}
              >
                <Text style={styles.actionText}>−</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}

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
