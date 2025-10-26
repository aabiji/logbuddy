import { useHistory } from "react-router";
import { useAppState } from "../../lib/state";

import {
  IonContent, IonPage, IonButton, IonIcon
} from "@ionic/react";
import { NotificationTray } from "../../Components";
import { add, barChart, list } from "ionicons/icons";
import "../../theme/styles.css";

export default function ExercisePage() {
  const history = useHistory();
  const { workouts, templates } = useAppState();

  return (
    <IonPage>
      <IonContent>
        <NotificationTray />

        <div className="horizontal-strip">
          <h4>Your workouts</h4>

         <div className="horizontal-strip">
          <IonButton
            fill="clear" color="primary"
            onClick={() => history.push("/exercise/progress")}>
            <IonIcon slot="icon-only" color="white" icon={barChart} />
          </IonButton>

          <IonButton
            fill="clear" color="primary"
            onClick={() => history.push("/exercise/history")}>
            <IonIcon slot="icon-only" color="white" icon={list} />
          </IonButton>

          <IonButton
            fill="clear" color="primary"
            onClick={async () => history.push(`/exercise/template/-1`)}>
            <IonIcon slot="icon-only" color="white" icon={add} />
          </IonButton>
         </div>
        </div>

        {templates.length == 0
          ? <p style={{ textAlign: "center" }}>No templates</p>
          : <div>
            {templates.map((id: number, i: number) => (
              <div key={i} className="template-item">
                <h6>{workouts.get(id)!.name}</h6>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <IonButton
                    style={{ gap: "15px" }} color="tertiary"
                    onClick={async () => history.push(`/exercise/workout/${id}`)}>
                    Start
                  </IonButton>

                  <IonButton
                    color="success" style={{ gap: "15px" }}
                    onClick={() => history.push(`/exercise/template/${id}`)}>
                    Edit
                  </IonButton>
                </div>
              </div>
            ))}
          </div>
        }
      </IonContent>
    </IonPage>
  );
};
