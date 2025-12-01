import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Pressable, ScrollView, Text } from "react-native";

import { colors, theme } from "@/app/styles";

interface ButtonProps {
  onPress: () => void;
  label?: string;
  icon?: string;
  fill?: boolean;
  style?: object | object[];
  color?: string;
};

export function Button({
  onPress, label, icon, fill, style, color
}: ButtonProps) {
  const colorValues: Record<string, string> = {
    "primary": colors.primary,
    "secondary": colors.secondary,
    "error": colors.error,
    "clear": colors.grey[200],
  };
  const bgColor = colorValues[fill ? color ?? "primary" : "clear"];
  const iconColor = colorValues[color ?? "primary"];
  const customStyles = style ? typeof style === "object" ? [style] : style : [];

  return (
    <Pressable
      style={[
        theme.button,
        { backgroundColor: bgColor },
        ...customStyles
      ]}
      onPress={() => onPress()}
    >
      {icon && (
        <MaterialCommunityIcons name={icon} color={iconColor} size={20} />
      )}

      {label && (
        <Text
          style={[
            theme.buttonLabel,
            { color: fill ? colors.onPrimary : colors.onSurface }
          ]}>
          {label}
        </Text>
      )}
    </Pressable>
  )
}

export function Page({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={theme.container}>
        <ScrollView>
          {children}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}