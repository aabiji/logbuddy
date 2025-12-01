import { Text, View } from "react-native";
import { useEffect, useState } from "react";

import { newWorkout, Workout } from "@/lib/types";
import { useDrizzleMigrations, getWorkouts } from "@/lib/database";
import theme from "@/app/styles";
import { Button, Page } from "@/app/components";
import WorkoutEditor from "@/app/workoutEditor";

const formatDate = (timestamp: number): string => {
  const formatter = new Intl.DateTimeFormat(navigator.language, {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
  return formatter.format(timestamp);
}

export default function Index() {
  const error = useDrizzleMigrations();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [modalShown, setModalShown] = useState(false);
  const [baseWorkout, setBaseWorkout] = useState<undefined | Workout>(undefined);
  const [page, setPage] = useState(0);

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
    <Page>
      <Text style={[theme.h1, theme.bottomSpacer]}>
        Workouts
      </Text>

      {workouts.length == 0 && (
        <View>
          <Button
            fill={true}
            label="Create your first workout"
            style={theme.centeredButton}
            onPress={() => {
              setBaseWorkout(newWorkout());
              setModalShown(true);
            }}
          />
        </View>
      )}

      {modalShown &&
        <WorkoutEditor
          baseWorkout={baseWorkout}
          setModalShown={setModalShown}
        />}

      {workouts.map((item) => (
        <View key={item.id}>
          <Text style={theme.h3}>{formatDate(item.timestamp)}</Text>

          <View>
            {item.exercises.map((exercise) => {
              // group reps by the weight they're performed at
              const setReps: Record<number, number[]> = {};
              for (const set of exercise.sets) {
                if (set.weight in setReps)
                  setReps[set.weight].push(set.reps);
                else
                  setReps[set.weight] = [set.reps];
              }
              const weights = Object.keys(setReps).map(k => Number(k)).sort();
              return (
                <View>
                  <Text>{exercise.name}</Text>
                  {weights.map(w =>
                    <Text>@ {w} lbs: {setReps[w].join(", ")}</Text>)}
                </View>
              );
            })}
          </View>

          <Button
            label="Start"
            onPress={() => {
              const copy = JSON.parse(JSON.stringify(item));
              setBaseWorkout(copy);
              setModalShown(true);
            }}
          />
        </View>
      ))}
    </Page>
  );
}
