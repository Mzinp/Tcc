import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/consts/colors";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function PrimaryButton({
  title,
  onPress,
  icon,
  loading,
  disabled,
  style,
  textStyle,
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <Text style={styles.text}>Carregando...</Text>
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={18}
              color="white"
              style={styles.icon}
            />
          )}
          <Text style={[styles.text, textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    letterSpacing: 1,
  },
  icon: {
    marginRight: 8,
  },
});