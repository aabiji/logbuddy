import { useMemo, useRef, useState } from "react";
import { request, useAuthRequest } from "./../lib/request";
import { dayUnixTimestamp, formatDate, isSameMonth, isSameWeek } from "./../lib/date";
import { useAppState } from "./../lib/state";

import {
  IonContent, IonPage, IonList, IonItem, IonItemSliding,
  IonIcon, IonItemOptions, IonItemOption, IonButton,
  IonModal, IonCheckbox, IonRadioGroup, IonRadio,
} from "@ionic/react";
import { LineGraph, Point } from "./exercise/Graph";
import { Input, NotificationTray } from "../Components";
import { add, pencil, trash } from "ionicons/icons";
import "../theme/styles.css";

export default function WeightPage() {
  const authRequest = useAuthRequest();
  const { removeWeight, setWeight, weightLog, settings } = useAppState();
  const [viewHorizon, setViewHorizon] = useState("thisMonth");
  const [groupWeekly, setGroupWeekly] = useState(false);
  const [showViewPicker, setShowViewPicker] = useState(false);

  // get the indexes of points whose dates mark a new month
  const getMonthStartIndexes = (points: Point[]): number[] => {
    const monthStarts = [0];
    for (let i = 1; i < points.length; i++) {
      if (!isSameMonth(points[i - 1].date, points[i].date))
        monthStarts.push(i);
    }
    return monthStarts;
  }

  const getWeeklyAverages = (points: Point[]): Point[] => {
    if (points.length == 0) return [];
    let week = [points[0]] as Point[];
    const weeklyAverages = [] as Point[];

    for (let i = 1; i < points.length; i++) {
      if (isSameWeek(points[i - 1].date, points[i].date)) {
        week.push(points[i]);
      } else {
        const total = week.reduce((sum, p) => sum + p.value, 0);
        weeklyAverages.push({
          date: week[0].date, value: Math.floor(total / week.length)
        });
        week = [points[i]];
      }
    }

    // don't forget the last week
    const total = week.reduce((sum, p) => sum + p.value, 0);
    weeklyAverages.push({
      date: week[0].date, value: Math.floor(total / week.length)
    });
    return weeklyAverages;
  }

  const sortedWeightLogs = useMemo(() => {
    const d = [...weightLog.entries()]; // [date, value]
    d.sort((a, b) => b[0] - a[0]);
    return d;
  }, [weightLog]);

  const plotData = useMemo(() => {
    const allData = [...weightLog.entries()]
      .map(v => ({ date: new Date(v[0]), value: v[1] }));
    allData.sort((a, b) => b.date.getTime() - a.date.getTime()); // newest to oldest

    if (allData.length == 0) return [];
    let data: Point[];
    const indexes = getMonthStartIndexes(allData);

    // change how many data points are shown depending on the selected view horizon
    if (viewHorizon == "thisMonth")
      data = allData.slice(0, indexes[1] || allData.length);
    else if (viewHorizon == "thisYear")
      data = allData.slice(0, indexes[12] || allData.length);
    else
      data = allData; // all time
    return groupWeekly && data.length > 0 ? getWeeklyAverages(data) : data;
  }, [weightLog, viewHorizon, groupWeekly]);

  const removeEntry = async (date: Date) => {
    const t = dayUnixTimestamp(date);
    const response = await authRequest((jwt: string) =>
      request("DELETE", `/weight/delete?date=${t}`, undefined, jwt));
    if (response !== undefined) removeWeight(t);
  }

  // map weight log dates to their update timeout values
  const timerRefs = useRef<Record<number, NodeJS.Timeout | null>>({});

  const editWeight = (date: Date, value: number, isNew: boolean) => { // debounced api call
    const t = dayUnixTimestamp(date);
    if (isNew && weightLog.get(t)) return; // can't have duplicate dates
    setWeight(t, value);

    if (timerRefs.current[t]) clearTimeout(timerRefs.current[t]);
    const newTimeout = setTimeout(async () => {
      const endpoint = `/weight/set?date=${t}&weight=${value}`;
      await authRequest((jwt: string) => request("POST", endpoint, undefined, jwt));
    }, 300);
    timerRefs.current = { ...timerRefs.current, [t]: newTimeout };
  }

  return (
    <IonPage>
      <IonContent>
        <NotificationTray />

        <div className="horizontal-strip">
          <h6>Weight graph</h6>

          <div className="horizontal-strip" style={{ width: "35%" }}>
            <IonButton
              onClick={() => editWeight(new Date(), 0, true)}>
              <IonIcon slot="icon-only" color="light" icon={add} />
            </IonButton>
            <IonButton
              onClick={() => setShowViewPicker(true)}>
              <IonIcon slot="icon-only" color="light" icon={pencil} />
            </IonButton>
            <IonModal
              className="centered-modal"
              onDidDismiss={() => setShowViewPicker(false)}
              initialBreakpoint={undefined}
              breakpoints={undefined}
              isOpen={showViewPicker}>
              <IonCheckbox
                labelPlacement="start"
                checked={groupWeekly}
                onIonChange={(event) => setGroupWeekly(event.detail.checked)}>
                Group weekly
                </IonCheckbox>
              <IonRadioGroup
                value={viewHorizon}
                onIonChange={(event) => setViewHorizon(event.detail.value)}>
                <IonRadio labelPlacement="start" value="thisMonth">This month</IonRadio>
                <IonRadio labelPlacement="start" value="thisYear">Last year</IonRadio>
                <IonRadio labelPlacement="start" value="allTime">All time</IonRadio>
              </IonRadioGroup>
            </IonModal>
          </div>
        </div>

        <LineGraph data={plotData} />
        <hr />

        {sortedWeightLogs.length == 0 &&
          <p style={{ textAlign: "center" }}>No weight logged</p>}
        {sortedWeightLogs.length > 0 &&
          <IonList>
            {sortedWeightLogs.map(v => (
              <IonItemSliding key={v[0]}>
                <IonItem className="weight-value">
                  <p slot="start" style={{ paddingLeft: 6 }}>{formatDate(new Date(v[0]))}</p>
                  <Input
                    min={0} max={500} value={v[1]}
                    inputType="number" placeholder="0"
                    label={settings.useImperial ? "lbs" : "kg"} labelPlacement="end"
                    setValue={(value: string) =>
                      editWeight(new Date(v[0]), Number(value), false)}
                  />
                </IonItem>

                <IonItemOptions>
                  <IonItemOption
                    color="danger"
                    onClick={() => removeEntry(new Date(v[0]))}>
                    <IonIcon aria-hidden="true" icon={trash} />
                  </IonItemOption>
                </IonItemOptions>
              </IonItemSliding>
            ))}
          </IonList>
        }
      </IonContent>
    </IonPage>
  );
}
