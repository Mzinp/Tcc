import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/consts/colors";

interface StatusBadgeProps {
  status: "pending" | "success" | "error" | "warning";
  text: string;
}

export default function StatusBadge({ status, text }: StatusBadgeProps) {
  const colors = {
    pending: COLORS.orange,
    success: COLORS.green,
    error: COLORS.red,
    warning: COLORS.orange,
  };

  const icons = {
    pending: "time-outline",
    success: "checkmark-circle",
    error: "close-circle",
    warning: "alert-circle",
  };

  return (
    <View style={[styles.badge, { backgroundColor: `${colors[status]}20` }]}>
      <Ionicons name={icons[status]} size={12} color={colors[status]} />
      <Text style={[styles.text, { color: colors[status] }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  text: {
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 6,
  },
});