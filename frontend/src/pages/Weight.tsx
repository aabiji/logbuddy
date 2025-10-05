import { useMemo, useRef } from "react";
import { request, useAuthRequest } from "./../lib/request";
import { dayUnixTimestamp, formatDate } from "./../lib/date";
import { useAppState } from "./../lib/state";

import {
  IonContent, IonPage, IonList, IonItem, IonItemSliding,
  IonIcon, IonItemOptions, IonItemOption, IonInput
} from "@ionic/react";
import { LineGraph } from "./exercise/Graph";
import ErrorTray from "../ErrorTray";
import { trash } from "ionicons/icons";

export default function WeightPage() {
  const authRequest = useAuthRequest();
  const { removeWeight, setWeight, weightLog } = useAppState();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const plotData = useMemo(() => {
    const d = [...weightLog.entries()].map(v => ({ date: new Date(v[0]), value: v[1] }));
    d.sort((a, b) => b.date.getTime() - a.date.getTime());
    return d;
  }, [weightLog]);

  const removeEntry = async (date: Date) => {
    const t = dayUnixTimestamp(date);
    const endpoint = `/weight/delete?date=${t}`;
    const response = await authRequest((jwt: string) => request("DELETE", endpoint, undefined, jwt));
    if (response !== undefined) removeWeight(t);
  }

  const editWeight = (value: number) => { // debounced api call
    setWeight(dayUnixTimestamp(new Date()), value);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const t = dayUnixTimestamp(new Date());
      const endpoint = `/weight/set?date=${t}&weight=${value}`;
      await authRequest((jwt: string) => request("POST", endpoint, undefined, jwt));
    }, 300);
  }

  return (
    <IonPage>
      <IonContent>
        <ErrorTray />

        <div style={{
          top: 0, zIndex: 10,
          position: "sticky",
          backgroundColor: "var(--ion-background-color)"
        }}>
          <LineGraph data={plotData} />
          <IonItem>
            <IonInput
              slot="start"
              min={0} max={500}
              type="number" placeholder="0"
              label="lbs" labelPlacement="end"
              value={weightLog.get(dayUnixTimestamp(new Date)) ?? 0}
              onIonInput={(event) => editWeight(Number(event.detail.value))}
            />
            <b slot="end">{formatDate(new Date())}</b>
          </IonItem>
        </div>

        <IonList>
          {plotData.slice(1).map((v, i) => (
            <IonItemSliding key={i}>
              <IonItem>
                <b slot="start">{v.value} lbs</b>
                <p slot="end">{formatDate(v.date)}</p>
              </IonItem>

              <IonItemOptions>
                <IonItemOption
                  color="danger"
                  onClick={() => removeEntry(v.date)}>
                  <IonIcon aria-hidden="true" icon={trash} />
                </IonItemOption>
              </IonItemOptions>
            </IonItemSliding>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
}
