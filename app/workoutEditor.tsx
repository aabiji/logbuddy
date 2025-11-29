import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { useEffect, useRef, useState } from "react";

import { Exercise, Workout, newExercise, newExerciseSet } from "@/lib/types";
import { insertWorkout } from "@/lib/database";

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
              onChangeText={(value: string) => {
                const existing = exercise.sets[index];
                setExercise(({
                  ...exercise,
                  sets: [
                    ...exercise.sets.slice(0, index),
                    { ...existing, reps: Number(value) },
                    ...exercise.sets.slice(index + 1)
                  ]
                }));
              }}
            />
            <TextInput
              style={styles.rowColumn}
              value={`${item.weight}`}
              onChangeText={(value: string) => {
                const existing = exercise.sets[index];
                setExercise(({
                  ...exercise,
                  sets: [
                    ...exercise.sets.slice(0, index),
                    { ...existing, weight: Number(value) },
                    ...exercise.sets.slice(index + 1)
                  ]
                }));
              }}
            />
          </View>
        )}
      />

      <Pressable
        style={styles.filledButton}
        onPress={() => {
          setExercise(({
            ...exercise,
            sets: [...exercise.sets, newExerciseSet(exercise.id)]
          }))
        }}>
        <Text style={styles.filledButtonText}>Add set</Text>
      </Pressable>
    </View>
  );
}

interface WorkoutEditorProps {
  baseWorkout: Workout;
  modalShown: boolean;
  setModalShown: (show: boolean) => void;
}

export default function WorkoutEditor(
  { baseWorkout, modalShown, setModalShown }: WorkoutEditorProps) {
  const [workout, setWorkout] = useState(baseWorkout);
  const [time, setTime] = useState("00 m : 00 s");

  const intervalRef = useRef<null | number>(null);
  let startTime = 0;

  useEffect(() => {
    startTime = new Date().getTime();

    intervalRef.current = setInterval(() => {
      const elapsed = (new Date().getTime() - startTime) / 1000; // in seconds
      const hours = Math.floor(elapsed / 3600);
      const minutes = Math.floor((elapsed - (hours * 3600)) / 60);
      const seconds = Math.floor(elapsed - (hours * 3600) - (minutes * 60));

      const fmt = (n: number) => n.toFixed(0).padStart(2, '0');
      setTime(hours == 0
        ? `${fmt(minutes)} m : ${fmt(seconds)} s`
        : `${fmt(hours)} h : ${fmt(minutes)} m : ${fmt(seconds)} s`);
    }, 1000);

    return () => {
      if (intervalRef.current)
        clearInterval(intervalRef.current);
    }
  }, []);

  return (
    <Modal
      animationType="slide"
      visible={modalShown}
      onRequestClose={() => setModalShown(false)}>

      <View style={styles.row}>
        <Pressable
          onPress={() => setModalShown(false)}
          style={styles.textButton}>
          <Text style={styles.textButtonText}>Cancel</Text>
        </Pressable>

        <Text>{time}</Text>

        <Pressable
          onPress={() => {
            insertWorkout(workout);
            setModalShown(false);
          }}
          style={styles.filledButton}>
          <Text style={styles.filledButtonText}>Finish</Text>
        </Pressable>
      </View>

      <FlatList
        style={{ flexGrow: 0 }}
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
            exercises: [...prev.exercises, newExercise(workout.id, "Bench press")]
          }))
        }}>
        <Text style={styles.filledButtonText}>Add exercise</Text>
      </Pressable>
    </Modal>
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
