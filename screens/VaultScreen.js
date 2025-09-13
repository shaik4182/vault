import React, { useState } from "react";
import { View, Text, Button, TextInput, Alert, ScrollView } from "react-native";
import { revealContent, updateVault, exportVault, importVault } from "../vault";

export default function VaultScreen({ route, navigation }) {
  const { innerData, outerPw } = route.params;
  const [masterPw, setMasterPw] = useState("");
  const [secrets, setSecrets] = useState(null);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  function handleShow() {
    try {
      const plain = revealContent(innerData, masterPw);
      setSecrets(plain);
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  }

  async function handleAdd() {
    const updated = { ...secrets, [newKey]: newValue };
    await updateVault(outerPw, masterPw, updated);
    setSecrets(updated);
    setNewKey("");
    setNewValue("");
    Alert.alert("Secret Added!");
  }

  async function handleExport() {
    try {
      await exportVault();
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  }

  async function handleImport() {
    try {
      await importVault();
      Alert.alert("Vault Imported!", "Restart app to unlock new vault.");
      navigation.replace("Unlock");
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  }

  return (
    <ScrollView style={{ padding: 20 }}>
      {!secrets ? (
        <>
          <TextInput placeholder="Master Password" secureTextEntry onChangeText={setMasterPw} />
          <Button title="Show Content" onPress={handleShow} />
        </>
      ) : (
        <>
          <Text style={{ fontWeight: "bold", marginBottom: 10 }}>Secrets:</Text>
          {Object.entries(secrets).map(([k, v]) => (
            <Text key={k}>{k}: {v}</Text>
          ))}
          <TextInput placeholder="New Key" value={newKey} onChangeText={setNewKey} />
          <TextInput placeholder="New Value" value={newValue} onChangeText={setNewValue} />
          <Button title="Add Secret" onPress={handleAdd} />
        </>
      )}

      <View style={{ marginTop: 20 }}>
        <Button title="Export Vault" onPress={handleExport} />
        <Button title="Import Vault" onPress={handleImport} />
      </View>
    </ScrollView>
  );
}
