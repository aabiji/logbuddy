import { useEffect } from "react";
import { Route, useHistory, useLocation } from "react-router";
import { IonReactRouter } from "@ionic/react-router";
import { useAppState } from "./lib/state";

import {
  IonApp, IonIcon, IonLabel, IonRouterOutlet,
  IonTabBar, IonTabButton, IonTabs, setupIonicReact
} from "@ionic/react";
import { barbell, fastFood } from "ionicons/icons";

import AuthPage from "./pages/Auth";

import ExercisePage from "./pages/exercise/Index";
import HistoryPage  from "./pages/exercise/History";
import ProgressPage from "./pages/exercise/Progress";
import TemplatePage from "./pages/exercise/Template";
import WorkoutPage from "./pages/exercise/Workout";

import FoodPage from "./pages/food/Index"
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
  const location = useLocation();
  const showTabBar = !["/auth"].includes(location.pathname);

  // automatically redirect to auth page the first time we launch the app
  const history = useHistory();
  const { mainToken, refreshToken } = useAppState();

  useEffect(() => {
    const firstLaunch = mainToken.length == 0 || refreshToken.length == 0;
    if (firstLaunch && location.pathname != "/auth")
      history.replace("/auth");
  }, []);

  return (
    <IonTabs>
      <IonRouterOutlet animated={false}>
        <Route exact path="/auth"><AuthPage /></Route>

        <Route exact path="/exercise"><ExercisePage /></Route>
        <Route exact path="/exercise/history"><HistoryPage /></Route>
        <Route exact path="/exercise/progress"><ProgressPage /></Route>
        <Route exact path="/exercise/template/:id"><TemplatePage /></Route>
        <Route exact path="/exercise/workout/:id"><WorkoutPage /></Route>

        <Route exact path="/food"><FoodPage /></Route>
        <Route exact path="/food/view/:foodID"><FoodViewPage /></Route>
        <Route exact path="/food/search/:mealTag/:timestampStr"><FoodSearchPage /></Route>
      </IonRouterOutlet>

      {showTabBar && (
        <IonTabBar slot="bottom">
          <IonTabButton tab="index" href="/exercise">
            <IonIcon aria-hidden="true" icon={barbell} />
            <IonLabel>Exercise</IonLabel>
          </IonTabButton>

          <IonTabButton tab="food" href="/food">
            <IonIcon aria-hidden="true" icon={fastFood} />
            <IonLabel>Food</IonLabel>
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
