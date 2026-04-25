import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/consts/colors";
import ArrowBack from "./ArrowVoltar";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
}

export default function ScreenHeader({ title, subtitle, showBack = true, rightElement }: ScreenHeaderProps) {
  const [isDark] = React.useState(true);

  const theme = {
    text: isDark ? COLORS.dark.text : COLORS.light.text,
    subText: isDark ? COLORS.dark.subText : COLORS.light.subText,
  };

  return (
    <View style={styles.container}>
      {showBack && <ArrowBack cor={theme.text} />}
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, { color: theme.subText }]}>{subtitle}</Text>}
      </View>
      {rightElement && <View style={styles.right}>{rightElement}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 15,
  },
  content: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  right: {
    marginLeft: 10,
  },
});