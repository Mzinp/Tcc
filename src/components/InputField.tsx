import React from "react";
import { View, Text, TextInput, StyleSheet, TextInputProps } from "react-native";
import { COLORS } from "@/consts/colors";
import { Ionicons } from "@expo/vector-icons"; // Adicionado para os ícones

interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string;
  icon?: any; // Adicionado: agora ele aceita ícone!
}

export default function InputField({ label, error, icon, style, ...props }: InputFieldProps) {
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
      
      <View style={[
          styles.inputContainer, 
          { backgroundColor: theme.input, borderColor: error ? COLORS.red : theme.border }
        ]}>
        
        {icon && (
          <Ionicons name={icon} size={20} color={theme.subText} style={styles.icon} />
        )}

        <TextInput
          style={[
            styles.input,
            { color: theme.text },
            style,
          ]}
          placeholderTextColor={theme.subText}
          {...props}
        />
      </View>
      
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 15,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
  },
  error: {
    color: COLORS.red,
    fontSize: 10,
    marginTop: 4,
  },
});