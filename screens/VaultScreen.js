import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  TextInput,
  Alert,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import * as ImagePicker from "expo-image-picker";
import {
  revealContent,
  updateVault,
  exportVault,
  importVault,
} from "../vault";

export default function VaultScreen({ route, navigation }) {
  const { innerData, outerPw } = route.params;
  const [masterPw, setMasterPw] = useState("");
  const [secrets, setSecrets] = useState(null);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [search, setSearch] = useState("");
  const [editKey, setEditKey] = useState(null);

  // 👇 full image preview state
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUri, setPreviewUri] = useState(null);

  function handleShow() {
    try {
      const plain = revealContent(innerData, masterPw);
      setSecrets(plain);
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  }

  async function handleAdd() {
    if (!newKey || !newValue) {
      Alert.alert("Error", "Please enter both key and value.");
      return;
    }
    const updated = { ...secrets, [newKey]: newValue };
    await updateVault(outerPw, masterPw, updated);
    setSecrets(updated);
    setNewKey("");
    setNewValue("");
    setEditKey(null);
    Alert.alert("Secret Saved!");
  }

  async function handleAddPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      if (!newKey) {
        Alert.alert("Error", "Please provide a key for the photo.");
        return;
      }

      const photoValue = {
        type: "photo",
        path: result.assets[0].uri,
        note: newValue || "",
      };

      const updated = { ...secrets, [newKey]: photoValue };
      await updateVault(outerPw, masterPw, updated);
      setSecrets(updated);
      setNewKey("");
      setNewValue("");
      Alert.alert("Photo Added!");
    }
  }

  async function handleDelete(key) {
    const updated = { ...secrets };
    delete updated[key];
    await updateVault(outerPw, masterPw, updated);
    setSecrets(updated);
    Alert.alert("Secret Deleted!");
  }

  async function handleCopy(value) {
    if (typeof value === "string") {
      await Clipboard.setStringAsync(value);
      Alert.alert("Copied to clipboard!");
    } else {
      Alert.alert("Cannot copy photos, only text values.");
    }
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

  const filteredSecrets = secrets
    ? Object.entries(secrets).filter(([k]) =>
        k.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <View style={{ flex: 1, backgroundColor: "#eef2f7" }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        {!secrets ? (
          <>
            <Text style={{ fontSize: 15, fontWeight: "500", marginBottom: 6 }}>
              Master Password
            </Text>
            <TextInput
              placeholder="Enter your master password to reveal secrets"
              secureTextEntry
              onChangeText={setMasterPw}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                padding: 10,
                borderRadius: 8,
                marginBottom: 10,
                backgroundColor: "#fff",
              }}
            />
            <Button title="Show Content" onPress={handleShow} />
          </>
        ) : (
          <>
            {/* Search */}
            <Text style={{ fontSize: 15, fontWeight: "500", marginBottom: 6 }}>
              Search
            </Text>
            <TextInput
              placeholder="Search by key name..."
              value={search}
              onChangeText={setSearch}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                padding: 10,
                borderRadius: 8,
                marginBottom: 15,
                backgroundColor: "#fff",
              }}
            />

            <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
              Secrets:
            </Text>
            {filteredSecrets.map(([k, v]) => (
              <View
                key={k}
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 10,
                  backgroundColor: "#fff",
                }}
              >
                {/* Key */}
                <Text style={{ fontWeight: "bold" }}>{k}</Text>

                {/* Render text vs photo */}
                {typeof v === "object" && v.type === "photo" ? (
                  <>
                    <TouchableOpacity
                      onPress={() => {
                        setPreviewUri(v.path);
                        setPreviewVisible(true);
                      }}
                    >
                      <Image
                        source={{ uri: v.path }}
                        style={{
                          width: "100%",
                          height: 180,
                          marginTop: 8,
                          borderRadius: 8,
                        }}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                    {v.note ? (
                      <Text style={{ marginTop: 5 }}>{v.note}</Text>
                    ) : null}
                  </>
                ) : (
                  <Text style={{ marginTop: 4 }}>{v}</Text>
                )}

                {/* Action buttons */}
                <View style={{ flexDirection: "row", marginTop: 8 }}>
                  {typeof v === "string" && (
                    <TouchableOpacity
                      style={{
                        backgroundColor: "#007bff",
                        padding: 8,
                        borderRadius: 6,
                        marginRight: 10,
                      }}
                      onPress={() => handleCopy(v)}
                    >
                      <Text style={{ color: "#fff" }}>Copy</Text>
                    </TouchableOpacity>
                  )}

                  {typeof v === "string" && (
                    <TouchableOpacity
                      style={{
                        backgroundColor: "#28a745",
                        padding: 8,
                        borderRadius: 6,
                        marginRight: 10,
                      }}
                      onPress={() => {
                        setNewKey(k);
                        setNewValue(v);
                        setEditKey(k);
                      }}
                    >
                      <Text style={{ color: "#fff" }}>Edit</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={{
                      backgroundColor: "#dc3545",
                      padding: 8,
                      borderRadius: 6,
                    }}
                    onPress={() => handleDelete(k)}
                  >
                    <Text style={{ color: "#fff" }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Add new or edit secret */}
            <Text style={{ fontSize: 15, fontWeight: "500", marginBottom: 6 }}>
              Key
            </Text>
            <TextInput
              placeholder="Enter a key (e.g. Gmail)"
              value={newKey}
              onChangeText={setNewKey}
              editable={!editKey}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                padding: 10,
                borderRadius: 8,
                marginBottom: 10,
                backgroundColor: editKey ? "#eee" : "#fff",
              }}
            />

            <Text style={{ fontSize: 15, fontWeight: "500", marginBottom: 6 }}>
              Value / Note
            </Text>
            <TextInput
              placeholder="Enter value (password / note)"
              value={newValue}
              onChangeText={setNewValue}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                padding: 10,
                borderRadius: 8,
                marginBottom: 10,
                backgroundColor: "#fff",
              }}
            />
            <Button
              title={editKey ? "Update Secret" : "Add Secret"}
              onPress={handleAdd}
            />
            <View style={{ marginTop: 10 }}>
              <Button title="Add Photo" color="orange" onPress={handleAddPhoto} />
            </View>
          </>
        )}

        {/* Bottom actions */}
        <View style={{ marginTop: 30, marginBottom: 60 }}>
          <Button title="Export Vault" onPress={handleExport} />
          <Button title="Import Vault" onPress={handleImport} />
          <Button
            title="Logout"
            color="red"
            onPress={() => navigation.replace("Unlock")}
          />
        </View>
      </ScrollView>

      {/* Full image preview modal */}
      <Modal visible={previewVisible} transparent={true}>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.9)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={{ uri: previewUri }}
            style={{ width: "90%", height: "70%", borderRadius: 12 }}
            resizeMode="contain"
          />
          <Pressable
            style={{
              marginTop: 20,
              padding: 10,
              backgroundColor: "#fff",
              borderRadius: 6,
            }}
            onPress={() => setPreviewVisible(false)}
          >
            <Text style={{ color: "black" }}>Close</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}
