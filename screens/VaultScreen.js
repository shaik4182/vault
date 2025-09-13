import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  TextInput,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import {
  revealContent,
  updateVault,
  exportVault,
  importVault,
} from "../vault";
import { globalStyles } from "../styles";

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

  async function copyToClipboard(value) {
    await Clipboard.setStringAsync(value);
    Alert.alert("Copied!", value);
  }

  return (
    <ScrollView style={globalStyles.container}>
      {/* <Text style={globalStyles.title}>Vault</Text> */}

      {!secrets ? (
        <>
          <TextInput
            placeholder="Master Password"
            secureTextEntry
            style={globalStyles.input}
            onChangeText={setMasterPw}
          />
          <Button title="Show Content" onPress={handleShow} />
        </>
      ) : (
        <>
          <Text style={{ fontWeight: "bold", marginBottom: 10 }}>Secrets:</Text>
          {Object.entries(secrets).map(([k, v]) => (
            <View
              key={k}
              style={{
                backgroundColor: "white",
                borderRadius: 8,
                padding: 12,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: "#ddd",
              }}
            >
              <Text style={{ fontWeight: "bold" }}>{k}</Text>
              <Text style={{ marginVertical: 4 }}>{v}</Text>
              <TouchableOpacity
                onPress={() => copyToClipboard(v)}
                style={{
                  backgroundColor: "#007bff",
                  padding: 6,
                  borderRadius: 6,
                  alignSelf: "flex-start",
                }}
              >
                <Text style={{ color: "white" }}>Copy</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TextInput
            placeholder="New Key"
            value={newKey}
            style={globalStyles.input}
            onChangeText={setNewKey}
          />
          <TextInput
            placeholder="New Value"
            value={newValue}
            style={globalStyles.input}
            onChangeText={setNewValue}
          />
          <Button title="Add Secret" onPress={handleAdd} />
        </>
      )}

      <View style={{ marginTop: 20 }}>
        <Button title="Export Vault" onPress={handleExport} />
        <Button title="Import Vault" onPress={handleImport} />
        <Button
          title="Logout"
          color="red"
          onPress={() => navigation.replace("Unlock")}
        />
      </View>
    </ScrollView>
  );
}
