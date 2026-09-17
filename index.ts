// Must be the first import: sets up gesture handler's native event
// subscriptions before anything else touches the view hierarchy.
import "react-native-gesture-handler";
import { registerRootComponent } from "expo";

import App from "./App";

// registerRootComponent calls AppRegistry.registerComponent('main', () => App).
// It also ensures the environment is set up appropriately whether the app
// loads in Expo Go or in a native build.
registerRootComponent(App);
