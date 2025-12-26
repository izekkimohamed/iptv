import { trpc } from "@/lib/trpc";
import { usePlaylistStore } from "@/store/appStore";
import { usePlayerTheme } from "@/theme/playerTheme";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  AlertCircle,
  Check,
  Globe,
  KeyRound,
  LayoutList,
  Link as LinkIcon,
  Loader2,
  Lock,
  Server,
  User,
  Wifi,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PlaylistLoginForm() {
  const router = useRouter();
  const theme = usePlayerTheme();

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
        : "Secure connection (HTTPS) recommended";
    } catch {
      return "Invalid server URL";
    }
  };

  useEffect(() => {
    const err = validateUrl(formData.url);
    setUrlError(err);

    if (formData.url && !err) {
      setUrlStatus("checking");
      const timer = setTimeout(() => setUrlStatus("verified"), 800); // Simulate check
      return () => clearTimeout(timer);
    } else {
      setUrlStatus("");
    }
  }, [formData.url]);

  const handleSubmit = () => {
    if (isFormValid) {
      createPlaylist(formData);
    }
  };

  const isFormValid =
    formData.url && formData.username && formData.password && !urlError;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.bg }]}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor: theme.surfaceSecondary,
                  borderColor: theme.border,
                },
              ]}
            >
              <Server size={32} color={theme.primary} />
            </View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              Connect Server
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Enter your Xtream Codes details
            </Text>
          </View>

          {/* Manage Button */}
          <Pressable
            style={[
              styles.manageBtn,
              {
                backgroundColor: theme.surfaceSecondary,
                borderColor: theme.border,
              },
            ]}
            onPress={() => router.push("/playlists/manage")}
          >
            <LayoutList size={16} color={theme.textMuted} />
            <Text style={[styles.manageText, { color: theme.textPrimary }]}>
              Manage Existing Playlists
            </Text>
          </Pressable>

          {/* Error Banner */}
          {error && (
            <Animated.View
              entering={FadeInDown}
              style={[
                styles.errorBanner,
                {
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  borderColor: "rgba(239, 68, 68, 0.2)",
                },
              ]}
            >
              <AlertCircle size={18} color='#ef4444' />
              <Text style={styles.errorText}>{error.message}</Text>
            </Animated.View>
          )}

          {/* Form Fields */}
          <View style={styles.formGroup}>
            {/* URL Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Server URL
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: theme.surfaceSecondary,
                    borderColor: urlError ? theme.accentError : theme.border,
                  },
                  urlStatus === "verified" && {
                    borderColor: theme.accentSuccess,
                  },
                ]}
              >
                <Globe size={18} color={theme.primary} />
                <TextInput
                  style={[styles.input, { color: theme.textPrimary }]}
                  placeholder='http://example.com:8080'
                  placeholderTextColor={theme.textMuted}
                  value={formData.url}
                  onChangeText={(t) => setFormData({ ...formData, url: t })}
                  onBlur={() => setUrlTouched(true)}
                  autoCapitalize='none'
                  keyboardType='url'
                  editable={!isPending}
                />
                {urlStatus === "checking" && (
                  <ActivityIndicator size='small' color={theme.primary} />
                )}
                {urlStatus === "verified" && (
                  <Check size={18} color={theme.accentSuccess} />
                )}
              </View>
              {urlError && urlTouched && (
                <Text style={[styles.helperText, { color: theme.accentError }]}>
                  {urlError}
                </Text>
              )}
            </View>

            {/* Username */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Username
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: theme.surfaceSecondary,
                    borderColor: theme.border,
                  },
                ]}
              >
                <User size={18} color={theme.textMuted} />
                <TextInput
                  style={[styles.input, { color: theme.textPrimary }]}
                  placeholder='Username'
                  placeholderTextColor={theme.textMuted}
                  value={formData.username}
                  onChangeText={(t) =>
                    setFormData({ ...formData, username: t })
                  }
                  autoCapitalize='none'
                  editable={!isPending}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Password
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: theme.surfaceSecondary,
                    borderColor: theme.border,
                  },
                ]}
              >
                <KeyRound size={18} color={theme.textMuted} />
                <TextInput
                  style={[styles.input, { color: theme.textPrimary }]}
                  placeholder='Password'
                  placeholderTextColor={theme.textMuted}
                  value={formData.password}
                  onChangeText={(t) =>
                    setFormData({ ...formData, password: t })
                  }
                  secureTextEntry={!showPassword}
                  editable={!isPending}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ padding: 4 }}
                >
                  {showPassword ?
                    <Lock size={18} color={theme.primary} />
                  : <Lock size={18} color={theme.textMuted} />}
                </Pressable>
              </View>
            </View>
          </View>

          {/* Connection HUD */}
          <Animated.View
            layout={Layout}
            style={[
              styles.hudContainer,
              {
                backgroundColor: theme.surfaceSecondary,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.hudHeader}>
              <Wifi size={14} color={theme.primary} />
              <Text style={[styles.hudTitle, { color: theme.textSecondary }]}>
                PRE-FLIGHT CHECKS
              </Text>
            </View>

            <View style={styles.hudRow}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      urlStatus === "verified" ?
                        theme.accentSuccess
                      : theme.textMuted,
                  },
                ]}
              />
              <Text style={[styles.hudText, { color: theme.textMuted }]}>
                Valid Server URL
              </Text>
            </View>
            <View style={styles.hudRow}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      formData.username && formData.password ?
                        theme.accentSuccess
                      : theme.textMuted,
                  },
                ]}
              />
              <Text style={[styles.hudText, { color: theme.textMuted }]}>
                Credentials Entered
              </Text>
            </View>
          </Animated.View>

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            disabled={!isFormValid || isPending}
            style={[
              styles.submitBtn,
              (!isFormValid || isPending) && { opacity: 0.5 },
            ]}
          >
            <LinearGradient
              colors={[theme.primary, theme.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBtn}
            >
              {isPending ?
                <View style={styles.row}>
                  <Loader2 size={20} color='white' style={styles.spin} />
                  <Text style={styles.btnText}>Authenticating...</Text>
                </View>
              : <View style={styles.row}>
                  <LinkIcon size={20} color='white' />
                  <Text style={styles.btnText}>Connect Playlist</Text>
                </View>
              }
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 50 },

  header: { alignItems: "center", marginBottom: 32 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: "center" },

  manageBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    gap: 8,
  },
  manageText: { fontSize: 13, fontWeight: "600" },

  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  errorText: { color: "#ef4444", fontSize: 13, flex: 1 },

  formGroup: { gap: 20, marginBottom: 32 },
  inputContainer: { gap: 8 },
  label: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    gap: 12,
  },
  input: { flex: 1, fontSize: 15, fontWeight: "500", height: "100%" },
  helperText: { fontSize: 11, marginTop: 4 },

  hudContainer: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 32,
    gap: 10,
  },
  hudHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  hudTitle: { fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  hudRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  hudText: { fontSize: 13 },

  submitBtn: {
    height: 56,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  gradientBtn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  btnText: { color: "white", fontSize: 16, fontWeight: "700" },
  spin: { transform: [{ rotate: "45deg" }] }, // Basic rotate placeholder, use Reanimated for real spin
});
