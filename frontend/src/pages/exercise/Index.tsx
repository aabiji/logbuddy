import { useHistory } from "react-router";
import { useAppState } from "../../lib/state";

import {
  IonContent, IonPage, IonButton, IonList, IonIcon
} from "@ionic/react";
import { NotificationTray } from "../../Components";
import { add, pencil, barChart, arrowRedo, list } from "ionicons/icons";
import "../../theme/styles.css";

export default function ExercisePage() {
  const history = useHistory();
  const { workouts, templates } = useAppState();

  return (
    <IonPage>
      <IonContent>
        <NotificationTray />

        <div className="horizontal-strip">
          <h2>Workout time!</h2>

         <div>
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
        <hr />

        {templates.length == 0
          ? <p style={{ textAlign: "center" }}>No templates</p>
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
