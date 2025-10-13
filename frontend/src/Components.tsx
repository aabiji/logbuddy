import { useState } from "react";
import { useAppState } from "./lib/state";

import {
  IonCheckbox, IonButton, IonIcon, IonModal, IonToast
} from "@ionic/react";
import { add } from "ionicons/icons";
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

export function NotificationTray() {
  const { notifications, removeNotification } = useAppState();
  return (
    <div>
      {notifications.map((n, i) => (
        <IonToast
          key={i}
          isOpen={true}
          duration={5000}
          message={n.message}
          onDidDismiss={() => removeNotification(i)}
          className={n.error ? "error-toast" : "info-toast"}
        />
      ))}
    </div>
  );
}
