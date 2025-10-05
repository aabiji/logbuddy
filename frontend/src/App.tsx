import { useEffect } from "react";
import { Route, useHistory, useLocation } from "react-router";
import { IonReactRouter } from "@ionic/react-router";
import { useAppState } from "./lib/state";
import { request, useAuthRequest } from "./lib/request";

import {
  IonApp, IonIcon, IonRouterOutlet, IonTabBar,
  IonTabButton, IonTabs, setupIonicReact
} from "@ionic/react";
import { barbell, fastFood, scale, settings, water } from "ionicons/icons";

import AuthPage from "./pages/Auth";
import WeightPage from "./pages/Weight";
import PeriodPage from "./pages/Period";
import SettingsPage from "./pages/Settings";

import ExercisePage from "./pages/exercise/Index";
import HistoryPage  from "./pages/exercise/History";
import ProgressPage from "./pages/exercise/Progress";
import TemplatePage from "./pages/exercise/Template";
import WorkoutPage from "./pages/exercise/Workout";

import FoodPage from "./pages/food/Index";
import FoodSearchPage from "./pages/food/Search";
import FoodViewPage from "./pages/food/View";

import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/palettes/dark.system.css";
import "./theme/variables.css";

setupIonicReact();

function TabsWrapper() {
  const { lastSyncTime, token, updateUserData } = useAppState();
  const authRequest = useAuthRequest();

  const history = useHistory();
  const location = useLocation();
  const showTabBar = !["/auth"].includes(location.pathname);

  const syncUserData = async () => {
    const endpoint = `/user/data?time=${lastSyncTime}`;
    const json = await authRequest((jwt: string) =>
      request("GET", endpoint, undefined, jwt));
    if (json) updateUserData(json);
  }

  useEffect(() => {
    // automatically redirect to auth page the first time we launch the app
    if (token.length == 0 && location.pathname != "/auth")
      history.replace("/auth");
    if (token.length !== 0 && location.pathname != "/auth")
      syncUserData();
  }, []);

  return (
    <IonTabs>
      <IonRouterOutlet animated={false}>
        <Route exact path="/auth"><AuthPage /></Route>
        <Route exact path="/weight"><WeightPage /></Route>
        <Route exact path="/period"><PeriodPage /></Route>
        <Route exact path="/settings"><SettingsPage /></Route>

        <Route exact path="/"><ExercisePage /></Route>
        <Route exact path="/exercise/history"><HistoryPage /></Route>
        <Route exact path="/exercise/progress"><ProgressPage /></Route>
        <Route exact path="/exercise/template/:id"><TemplatePage /></Route>
        <Route exact path="/exercise/workout/:templateID"><WorkoutPage /></Route>

        <Route exact path="/food"><FoodPage /></Route>
        <Route exact path="/food/view/:foodID"><FoodViewPage /></Route>
        <Route exact path="/food/search/:mealTag/:timestampStr"><FoodSearchPage /></Route>
      </IonRouterOutlet>

      {showTabBar && (
        <IonTabBar slot="bottom">
          <IonTabButton tab="weight" href="/weight">
            <IonIcon aria-hidden="true" icon={scale} />
          </IonTabButton>
          <IonTabButton tab="food" href="/food">
            <IonIcon aria-hidden="true" icon={fastFood} />
          </IonTabButton>
          <IonTabButton tab="index" href="/">
            <IonIcon aria-hidden="true" icon={barbell} />
          </IonTabButton>
          <IonTabButton tab="period" href="/period">
            <IonIcon aria-hidden="true" icon={water} />
          </IonTabButton>
          <IonTabButton tab="settings" href="/settings">
            <IonIcon aria-hidden="true" icon={settings} />
          </IonTabButton>
        </IonTabBar>
      )}
    </IonTabs>
  );
}

export default function App() {
  return (
    <IonApp>
      <IonReactRouter>
        <TabsWrapper />
      </IonReactRouter>
    </IonApp>
  );
}
