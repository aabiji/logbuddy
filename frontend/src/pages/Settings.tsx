import { request, useAuthRequest } from "./../lib/request";
import { dayUnixTimestamp, formatDate } from "./../lib/date";
import { useAppState } from "./../lib/state";

import {
  IonContent, IonPage, IonList, IonItem, IonItemSliding,
  IonIcon, IonItemOptions, IonItemOption, IonInput
} from "@ionic/react";

export default function SettingsPage() {
  const authRequest = useAuthRequest();

  return (
    <IonPage>
      <IonContent>
        <h1>settings</h1>
      </IonContent>
    </IonPage>
  );
}
