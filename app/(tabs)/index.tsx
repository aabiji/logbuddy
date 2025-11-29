import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { useEffect, useState } from "react";

import * as SQLite from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";

import { newExercise, newWorkout, Exercise, Workout, newExerciseSet } from "@/lib/types";
import migrations from "@/drizzle/migrations";

const expo = SQLite.openDatabaseSync("logbuddy.db");
const db = drizzle(expo);

function ExerciseTile({ exercise, setExercise }:
  { exercise: Exercise, setExercise: (updated: Exercise) => void; }) {
  return (
    <View>
      <Text>{exercise.name}</Text>

      <View style={styles.row}>
        <Text style={styles.rowColumn}>SET</Text>
        <Text style={styles.rowColumn}>LBS</Text>
        <Text style={styles.rowColumn}>REPS</Text>
      </View>

      <FlatList
        data={exercise.sets}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <Text style={styles.rowColumn}>{index + 1}</Text>
            <TextInput
              style={styles.rowColumn}
              value={`${item.reps}`}
              onChangeText={(value: string) => console.log(Number(value))}
            />
            <TextInput
              style={styles.rowColumn}
              value={`${item.weight}`}
              onChangeText={(value: string) => console.log(Number(value))}
            />
          </View>
        )}
      />

      <Pressable
        style={styles.filledButton}
        onPress={() => {
          setExercise(({
            ...exercise,
            sets: [...exercise.sets, newExerciseSet(exercise)]
          }))
        }}>
        <Text style={styles.filledButtonText}>Add set</Text>
      </Pressable>
    </View>
  );
}

export default function Index() {
  const { success, error } = useMigrations(db, migrations);

  const [workout, setWorkout] = useState(newWorkout());
  const [modalShown, setModalShown] = useState(true);
  const [time, setTime] = useState("00 m : 00 s");

  let interval;
  let startTime = 0;

  useEffect(() => {
    if (!success) return;

    startTime = new Date().getTime();

    interval = setInterval(() => {
      const elapsed = (new Date().getTime() - startTime) / 1000; // in seconds
      const hours = Math.floor(elapsed / 3600);
      const minutes = Math.floor((elapsed - (hours * 3600)) / 60);
      const seconds = Math.floor(elapsed - (hours * 3600) - (minutes * 60));

      const fmt = (n: number) => n.toFixed(0).padStart(2, '0');
      setTime(hours == 0
        ? `${fmt(minutes)} m : ${fmt(seconds)} s`
        : `${fmt(hours)} h : ${fmt(minutes)} m : ${fmt(seconds)} s`);
    }, 1000);
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

        <Modal
          animationType="slide"
          visible={modalShown}
          onRequestClose={() => {
            setModalShown(false);
            console.log("closing modal!");
          }}>

          <View style={styles.row}>
            <Pressable
              onPress={() => setModalShown(false)}
              style={styles.textButton}>
              <Text style={styles.textButtonText}>Cancel</Text>
            </Pressable>

            <Text>{time}</Text>

            <Pressable
              onPress={() => setModalShown(false)}
              style={styles.filledButton}>
              <Text style={styles.filledButtonText}>Finish</Text>
            </Pressable>
          </View>

          <FlatList
            data={workout.exercises}
            renderItem={({ index }) =>
              <ExerciseTile
                exercise={workout.exercises[index]}
                setExercise={(updated: Exercise) =>
                  setWorkout((prev: Workout) => ({
                    ...prev,
                    exercises: [
                      ...prev.exercises.slice(0, index),
                      updated,
                      ...prev.exercises.slice(index + 1)
                    ]
                  })
                )}
              />
            }
          />

          <Pressable
            style={styles.filledButton}
            onPress={() => {
              setWorkout((prev: Workout) => ({
                ...prev,
                exercises: [...prev.exercises, newExercise(workout.id)]
              }))
            }}>
            <Text style={styles.filledButtonText}>Add exercise</Text>
          </Pressable>
        </Modal>

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
  row: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  rowColumn: {
    width: "33%",
    textAlign: "center"
  },
});
