import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Pressable, ScrollView, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Reanimated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";

import { colors, theme } from "@/ui/styles";

interface ButtonProps {
  onPress: () => void;
  label?: string;
  icon?: string;
  fill?: boolean;
  style?: object | object[];
  bgColor?: string;
  iconColor?: string;
};

export function Button({
  onPress, label, icon, iconColor, style, bgColor
}: ButtonProps) {
  const colorValues: Record<string, string> = {
    "primary": colors.primary,
    "secondary": colors.secondary,
    "error": colors.error,
    "clear": colors.grey[200],
  };
  const customStyles = style ? typeof style === "object" ? [style] : style : [];

  return (
    <Pressable
      style={[
        theme.button,
        { backgroundColor: colorValues[bgColor ?? "primary"] },
        ...customStyles
      ]}
      onPress={() => onPress()}
    >
      {icon && (
        <MaterialCommunityIcons
          name={icon} size={20}
          color={colorValues[iconColor ?? "primary"]}
        />
      )}

      {label && (
        <Text
          style={[
            theme.buttonLabel,
            { color: bgColor == "clear" ? colors.onSurface : colors.onPrimary }
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

interface SlideableProps {
  children: React.ReactNode;
  slideActions: React.ReactNode;
}

export function Slideable({ children, slideActions }: SlideableProps) {
  const slideActionWidth = 80;

  const rightComponent = (_: SharedValue<number>, drag: SharedValue<number>) => {
    const styleAnimation = useAnimatedStyle(() => ({
      transform: [{ translateX: drag.value + slideActionWidth }]
    }));

    return (
      <Reanimated.View style={[
        {
          width: slideActionWidth,
          height: "100%",
          justifyContent: "center"
        },
        styleAnimation
      ]}>
        <View style={{ flex: 1 }}>
          {slideActions}
        </View>
      </Reanimated.View>
    );
  };

  return (
    <GestureHandlerRootView>
      <ReanimatedSwipeable
        friction={2}
        enableTrackpadTwoFingerGesture={true}
        rightThreshold={40}
        renderRightActions={rightComponent}
      >
        {children}
      </ReanimatedSwipeable>
    </GestureHandlerRootView>
  );
}