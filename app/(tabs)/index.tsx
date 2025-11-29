import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { useEffect, useState } from "react";

import { newWorkout, Workout } from "@/lib/types";
import { useDrizzleMigrations, getWorkouts } from "@/lib/database";
import WorkoutEditor from "@/app/workoutEditor";

export default function Index() {
  const error = useDrizzleMigrations();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [modalShown, setModalShown] = useState(false);
  const [page, setPage] = useState(0);

  const base = newWorkout();

  const fetchNextPage = async () => {
    const limit = 10;
    const result = await getWorkouts(page, limit);
    setWorkouts(prev => [...prev, ...result]);
    setPage(page + 1);
  }

  useEffect(() => {
    if (error) return;
    fetchNextPage();
  }, []);

  if (error) {
    return (
      <View>
        <Text>Migration error: {error.message}</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView>

        <Text>Workouts</Text>

        <WorkoutEditor
          baseWorkout={base}
          modalShown={modalShown}
          setModalShown={setModalShown}
        />

        <FlatList
          data={workouts}
          onEndReached={fetchNextPage}
          onEndReachedThreshold={0.8}
          renderItem={({ item, index }) => (
            <Text>
              {item.timestamp}
            </Text>
          )}
        />

      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  textButton: {
    padding: 10,
  },
  textButtonText: {
    color: "blue",
    textAlign: "center"
  },
  filledButton: {
    padding: 10,
    backgroundColor: "blue",
    borderRadius: 10
  },
  filledButtonText: {
    color: "white",
    textAlign: "center"
  },
});
