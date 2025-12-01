import { Modal, ScrollView, Text, TextInput, View } from "react-native";
import { useEffect, useRef, useState } from "react";

import { Exercise, Workout, newExercise, newExerciseSet, newWorkout } from "@/lib/types";
import { insertWorkout } from "@/lib/database";
import { Button } from "@/app/components";
import theme from "@/app/styles";

function ExerciseTile({ exercise, setExercise }:
  { exercise: Exercise, setExercise: (updated: Exercise) => void; }) {
  return (
    <View style={[theme.bottomSpacer, theme.topSpacer]}>
      <View style={theme.row}>
        <Text style={theme.h4}>{exercise.name}</Text>
        <Button
          onPress={() => { console.log("remove...") }}
          icon="trash-can"
          color="error"
        >
        </Button>
      </View>

      <View style={[theme.row]}>
        <Text style={[theme.rowColumn, theme.dimmedHeader]}>SET</Text>
        <Text style={[theme.rowColumn, theme.dimmedHeader]}>LBS</Text>
        <Text style={[theme.rowColumn, theme.dimmedHeader]}>REPS</Text>
      </View>

      {
        exercise.sets.map((item, index) => (
          <View
            key={item.id}
            style={[
              theme.row,
              theme.bottomSpacer,
              index % 2 != 0 ? theme.gridRow : {}
            ]}>
            <Text style={theme.rowColumn}>{index + 1}</Text>
            <TextInput
              style={[theme.rowColumn, theme.input]}
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
              style={[theme.rowColumn, theme.input]}
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
        ))
      }

      <Button
        fill={false}
        style={theme.centeredButton}
        onPress={() => {
          setExercise(({
            ...exercise,
            sets: [...exercise.sets, newExerciseSet(exercise.id)]
          }))
        }}
        label="Add set"
      />
    </View >
  );
}

interface WorkoutEditorProps {
  baseWorkout: undefined | Workout;
  setModalShown: (show: boolean) => void;
}

export default function WorkoutEditor(
  { baseWorkout, setModalShown }: WorkoutEditorProps) {
  const [workout, setWorkout] = useState(baseWorkout ?? newWorkout());
  const [time, setTime] = useState("00 m : 00 s");
  const [errorMessage, setErrorMessage] = useState("");

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
      visible={true}
      onRequestClose={() => setModalShown(false)}>
      <View style={[theme.row, theme.bottomSpacer]}>
        <Button
          fill={false}
          label="Cancel"
          onPress={() => setModalShown(false)}
        />
        <Text style={theme.h3}>{time}</Text>
        <Button
          label="Finish"
          color="secondary"
          fill={true}
          onPress={() => {
            if (workout.exercises.length == 0) {
              setErrorMessage("You must create exercises");
              return;
            }
            insertWorkout(workout);
            setModalShown(false);
            setErrorMessage("");
          }}
        />
      </View>
      {errorMessage.length > 0 &&
        <Text style={theme.errorMessage}>{errorMessage}</Text>}

      <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
        {workout.exercises.map((item, index) => (
          <ExerciseTile
            key={item.id}
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
        ))}
        <Button
          fill={true}
          label="Add exercise"
          style={theme.centeredButton}
          color="primary"
          onPress={() => {
            setWorkout((prev: Workout) => ({
              ...prev,
              exercises:
                [
                  ...prev.exercises,
                  newExercise(workout.id, "Bench press")
                ]
            }))
          }}
        />
      </ScrollView>
    </Modal>
  );
}
