import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/consts/colors";

interface ListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  leftIconColor?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
}

export default function ListItem({
  title,
  subtitle,
  leftIcon,
  leftIconColor = COLORS.primary,
  rightElement,
  onPress,
}: ListItemProps) {
  const [isDark] = React.useState(true);

  const theme = {
    bg: isDark ? COLORS.dark.card : COLORS.light.card,
    text: isDark ? COLORS.dark.text : COLORS.light.text,
    subText: isDark ? COLORS.dark.subText : COLORS.light.subText,
    border: isDark ? COLORS.dark.border : COLORS.light.border,
  };

  const content = (
    <View style={[styles.container, { backgroundColor: theme.bg, borderColor: theme.border }]}>
      {leftIcon && (
        <View style={[styles.iconBox, { backgroundColor: `${leftIconColor}15` }]}>
          <Ionicons name={leftIcon} size={24} color={leftIconColor} />
        </View>
      )}
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, { color: theme.subText }]}>{subtitle}</Text>}
      </View>
      {rightElement || (
        <Ionicons name="chevron-forward" size={20} color={theme.subText} />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    marginLeft: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});