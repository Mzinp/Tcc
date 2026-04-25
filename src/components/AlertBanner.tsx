import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/consts/colors";

interface AlertBannerProps {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: "info" | "success" | "warning" | "error";
  onPress?: () => void;
}

export default function AlertBanner({
  title,
  icon = "information-circle",
  variant = "info",
  onPress,
}: AlertBannerProps) {
  const colors = {
    info: COLORS.primary,
    success: COLORS.green,
    warning: COLORS.orange,
    error: COLORS.red,
  };

  const content = (
    <View style={[styles.banner, { backgroundColor: colors[variant] }]}>
      <Ionicons name={icon} size={20} color="white" />
      <Text style={styles.title}>{title}</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
  },
  title: {
    color: "white",
    fontWeight: "bold",
    fontSize: 13,
    marginLeft: 10,
    flex: 1,
  },
});