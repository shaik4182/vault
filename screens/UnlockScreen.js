import React, { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import { openVault } from "../vault";

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
    <View style={{ padding: 20 }}>
      <TextInput placeholder="Outer Password" secureTextEntry onChangeText={setOuterPw} />
      <Button title="Unlock Vault" onPress={handleUnlock} />
    </View>
  );
}
