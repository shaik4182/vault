import * as FileSystem from "expo-file-system/legacy";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import CryptoJS from "crypto-js";

const VAULT_PATH = FileSystem.documentDirectory + "vault.enc";

// 🔑 Derive AES key from password using PBKDF2
function deriveKey(password) {
  return CryptoJS.PBKDF2(password, "my_salt", {
    keySize: 256 / 32,
    iterations: 1000,
  }).toString();
}

// 📦 Create new vault (first time)
export async function createVault(outerPw, masterPw, secrets = {}) {
  const masterKey = deriveKey(masterPw);
  const innerEncrypted = CryptoJS.AES.encrypt(
    JSON.stringify(secrets),
    masterKey
  ).toString();

  const outerKey = deriveKey(outerPw);
  const doublyEncrypted = CryptoJS.AES.encrypt(
    innerEncrypted,
    outerKey
  ).toString();

  await FileSystem.writeAsStringAsync(VAULT_PATH, doublyEncrypted, {
    encoding: FileSystem.EncodingType.UTF8,
  });
}

// ✅ Check if vault exists
export async function vaultExists() {
  try {
    const info = await FileSystem.getInfoAsync(VAULT_PATH);
    return info.exists;
  } catch (e) {
    console.error("vaultExists failed:", e);
    return false;
  }
}

// 🔓 Open vault with outer password (returns still-encrypted inner data)
export async function openVault(outerPw) {
  if (!(await vaultExists())) throw new Error("No vault found");

  const encrypted = await FileSystem.readAsStringAsync(VAULT_PATH, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  const outerKey = deriveKey(outerPw);
  const inner = CryptoJS.AES.decrypt(encrypted, outerKey).toString(
    CryptoJS.enc.Utf8
  );

  if (!inner) throw new Error("Wrong outer password");
  return inner; // still encrypted with master password
}

// 👁 Reveal secrets with master password
export function revealContent(innerData, masterPw) {
  const masterKey = deriveKey(masterPw);
  const plain = CryptoJS.AES.decrypt(innerData, masterKey).toString(
    CryptoJS.enc.Utf8
  );

  if (!plain) throw new Error("Wrong master password");
  return JSON.parse(plain);
}

// ✏️ Update secrets and re-encrypt
export async function updateVault(outerPw, masterPw, secrets) {
  await createVault(outerPw, masterPw, secrets);
}

// 📤 Export vault.enc file
export async function exportVault() {
  if (!(await vaultExists())) throw new Error("No vault to export");

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("Sharing not available on this device");
  }

  await Sharing.shareAsync(VAULT_PATH);
}

// 📥 Import vault.enc file (replace existing vault)
export async function importVault() {
  const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
  if (result.canceled || !result.assets?.length) return;

  const pickedFile = result.assets[0].uri;
  const content = await FileSystem.readAsStringAsync(pickedFile, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  await FileSystem.writeAsStringAsync(VAULT_PATH, content, {
    encoding: FileSystem.EncodingType.UTF8,
  });
}
