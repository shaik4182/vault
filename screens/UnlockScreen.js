import React, { useState } from "react";
import { View, TextInput, Button, Alert, Text } from "react-native";
import { openVault } from "../vault";
import { globalStyles } from "../styles";

export default function UnlockScreen({ navigation }) {
  const [outerPw, setOuterPw] = useState("");

  async function handleUnlock() {
    try {
      const innerData = await openVault(outerPw);
      navigation.replace("Vault", { innerData, outerPw });
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  }

  return (
    // UnlockScreen.js
<View style={globalStyles.container}>
  <TextInput
    placeholder="Outer Password"
    secureTextEntry
    style={globalStyles.input}
    onChangeText={setOuterPw}
  />
  <View style={globalStyles.button}>
    <Button title="Unlock Vault" onPress={handleUnlock} />
  </View>
</View>

  );
}
