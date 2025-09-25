import { useHistory } from "react-router";

import {
  IonContent, IonPage, IonButton,
} from "@ionic/react";

export default function WorkoutsPage() {
  const history = useHistory();

  return (
    <IonPage>
      <IonContent>

      <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
        <IonButton fill="clear" onClick={() => history.push("/exercise/progress")}>
          <p>View progress</p>
        </IonButton>

        <IonButton fill="clear" onClick={() => history.push("/exercise/templates")}>
          <p>Edit templates</p>
        </IonButton>
      </div>

      </IonContent>
    </IonPage>
  );
};
