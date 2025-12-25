import { trpc } from "@/lib/trpc";
import { usePlaylistStore } from "@/store/appStore";
import { useRouter } from "expo-router";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  Loader,
  Lock,
  Server,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PlaylistLoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    url: "",
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [urlTouched, setUrlTouched] = useState(false);
  const [urlStatus, setUrlStatus] = useState<"" | "checking" | "verified">("");
  const [urlError, setUrlError] = useState("");

  const { addPlaylist, selectPlaylist, startPlaylistCreation } =
    usePlaylistStore();

  const {
    mutate: createPlaylist,
    isPending,
    error,
  } = trpc.playlists.createPlaylist.useMutation({
    onSuccess: (data) => {
      if (!data) return;
      setUrlStatus("");
      setFormData({ url: "", username: "", password: "" });
      addPlaylist(data);
      selectPlaylist(data);
      startPlaylistCreation();
    },
  });

  const validateUrl = (url: string) => {
    if (!url) return "";
    try {
      new URL(url);
      return url.startsWith("https://") || url.startsWith("http://") ?
          ""
        : "URL should use HTTPS for security";
    } catch {
      return "Please enter a valid URL";
    }
  };

  useEffect(() => {
    const error = validateUrl(formData.url);
    setUrlError(error);

    if (formData.url && !error) {
      const timer = setTimeout(() => {
        setUrlStatus("verified");
      }, 1000);
      setUrlStatus("checking");
      return () => clearTimeout(timer);
    } else {
      setUrlStatus("");
    }
  }, [formData.url]);

  const handleUrlBlur = () => {
    setUrlTouched(true);
  };

  const handleSubmit = async () => {
    if (isFormValid) {
      createPlaylist({
        url: formData.url,
        username: formData.username,
        password: formData.password,
      });
    }
  };

  const isFormValid =
    formData.url &&
    formData.username &&
    formData.password &&
    !urlError &&
    urlStatus === "verified";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.formContainer}
        contentContainerStyle={styles.formContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.formHeader}>
          <View style={styles.iconContainer}>
            <Server size={40} color='#2563eb' />
          </View>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorBox}>
            <AlertCircle size={18} color='#ef4444' />
            <Text style={styles.errorText}>{error.message}</Text>
          </View>
        )}

        <View style={styles.center}>
          <Pressable
            style={styles.submitButton}
            onPress={() => router.push("/playlists/manage")}
          >
            <Text style={styles.submitButtonText}>Manage Playlists</Text>
          </Pressable>
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>Or add new</Text>
          <View style={styles.divider} />
        </View>
        <View style={styles.center}>
          <Text style={styles.formTitle}>Add Playlist</Text>
          <Text style={styles.formSubtitle}>
            Enter your Xtream Codes credentials
          </Text>
        </View>

        <View style={styles.inputsContainer}>
          {/* URL Input */}
          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <Globe size={16} color='#2563eb' />
              <Text style={styles.inputLabelText}>Server URL</Text>
            </View>
            <View
              style={[
                styles.inputWrapper,
                urlError && urlTouched && styles.inputErrorBorder,
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder='https://api.example.com'
                placeholderTextColor='#6b7280'
                value={formData.url}
                onChangeText={(text) => setFormData({ ...formData, url: text })}
                onBlur={handleUrlBlur}
                autoCapitalize='none'
                keyboardType='url'
                editable={!isPending}
              />
              {urlStatus === "checking" && (
                <Loader size={16} color='#eab308' style={styles.statusIcon} />
              )}
              {urlStatus === "verified" && (
                <CheckCircle2
                  size={16}
                  color='#10b981'
                  style={styles.statusIcon}
                />
              )}
            </View>
            {urlError && urlTouched && (
              <Text style={styles.inputError}>{urlError}</Text>
            )}
          </View>

          {/* Username Input */}
          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <Globe size={16} color='#2563eb' />
              <Text style={styles.inputLabelText}>Username</Text>
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder='Enter your username'
                placeholderTextColor='#6b7280'
                value={formData.username}
                onChangeText={(text) =>
                  setFormData({ ...formData, username: text })
                }
                autoCapitalize='none'
                editable={!isPending}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <Lock size={16} color='#2563eb' />
              <Text style={styles.inputLabelText}>Password</Text>
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder='Enter your password'
                placeholderTextColor='#6b7280'
                value={formData.password}
                onChangeText={(text) =>
                  setFormData({ ...formData, password: text })
                }
                secureTextEntry={!showPassword}
                editable={!isPending}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
              >
                {showPassword ?
                  <EyeOff size={18} color='#6b7280' />
                : <Eye size={18} color='#6b7280' />}
              </Pressable>
            </View>
          </View>
        </View>

        {/* Connection Status */}
        <View style={styles.statusBox}>
          <View style={styles.statusHeader}>
            <BarChart3 size={16} color='#60a5fa' />
            <Text style={styles.statusTitle}>Connection Status</Text>
          </View>
          <View style={styles.statusItems}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>URL Validation:</Text>
              <Text
                style={[
                  styles.statusValue,
                  {
                    color:
                      urlStatus === "verified" ? "#10b981"
                      : urlStatus === "checking" ? "#eab308"
                      : "#6b7280",
                  },
                ]}
              >
                {urlStatus === "verified" ?
                  "✓ Valid"
                : urlStatus === "checking" ?
                  "⏳ Checking"
                : "◦ Pending"}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Form Completion:</Text>
              <Text
                style={[
                  styles.statusValue,
                  {
                    color:
                      formData.username && formData.password ?
                        "#10b981"
                      : "#6b7280",
                  },
                ]}
              >
                {formData.username && formData.password ?
                  "✓ Complete"
                : "◦ Incomplete"}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Ready to Connect:</Text>
              <Text
                style={[
                  styles.statusValue,
                  {
                    color: isFormValid && !isPending ? "#10b981" : "#6b7280",
                  },
                ]}
              >
                {isFormValid && !isPending ? "🚀 Ready" : "⏳ Waiting"}
              </Text>
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <Pressable
          style={[
            styles.submitButton,
            (!isFormValid || isPending) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!isFormValid || isPending}
        >
          {isPending ?
            <>
              <ActivityIndicator color='white' size='small' />
              <Text style={styles.submitButtonText}>Connecting...</Text>
            </>
          : <>
              <Text style={styles.submitButtonText}>Add Playlist</Text>
            </>
          }
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  formContainer: {
    flex: 1,
  },
  formContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  formHeader: {
    alignItems: "center",
    marginBottom: 40,
    gap: 12,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#222",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
  },
  formTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 12,
  },
  formSubtitle: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "500",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 24,
    gap: 10,
  },
  errorText: {
    color: "#fca5a5",
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 10,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#222",
  },
  dividerText: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "500",
  },
  inputsContainer: {
    marginBottom: 24,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inputLabelText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  inputErrorBorder: {
    borderColor: "#ef4444",
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    color: "white",
    fontSize: 15,
    fontWeight: "500",
  },
  statusIcon: {
    marginLeft: 4,
  },
  passwordToggle: {
    padding: 8,
  },
  inputError: {
    color: "#ef4444",
    fontSize: 12,
    fontWeight: "500",
  },
  statusBox: {
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  statusTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
  },
  statusItems: {
    gap: 10,
  },
  statusItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusLabel: {
    color: "#6b7280",
    fontSize: 12,
  },
  statusValue: {
    fontSize: 12,
    fontWeight: "700",
  },
  submitButton: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
  },
});
