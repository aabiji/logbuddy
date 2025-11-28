import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { useState } from "react";
import { newExercise, newWorkout, Exercise, Workout, newExerciseSet } from "@/lib/storage";

function ExerciseTile({ exercise, setExercise }:
  { exercise: Exercise, setExercise: (updated: Exercise) => void; }) {

  return (
    <View>
      <Text>{exercise.name}</Text>

      <View style={styles.row}>
        <Text>SET</Text>
        <Text>LBS</Text>
        <Text>REPS</Text>
      </View>

      <FlatList
        data={exercise.sets}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <Text>{index + 1}</Text>
            <TextInput
              value={`${item.reps}`}
              onChangeText={(value: string) => console.log(Number(value))}
            />
            <TextInput
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
  const [workout, setWorkout] = useState(newWorkout());
  const [modalShown, setModalShown] = useState(true);
  const [time, setTime] = useState("00 m : 00 s");

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
    </SafeAreaProvider >
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
});
