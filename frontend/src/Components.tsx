import { useState } from "react";
import { useAppState } from "./lib/state";

import {
  IonCheckbox, IonButton, IonIcon, IonModal
} from "@ionic/react";
import { add, close } from "ionicons/icons";
import "./theme/styles.css";

export function Selection({ selections, setSelection }:
  { selections: string[], setSelection: (s: string) => void; }) {
  const [showModal, setShowModal] = useState(false);
  return (
    <div>
      <IonButton className="icon-btn-square" onClick={() => setShowModal(true)}>
        <IonIcon slot="icon-only" color="white" icon={add} />
      </IonButton>
      <IonModal
        className="centered-modal"
        onDidDismiss={() => setShowModal(false)}
        initialBreakpoint={undefined}
        breakpoints={undefined}
        isOpen={showModal}>
        <div className="selection-container">
          {selections.map((option, i) => (
            <IonCheckbox key={i}
              className="selection-option"
              labelPlacement="end"
              checked={false}
              onIonChange={() => {
                setSelection(option);
                setShowModal(false);
              }}>
              {option[0].toUpperCase() + option.slice(1)}
            </IonCheckbox>
          ))}
        </div>
      </IonModal>
    </div>
  );
}

export function ErrorTray() {
  const { errors, removeError } = useAppState();
  return (
    <div style={{ display: "absolute", bottom: 0, left: 0 }}>
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
