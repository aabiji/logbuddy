import { useHistory } from "react-router";
import { useAppState } from "../../lib/state";

import {
  IonContent, IonPage, IonButton, IonList, IonText, IonIcon
} from "@ionic/react";
import { add, pencil } from "ionicons/icons";
import "../../theme/styles.css";

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
            fill="clear" color="primary"
            onClick={() => history.push("/exercise/progress")}>
            <b>Progress</b>
          </IonButton>

          <IonButton
            fill="clear" color="primary"
            onClick={() => history.push("/exercise/history")}>
            <b>Workouts</b>
          </IonButton>

          <IonButton
            fill="clear" color="primary"
            onClick={async () => history.push(`/exercise/template/-1`)}>
            <b>Template</b>
          </IonButton>
        </div>

        {templates.length == 0
          ? <IonText><p style={{ textAlign: "center" }}>No templates</p></IonText>
          : <IonList style={{ background: "transparent" }}>
            {templates.map((id: number, i: number) => (
              <div key={i} className="template-item">
                <h6>{workouts.get(id)!.name}</h6>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <IonButton
                    style={{ gap: "15px" }} color="tertiary"
                    onClick={async () => history.push(`/exercise/workout/${id}`)}>
                    <IonIcon aria-hidden="true" icon={add} color="light" />
                    Start
                  </IonButton>

                  <IonButton
                    color="success" style={{ gap: "15px" }}
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
