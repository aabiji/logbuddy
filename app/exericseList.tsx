import { View } from "react-native";
import Body, { ExtendedBodyPart } from "react-native-body-highlighter";
import { useState } from "react";

export default function ExerciseList() {
  const [selectedBodyPart, setSelectedBodyPart] = useState<ExtendedBodyPart>({});

  const [gender, side] = ["male", "back"];
  const data: ExtendedBodyPart[] = [{ slug: "lower-back", intensity: 1 }];

  return (
    <View>
      <Body
        data={[...data, selectedBodyPart]}
        onBodyPartPress={(event, side) => {
          console.log(event.slug);
          setSelectedBodyPart({ slug: event.slug, intensity: 2, side });
        }}
        gender={gender as "male" | "female"}
        side={side as "front" | "back"}
        scale={2}
      />
    </View>
  );
}