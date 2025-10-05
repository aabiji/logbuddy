import { useAppState } from "./lib/state";

import { IonButton, IonIcon, } from "@ionic/react";
import { close } from "ionicons/icons";

export default function ErrorTray() {
  const { errors, removeError } = useAppState();
  return (
    <div>
      {errors.map((e, i) => (
        <div key={i}>
          <p>{e}</p>
          <IonButton fill="clear" onClick={() => removeError(i)}>
            <IonIcon slot="icon-only" icon={close} />
          </IonButton>
        </div>
      ))}
    </div>
  );
}