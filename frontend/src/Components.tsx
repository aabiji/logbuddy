import { useState } from "react";
import { useAppState } from "./lib/state";

import {
  IonCheckbox, IonButton, IonIcon, IonModal, IonToast,
  IonInput
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

export function TimeInput({ setDuration }: { setDuration: (n: number) => void; }) {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  return (
    <div className="time-input">
      <IonInput
        fill="outline" placeholder="0"
        type="number" label="h" min={0} max={24}
        labelPlacement="end" value={hours}
        onIonInput={(event) => {
          setHours(Number(event.detail.value));
          setDuration(hours * 60 + minutes + (seconds / 60));
        }}
      />
      <IonInput
        fill="outline" placeholder="0"
        type="number" label="m" min={0} max={59}
        labelPlacement="end" value={minutes}
        onIonInput={(event) => {
          setMinutes(Number(event.detail.value));
          setDuration(hours * 60 + minutes + (seconds / 60));
        }}
      />
      <IonInput
        fill="outline" placeholder="0"
        type="number" label="s" min={0} max={59}
        labelPlacement="end" value={seconds}
        onIonInput={(event) => {
          setSeconds(Number(event.detail.value));
          setDuration(hours * 60 + minutes + (seconds / 60));
        }}
      />
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
