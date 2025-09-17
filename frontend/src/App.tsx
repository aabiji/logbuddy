import { Route } from "react-router-dom";
import {
  IonApp, IonIcon, IonLabel, IonRouterOutlet,
  IonTabBar, IonTabButton, IonTabs, setupIonicReact
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { barbell, fastFood } from "ionicons/icons";

import FoodPage from "./pages/food/Index"
import FoodSearchPage from "./pages/food/Search";
import FoodEditPage from "./pages/food/Edit";
import IndexPage from "./pages/Index";

import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/palettes/dark.system.css";
import "./theme/variables.css";

setupIonicReact();

export default function App() {
  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet animated={false}>
            <Route exact path="/"><IndexPage /></Route>
            <Route exact path="/food"><FoodPage /></Route>
            <Route exact path="/food/search"><FoodSearchPage /></Route>
            <Route exact path="/food/edit"><FoodEditPage /></Route>
          </IonRouterOutlet>

          <IonTabBar slot="bottom">
            <IonTabButton tab="index" href="/">
              <IonIcon aria-hidden="true" icon={barbell} />
              <IonLabel>Exercise</IonLabel>
            </IonTabButton>

            <IonTabButton tab="food" href="/food">
              <IonIcon aria-hidden="true" icon={fastFood} />
              <IonLabel>Food</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
}
