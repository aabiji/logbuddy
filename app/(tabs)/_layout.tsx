import { Tabs } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { colors } from "@/app/styles";

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          tabBarShowLabel: false,
          headerShown: false,
          tabBarIcon: ({ }) =>
            <MaterialCommunityIcons name="dumbbell" size={28} color={colors.primary} />
        }}
      />
    </Tabs>
  );
}
