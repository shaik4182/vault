import React, { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import { createVault } from "../vault";

export default function CreateVaultScreen({ navigation }) {
  const [outerPw, setOuterPw] = useState("");
  const [masterPw, setMasterPw] = useState("");

  async function handleCreate() {
    try {
      await createVault(outerPw, masterPw, { sample: "myFirstSecret" });
      Alert.alert("Vault created!");
      navigation.replace("Unlock");
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  }

  return (
    <View style={{ padding: 20 }}>
      <TextInput placeholder="Outer Password" secureTextEntry onChangeText={setOuterPw} />
      <TextInput placeholder="Master Password" secureTextEntry onChangeText={setMasterPw} />
      <Button title="Create Vault" onPress={handleCreate} />
    </View>
  );
}
