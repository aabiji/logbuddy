import { request, useAuthRequest } from "./../lib/request";
import { dayUnixTimestamp, formatDate } from "./../lib/date";
import { useAppState } from "./../lib/state";

import {
  IonContent, IonPage, IonList, IonItem, IonItemSliding,
  IonIcon, IonItemOptions, IonItemOption, IonInput
} from "@ionic/react";

export default function SettingsPage() {
  const authRequest = useAuthRequest();

  // Use imperial units (default)
  // enable/disable period tracking (enabled by default)
  // delete account
  // change meals
  // change macro target (calories/protein)
  // send feedback
  // macro targets
  // auto regulate macro targets

  return (
    <IonPage>
      <IonContent>
        <h1>settings</h1>
      </IonContent>
    </IonPage>
  );
}
