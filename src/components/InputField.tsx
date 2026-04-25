import React from "react";
import { View, Text, TextInput, StyleSheet, TextInputProps } from "react-native";
import { COLORS } from "@/consts/colors";

interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export default function InputField({ label, error, style, ...props }: InputFieldProps) {
  const [isDark] = React.useState(true);

  const theme = {
    text: isDark ? COLORS.dark.text : COLORS.light.text,
    subText: isDark ? COLORS.dark.subText : COLORS.light.subText,
    input: isDark ? COLORS.dark.input : COLORS.light.input,
    border: isDark ? COLORS.dark.border : COLORS.light.border,
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: COLORS.primary }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: theme.input, color: theme.text, borderColor: error ? COLORS.red : theme.border },
          style,
        ]}
        placeholderTextColor={theme.subText}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 10,
    fontWeight: "900",
    marginBottom: 8,
    letterSpacing: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 14,
  },
  error: {
    color: COLORS.red,
    fontSize: 10,
    marginTop: 4,
  },
});