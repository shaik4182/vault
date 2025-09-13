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
      {/* <Text style={globalStyles.title}>Create Vault</Text> */}

      <Text style={globalStyles.label}>Outer Password</Text>
      <TextInput
        placeholder="Enter outer password"
        secureTextEntry
        style={globalStyles.input}
        onChangeText={setOuterPw}
      />

      <Text style={globalStyles.label}>Master Password</Text>
      <TextInput
        placeholder="Enter master password (used to reveal secrets)"
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
