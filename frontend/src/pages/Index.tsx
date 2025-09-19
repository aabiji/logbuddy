import { useEffect } from "react";
import { useHistory } from "react-router";
import { request } from "../lib/utils";
import { useAppState } from "../lib/state";

import {
  IonCard, IonContent, IonList, IonCardHeader,
  IonPage, IonItem, IonLabel, IonCardTitle,
  IonCardSubtitle, IonCardContent, IonTextarea
} from '@ionic/react';

import "./Index.css";

function Workout() {
  const workout = {
    name: "Workout name",
    date: "September 15, 2025",
    exercises: [
      {
        name: "Exercise name",
        reps: [1, 2, 3, 4]
      },
      {
        name: "Another exercise name",
        reps: [2, 3, 4, 5]
      }
    ]
  }

  return (
    <IonCard color="light">
      <IonCardHeader>
        <IonCardTitle>{workout.name}</IonCardTitle>
        <IonCardSubtitle>{workout.date}</IonCardSubtitle>
      </IonCardHeader>

      <IonCardContent>
        <IonList>
          {workout.exercises.map((e, i) => (
            <IonItem key={i}>
              <IonLabel>{e.name}</IonLabel>
              <div className="flex-row">
                {e.reps.map((r, i) =>
                  <input key={i} className="small-input" placeholder="0" />
                )}
              </div>
            </IonItem>
          ))}
        </IonList>
        <IonItem>
          <IonTextarea label="Notes"
            labelPlacement="floating" placeholder="Workout notes" />
        </IonItem>
      </IonCardContent>
    </IonCard>
  );
}

export default function IndexPage() {
  const history = useHistory();
  const {
    lastSyncTime, mainToken, refreshToken,
    updateTokens, updateUserData
  } = useAppState();

  const update = async () => {
    const body = { startTime: lastSyncTime };
    const json = await request("POST", "/user/data", body, mainToken);
    updateUserData(json);
  }

  const sync = async () => {
    if (mainToken.length == 0 || refreshToken.length == 0)
      history.replace("/auth"); // first time opening app...

    try {
      await update();
    } catch (err: any) {
      if (err.statusCode !== 401) {
        console.log("ERROR!", err);
        return;
      }

      // main token expired; reissue another one
      try {
        const json = await request("POST", "/auth/issue", undefined, refreshToken);
        updateTokens(json.mainToken, refreshToken);
        await update();
      } catch (err: any) {
         history.replace("/auth"); // the refresh token must have expired
      }
    }
  }

  useEffect(() => { sync() }, []);

  return (
    <IonPage>
      <IonContent>

        <Workout />

      </IonContent>
    </IonPage>
  );
};
