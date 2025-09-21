import { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { request } from "../../lib/utils";
import { Workout, useAppState } from "../../lib/state";

import {
  IonContent, IonPage,
} from "@ionic/react";

import { Entry, Template } from "./Workout";

export default function ExercisesPage() {
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

  // TODO: extend this (same pattern) to all api requests
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

        <Template />

      </IonContent>
    </IonPage>
  );
};
