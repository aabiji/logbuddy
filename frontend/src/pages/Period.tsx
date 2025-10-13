import { useEffect, useState } from "react";
import { request, useAuthRequest } from "./../lib/request";
import { dayUnixTimestamp, elapsedDays, formatDate } from "./../lib/date";
import { useAppState } from "./../lib/state";

import {
  IonContent, IonPage, IonButton, IonIcon, IonLabel,
} from "@ionic/react";
import { NotificationTray } from "../Components";
import { chevronForward, chevronBack } from "ionicons/icons";
import "../theme/styles.css";

function groupIntoPeriods(sortedTimestamps: number[]) {
  if (sortedTimestamps.length === 0) return [];

  let periods = [[sortedTimestamps[0]]];
  for (let i = 1; i < sortedTimestamps.length; i++) {
    const diff = elapsedDays(sortedTimestamps[i], sortedTimestamps[i - 1]);
    if (diff > 1) {
      // If more than 1 day gap, start a new period
      periods.push([sortedTimestamps[i]]);
    } else {
      periods[periods.length - 1].push(sortedTimestamps[i]);
    }
  }
  return periods;
}

// get the average cycle length and the average length of a period
function calculateLengthStats(periods: number[][]) {
  let cycleLengths = [];
  let periodLengths = [];

  for (let i = 0; i < periods.length - 1; i++) {
    // the number of days between the first day of each menstrual cycle
    cycleLengths.push(elapsedDays(periods[i + 1][0], periods[i][0]));

    // number of days between the start of the period and the end of it
    periodLengths.push(periods[i].length);
  }

  return [
    Math.floor(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length),
    Math.floor(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length)
  ];
}

// get the current phase in the user's menstruation cycle
function getCurrentPhase(dayInCycle: number, cycleLength: number, periodLength: number) {
  const ovulationDay = cycleLength - 14; // the luteal phase is 14 days for most females
  const fertileWindowStart = ovulationDay - 5; // sperm can survive ~5 days
  const fertileWindowEnd = ovulationDay + 1;

  if (dayInCycle <= periodLength)
    return "Period";
  else if (dayInCycle >= fertileWindowStart && dayInCycle <= fertileWindowEnd)
    return "High fertility";
  else if (dayInCycle > cycleLength - 5)
    return "Expecting period soon";
  return "Low fertility";
}

export default function PeriodPage() {
  const authRequest = useAuthRequest();
  const { periodDates, togglePeriodDate } = useAppState();

  const [date, setDate] = useState(new Date());
  const [canMakePrediction, setCanMakePrediction] = useState(false);
  const [phaseMessage, setPhaseMessage] = useState("");
  const [nextPeriodDate, setNextPeriodDate] = useState("");
  const [averageCycleMessage, setAverageCycleMessage] = useState("");

  useEffect(() => {
    const sortedDates = [...periodDates.keys()].sort((a, b) => a - b); // oldest to latest
    const periods = groupIntoPeriods(sortedDates);
    setCanMakePrediction(periods.length >= 3);
    if (periods.length <= 3) return;

    const previousPeriodStart = periods[periods.length - 1][0];
    const [avgCycleLength, avgPeriodLength] = calculateLengthStats(periods);
    const dayInCycle = elapsedDays(dayUnixTimestamp(new Date()), previousPeriodStart);

    const predictedPeriodStart = new Date(previousPeriodStart + (avgCycleLength * 86400000));
    const currentPhase = getCurrentPhase(dayInCycle, avgCycleLength, avgPeriodLength);

    setPhaseMessage(`Day ${dayInCycle} (${currentPhase})`);
    setNextPeriodDate(formatDate(predictedPeriodStart));
    setAverageCycleMessage(`Average cycle length: ${avgCycleLength}`);
  }, [periodDates]);

  const toggle = async (date: number) => {
    const willBeSet = periodDates.get(date) ? 0 : 1;
    const endpoint = `/period/toggle?date=${date}&set=${willBeSet}`;
    const response = await authRequest((jwt: string) => request("POST", endpoint, undefined, jwt));
    if (response !== undefined) togglePeriodDate(date);
  }

  const monthLength = () =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const monthStr = () => {
    const formatter =
      new Intl.DateTimeFormat('en-US', { year: "numeric", month: "long" });
    return formatter.format(date);
  }
  const changeMonth = (direction: number) => setDate(prev =>
    new Date(prev.getFullYear(), prev.getMonth() + direction, 1));

  return (
    <IonPage>
      <IonContent>
        <NotificationTray />

        <div className="horizontal-strip">
          <IonButton size="default" fill="clear" onClick={() => changeMonth(-1)}>
            <IonIcon slot="icon-only" color="primary" icon={chevronBack} />
          </IonButton>
          <h3>{monthStr()}</h3>
          <IonButton size="large" fill="clear" onClick={() => changeMonth(1)}>
            <IonIcon slot="icon-only" icon={chevronForward} color="primary" />
          </IonButton>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {Array.from({ length: monthLength() }, (_, i) => {
            const d = new Date(date.getFullYear(), date.getMonth(), i + 1);
            const t = dayUnixTimestamp(d);
            return (
              <IonButton
                key={i} shape="round" size="small"
                color={periodDates.get(t) ? "danger" : undefined}
                fill={periodDates.get(t) ? "solid" : "clear"}
                style={{ aspectRatio: '1' }}
                onClick={() => toggle(t)}>
                <IonLabel color={periodDates.get(t) ? "light" : "medium"}>
                  {i + 1}
                </IonLabel>
              </IonButton>
          )})}
        </div>

        {!canMakePrediction && (
          <div style={{ textAlign: "center" }}>
            <p>There's not enough data to make a prediction.</p>
            <p>Log a few more periods to see predictions.</p>
          </div>
        )}

        {canMakePrediction && (
          <div style={{ textAlign: "center" }}>
            <p>{phaseMessage}</p>
            <p>Next predicted period date: {nextPeriodDate}</p>
            <p>{averageCycleMessage}</p>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
}
