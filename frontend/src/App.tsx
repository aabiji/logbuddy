import { Route } from 'react-router-dom';
import {
  IonApp, IonIcon, IonLabel, IonRouterOutlet,
  IonTabBar, IonTabButton, IonTabs, setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { barbell, fastFood } from 'ionicons/icons';

import Search from './pages/Nutrition';
import Index from './pages/Index';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/palettes/dark.system.css';
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet animated={false}>
          <Route exact path="/"><Index /></Route>
          <Route exact path="/nutrition"><Search /></Route>
        </IonRouterOutlet>

        <IonTabBar slot="bottom">
          <IonTabButton tab="index" href="/">
            <IonIcon aria-hidden="true" icon={barbell} />
            <IonLabel>Exercise</IonLabel>
          </IonTabButton>

          <IonTabButton tab="nutrition" href="/nutrition">
            <IonIcon aria-hidden="true" icon={fastFood} />
            <IonLabel>Food</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  </IonApp>
);

export default App;
