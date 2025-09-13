import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import CreateVaultScreen from "./screens/CreateVaultScreen";
import UnlockScreen from "./screens/UnlockScreen";
import VaultScreen from "./screens/VaultScreen";
import { vaultExists } from "./vault";

const Stack = createStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    (async () => {
      const exists = await vaultExists();
      setInitialRoute(exists ? "Unlock" : "CreateVault");
    })();
  }, []);

  if (!initialRoute) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: true }} initialRouteName={initialRoute}>
        <Stack.Screen name="CreateVault" component={CreateVaultScreen} />
        <Stack.Screen name="Unlock" component={UnlockScreen} />
        <Stack.Screen name="Vault" component={VaultScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
