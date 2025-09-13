import React, { useState } from "react";
import { View, TextInput, Button, Alert, Text } from "react-native";
import { createVault } from "../vault";
import { globalStyles } from "../styles";

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
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Create Vault</Text>
      <TextInput
        placeholder="Outer Password"
        secureTextEntry
        style={globalStyles.input}
        onChangeText={setOuterPw}
      />
      <TextInput
        placeholder="Master Password"
        secureTextEntry
        style={globalStyles.input}
        onChangeText={setMasterPw}
      />
      <View style={globalStyles.button}>
        <Button title="Create Vault" onPress={handleCreate} />
      </View>
    </View>
  );
}
