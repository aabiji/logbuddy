import { useEffect, useRef, useState } from "react";
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
  inputType?: "text" | "number";
  value: string | number;
  setValue: (val: string) => void;
  placeholder?: string;
  label?: string;
  labelPlacement?: string;
  min?: number;
  max?: number;
  textarea?: boolean;
  style?: object;
}

export function Input({
  inputType, min, max, value, setValue, placeholder, label,
  labelPlacement, textarea, style
}: InputProps) {
  const placement = labelPlacement ? "end" : labelPlacement;

  const ref = useRef(null);
  const autoResize = () => {
    if (textarea && ref.current) {
      const textarea = ref.current as HTMLTextAreaElement;
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  }
  useEffect(() => { autoResize() }, []);

  const setInput = (event: React.FormEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const str = event.target.value;
    let valid = true;

    if (inputType == "number") {
      if (min && Number(str) < min) valid = false;
      if (max && Number(str) > max) valid = false;
    }

    if (valid) setValue(str);
    if (textarea) autoResize();
  }

  return (
    <div className="custom-input">
      {label && placement == "start" && <p>{label}</p>}

      {textarea && <textarea style={style} ref={ref}
        placeholder={placeholder ?? ""} value={`${value}`}
        onInput={setInput} />}

      {!textarea && <input style={style}
        type={inputType ?? "text"} placeholder={placeholder ?? ""}
        min={min} max={max}
        value={`${value}`} onInput={setInput} />}

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
          const n = Number(value);
          setHours(n);
          setDuration(n * 60 + minutes + (seconds / 60));
        }}
      />
      <Input
        placeholder="0"
        inputType="number"
        label="m" min={0} max={59}
        labelPlacement="end" value={minutes}
        setValue={(value: string) => {
          const n = Number(value);
          setMinutes(n);
          setDuration(hours * 60 + n + (seconds / 60));
        }}
      />
      <Input
        placeholder="0"
        inputType="number" label="s" min={0} max={59}
        labelPlacement="end" value={seconds}
        setValue={(value: string) => {
          const n = Number(value);
          setSeconds(n);
          setDuration(hours * 60 + minutes + (n / 60));
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
