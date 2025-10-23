import { useState } from "react";
import { useAppState } from "./lib/state";

import { IonCheckbox, IonButton, IonIcon, IonModal, IonToast } from "@ionic/react";
import { add } from "ionicons/icons";
import "./theme/styles.css";

export function Selection({ selections, setSelection }:
  { selections: string[], setSelection: (s: string) => void; }) {
  const [showModal, setShowModal] = useState(false);
  return (
    <div>
      <IonButton onClick={() => setShowModal(true)}>
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

interface InputProps {
  inputType?: string;
  value: string | number;
  setValue: (val: string) => void;
  placeholder?: string;
  label?: string;
  labelPlacement?: string;
  min?: number;
  max?: number;
  textarea?: boolean;
  style?: object;
};

export function Input({
  inputType, min, max, value, setValue, placeholder, label,
  labelPlacement, textarea, style
}: InputProps) {
  const placement = labelPlacement ? "end" : labelPlacement;
  const t = inputType ?? "text";
  return (
    <div className="custom-input">
      {label && placement == "start" && <p>{label}</p>}

      {textarea && <textarea style={style}
          placeholder={placeholder ?? ""} value={`${value}`}
          onInput={(event) => setValue(event.target.value)} />}

      {!textarea && <input style={style}
        type={t} placeholder={placeholder ?? ""} min={min} max={max}
        value={`${value}`} onInput={(event) => setValue(event.target.value)} />}

      {label && placement == "end" && <p>{label}</p>}
    </div>
  );
}

export function TimeInput({ setDuration }: { setDuration: (n: number) => void; }) {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  return (
    <div className="time-input">
      <Input
        placeholder="0"
        inputType="number" label="h"
        min={0} max={24}
        labelPlacement="end" value={hours}
        setValue={(value: string) => {
          setHours(Number(value));
          setDuration(hours * 60 + minutes + (seconds / 60));
        }}
      />
      <Input
        placeholder="0"
        inputType="number"
        label="m" min={0} max={59}
        labelPlacement="end" value={minutes}
        setValue={(value: string) => {
          setMinutes(Number(value));
          setDuration(hours * 60 + minutes + (seconds / 60));
        }}
      />
      <Input
        placeholder="0"
        inputType="number" label="s" min={0} max={59}
        labelPlacement="end" value={seconds}
        setValue={(value: string) => {
          setSeconds(Number(value));
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
