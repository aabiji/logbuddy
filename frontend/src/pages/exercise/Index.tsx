import { useHistory } from "react-router";
import { useAppState } from "../../lib/state";

import {
  IonContent, IonPage, IonButton, IonList, IonText, IonIcon
} from "@ionic/react";
import { add, pencil } from "ionicons/icons";
import "../theme/styles.css";

export default function ExercisePage() {
  const history = useHistory();
  const { workouts, templates } = useAppState();

  return (
    <IonPage>
      <IonContent>
        <div
          style={{
            display: "flex", flexDirection: "row",
            justifyContent: "space-between"
           }}>
          <IonButton
            fill="clear"
            onClick={() => history.push("/exercise/progress")}>
            <p>Progress</p>
          </IonButton>

          <IonButton
            fill="clear"
            onClick={() => history.push("/exercise/history")}>
            <p>Workouts</p>
          </IonButton>

          <IonButton
            fill="clear"
            onClick={async () => history.push(`/exercise/template/-1`)}>
            <p>New template</p>
          </IonButton>
        </div>

        {templates.length == 0
          ? <IonText><p>No templates</p></IonText>
          : <IonList style={{ background: "transparent" }}>
            {templates.map((id: number, i: number) => (
              <div key={i} style={{
                display: "flex", backgroundColor: "var(--ion-color-dark)",
                alignItems: "center", justifyContent: "space-between",
                width: "95%", margin: "auto", padding: 10, marginBottom: 10
              }}>
                <h4>{workouts.get(id)!.name}</h4>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <IonButton
                    color="primary"
                    onClick={async () => history.push(`/exercise/workout/${id}`)}>
                    <IonIcon aria-hidden="true" icon={add} color="light" />
                    Start
                  </IonButton>

                  <IonButton
                    color="success"
                    onClick={() => history.push(`/exercise/template/${id}`)}>
                    <IonIcon aria-hidden="true" icon={pencil} color="light" />
                    Edit
                  </IonButton>
                </div>
              </div>
            ))}
          </IonList>
        }
      </IonContent>
    </IonPage>
  );
};
