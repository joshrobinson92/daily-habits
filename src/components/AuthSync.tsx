import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { Cloud, CloudOff, Lock, Mail, CheckCircle } from "lucide-react-native";
import { auth, isRealConfig } from "../services/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { COLORS, GLASS_STYLE } from "../styles/theme";

interface AuthSyncProps {
  onAuthChange: () => void;
}

export const AuthSync: React.FC<AuthSyncProps> = ({ onAuthChange }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const currentUser = auth?.currentUser;

  const handleAuthAction = async () => {
    if (!isRealConfig || !auth) return;
    if (!email.trim() || !password) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      setEmail("");
      setPassword("");
      onAuthChange();
    } catch (err: any) {
      console.error("Auth action failed:", err);
      let friendlyMessage = "Authentication failed. Please check your credentials.";
      if (err.code === "auth/email-already-in-use") {
        friendlyMessage = "This email is already registered.";
      } else if (err.code === "auth/weak-password") {
        friendlyMessage = "Password should be at least 6 characters.";
      } else if (err.code === "auth/invalid-credential") {
        friendlyMessage = "Invalid email or password.";
      }
      setErrorMsg(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    setLoading(true);
    try {
      await signOut(auth);
      onAuthChange();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Render when Firebase is in Mock Mode
  if (!isRealConfig) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Cloud Sync Settings</Text>

        <View style={[styles.card, GLASS_STYLE, { borderColor: COLORS.accentHabit + "20" }]}>
          <CloudOff size={32} color={COLORS.textSecondary} style={styles.centerIcon} />
          <Text style={styles.cardTitle}>Local Storage Mode</Text>
          <Text style={styles.cardDescription}>
            The app is currently running in offline local development mode. Your habits, completions, and streaks are safely saved in this device's storage.
          </Text>
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              💡 To enable real-time Firebase cloud backup and cross-device sync, configure your Firebase keys inside the project configuration.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Cloud Sync Settings</Text>

      {currentUser ? (
        /* Authenticated State */
        <View style={[styles.card, GLASS_STYLE, { borderColor: COLORS.accentSuccess + "25" }]}>
          <CheckCircle size={36} color={COLORS.accentSuccess} style={styles.centerIcon} />
          <Text style={styles.cardTitle}>Cloud Backup Active</Text>
          <Text style={styles.syncEmail}>Logged in as: {currentUser.email}</Text>
          
          <Text style={styles.cardDescription}>
            Your daily habits and scripture sync progress are backed up and synced in real-time. Log in with this account on other devices to access your data.
          </Text>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={COLORS.accentDanger} />
            ) : (
              <Text style={styles.logoutBtnText}>SIGN OUT</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        /* Unauthenticated State */
        <View style={[styles.card, GLASS_STYLE]}>
          <Cloud size={32} color={COLORS.accentHabit} style={styles.centerIcon} />
          <Text style={styles.cardTitle}>
            {isSignUp ? "Create Backup Account" : "Sign In to Cloud Sync"}
          </Text>
          <Text style={styles.cardDescription}>
            Sync your habit completions and Scripture sync positions across iOS, Android, and Web platforms.
          </Text>

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          {/* Form */}
          <View style={styles.formGroup}>
            <View style={styles.inputContainer}>
              <Mail size={16} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor={COLORS.textSecondary}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={16} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={COLORS.textSecondary}
                secureTextEntry
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleAuthAction} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.submitBtnText}>
                {isSignUp ? "CREATE ACCOUNT" : "SIGN IN"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.toggleModeBtn} 
            onPress={() => setIsSignUp(!isSignUp)}
            disabled={loading}
          >
            <Text style={styles.toggleModeText}>
              {isSignUp 
                ? "Already have an account? Sign In" 
                : "New user? Create a backup account"
              }
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  header: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  card: {
    alignItems: "center",
  },
  centerIcon: {
    marginBottom: 12,
    marginTop: 6,
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  syncEmail: {
    color: COLORS.accentSuccess,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  cardDescription: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 6,
  },
  warningBox: {
    backgroundColor: "rgba(245, 158, 11, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.2)",
    borderRadius: 8,
    padding: 12,
    marginTop: 6,
  },
  warningText: {
    color: "#F59E0B",
    fontSize: 12,
    lineHeight: 16,
  },
  formGroup: {
    width: "100%",
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 8,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 44,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
    height: "100%",
  },
  submitBtn: {
    width: "100%",
    backgroundColor: COLORS.accentHabit,
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  submitBtnText: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 14,
  },
  toggleModeBtn: {
    padding: 6,
  },
  toggleModeText: {
    color: COLORS.accentHabit,
    fontSize: 12,
    fontWeight: "500",
  },
  logoutBtn: {
    width: "100%",
    borderWidth: 1,
    borderColor: COLORS.accentDanger,
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutBtnText: {
    color: COLORS.accentDanger,
    fontWeight: "bold",
    fontSize: 14,
  },
  errorText: {
    color: COLORS.accentDanger,
    fontSize: 13,
    marginBottom: 14,
    textAlign: "center",
    fontWeight: "600",
  }
});
