import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { colors } from "../theme/colors";
import { RootStackParamList } from "./types";
import { SearchScreen } from "../screens/SearchScreen";
import { SeriesScreen } from "../screens/SeriesScreen";
import { ReaderScreen } from "../screens/ReaderScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Search"
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { color: colors.textPrimary },
        contentStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="Search" component={SearchScreen} options={{ title: "Manga Reader" }} />
      <Stack.Screen name="Series" component={SeriesScreen} options={{ title: "" }} />
      <Stack.Screen
        name="Reader"
        component={ReaderScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
