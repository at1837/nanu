import React, { useState } from "react";
import { View, Text, Switch, StyleSheet, TouchableOpacity } from "react-native";
import type { Node } from "./App";
import axios from "axios";

type Props = {
  userId: string;
  treeData: Node[];
  setTreeData: React.Dispatch<React.SetStateAction<Node[]>>;
};

const Patient: React.FC<Props> = ({ userId, treeData, setTreeData }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (name: string) => {
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const updateTree = (nodes: Node[], target: string, newVal: boolean): Node[] => {
    const setTarget = (node: Node): Node => {
      if (node.name === target) {
        return {
          ...node,
          val: newVal,
          children: node.children?.map(setAll) ?? undefined,
        };
      }
      return {
        ...node,
        children: node.children?.map(setTarget),
      };
    };

    const setAll = (node: Node): Node => ({
      ...node,
      val: newVal,
      children: node.children?.map(setAll),
    });

    const syncParents = (node: Node): Node => {
      if (!node.children || node.children.length === 0) return node;

      const syncedChildren = node.children.map(syncParents);
      const allTrue = syncedChildren.every((child) => child.val === true);
      const anyFalse = syncedChildren.some((child) => child.val === false);

      return {
        ...node,
        val: allTrue ? true : anyFalse ? false : node.val,
        children: syncedChildren,
      };
    };

    const updated = nodes.map(setTarget).map(syncParents);

    try {
      axios.put("http://localhost:4040/api/setting", {
        user_id: userId,
        setting: updated,
      });
    } catch (err) {
      console.error("Failed to update setting:", err);
    }

    return updated;
  };

  return (
    <View style={styles.container}>
      {treeData.map((node) => {
        const isExpandable = !!node.children;
        const isExpanded = expanded[node.name] ?? true;

        return (
          <View key={node.name} style={styles.node}>
            <View style={styles.item}>
              {isExpandable ? (
                <TouchableOpacity onPress={() => toggleExpand(node.name)} style={styles.arrowBox}>
                  <Text style={styles.arrow}>{isExpanded ? "▼" : "▶"}</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.arrowPlaceholder} />
              )}

              <Text style={styles.label}>{node.name}</Text>

              <Switch
                value={!!node.val}
                onValueChange={(val) =>
                  setTreeData((prev) => updateTree([...prev], node.name, val))
                }
              />
            </View>

            {isExpandable && isExpanded && node.children && (
              <View style={styles.children}>
                <Patient userId={userId} treeData={node.children} setTreeData={setTreeData} />
              </View>
            )}
          </View>
        );
      })}
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
  arrowBox: {
    width: 24,
    alignItems: "center",
    marginRight: 4,
  },
  arrowPlaceholder: {
    width: 24,
    marginRight: 4,
  },
  arrow: {
    fontSize: 16,
  },
  label: {
    flex: 1,
    fontSize: 16,
  },
  children: {
    paddingLeft: 20,
  },
});

export default Patient;
