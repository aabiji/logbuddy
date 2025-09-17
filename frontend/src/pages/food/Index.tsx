import { useState } from "react";
import { useHistory } from "react-router-dom";

import { formatDate } from "../../lib/utils";

import {
  IonContent, IonPage, IonIcon, IonFabButton, IonFab, IonButton,
} from "@ionic/react";
import { add, chevronForward, chevronBack } from "ionicons/icons";

import "./Index.css";

export default function FoodPage() {
  const history = useHistory();

  const [date, setDate] = useState(new Date());

  const changeDate = (delta: number) => {
    const copy = new Date(date);
    copy.setDate(date.getDate() + delta);
    setDate(copy);
  };

  return (
    <IonPage>
      <IonContent>
        <div className="top-bar">
          <IonButton size="default" fill="clear" onClick={() => changeDate(-1)}>
            <IonIcon slot="icon-only" color="white" icon={chevronBack} />
          </IonButton>

          <h3>{formatDate(date)}</h3>

          <IonButton size="default" fill="clear" onClick={() => changeDate(1)}>
            <IonIcon slot="icon-only" color="white" icon={chevronForward} />
          </IonButton>
        </div>

        <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton onClick={() => history.push("/food/search")}>
            <IonIcon icon={add}></IonIcon>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
}