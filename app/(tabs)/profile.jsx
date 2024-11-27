import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getProfileId, saveUserProfile } from "@/services/profileServices";
import { useRouter } from "expo-router"; // Para redirigir al login

const Profile = () => {
  const [profileInfo, setProfileInfo] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  const screenWidth = Dimensions.get("window").width;
  const router = useRouter(); // Usar router para redirigir

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) throw new Error("No se encontró el ID del usuario en AsyncStorage");
        setLoggedInUserId(userId);

        const profileData = await getProfileId(userId);
        setProfileInfo(profileData);
      } catch (error) {
        console.error("Error al cargar el perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const alternarEdicion = () => {
    setModoEdicion(!modoEdicion);
  };

  const manejarGuardar = () => {
    if (profileInfo) {
      const { username, description, profilePicture } = profileInfo.user;
      const updatedUsername = username.trim() !== "" ? username : " ";
      const updatedDescription = description.trim() !== "" ? description : " ";
      const updatedProfilePicture =
        profilePicture.trim() !== ""
          ? profilePicture
          : "https://i.pinimg.com/736x/79/8f/bf/798fbf62ba74a844ceeef90b83c76e59.jpg";

      saveUserProfile(updatedUsername, updatedDescription, updatedProfilePicture)
        .then(async () => {
          try {
            const userId = await AsyncStorage.getItem("userId");
            if (!userId) throw new Error("No se encontró el ID del usuario en AsyncStorage");
            const refreshedProfile = await getProfileId(userId);
            setProfileInfo(refreshedProfile);
          } catch (error) {
            console.error("Error al refrescar el perfil después de guardar:", error);
          } finally {
            setModoEdicion(false);
          }
        })
        .catch((error) => {
          console.error("Error al guardar los datos del perfil:", error);
        });
    }
  };

  const cerrarSesion = async () => {
    try {
      await AsyncStorage.removeItem("token");
      router.replace("/unAuth"); // Cambiado para apuntar a la ruta correcta
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!profileInfo) {
    return (
      <View style={styles.errorContainer}>
        <Text>No se pudo cargar el perfil. Intenta nuevamente.</Text>
      </View>
    );
  }

  const isLoggedUserProfile = loggedInUserId === profileInfo.user._id;

  const postImageSize = screenWidth / 3 - 15;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Image
            source={{
              uri:
                profileInfo.user.profilePicture ||
                "https://i.pinimg.com/736x/79/8f/bf/798fbf62ba74a844ceeef90b83c76e59.jpg",
            }}
            style={styles.profilePicture}
          />
          <View style={styles.headerInfo}>
            <View style={styles.usernameRow}>
              <Text style={styles.username}>{profileInfo.user.username}</Text>
              <TouchableOpacity onPress={cerrarSesion} style={styles.logoutButton}>
                <Text style={styles.logoutText}>Cerrar Sesión</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.description}>
              {profileInfo.user.description || "Sin descripción"}
            </Text>
            {isLoggedUserProfile && (
              <TouchableOpacity onPress={alternarEdicion}>
                <Text style={styles.editButton}>Edit Profile</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.stats}>
          <Text>{profileInfo.posts ? profileInfo.posts.length : 0} Posts</Text>
          <Text>{profileInfo.user.friends ? profileInfo.user.friends.length : 0} Friends</Text>
        </View>

        <View style={styles.postsContainer}>
          {Array.isArray(profileInfo.posts) && profileInfo.posts.length > 0 ? (
            <View style={styles.gridContainer}>
              {profileInfo.posts.map((post, index) => (
                <Image
                  key={index}
                  source={{
                    uri: `http://192.168.1.11:3001/${post.imageUrl.replace(/\\/g, "/")}`,
                  }}
                  style={{
                    width: postImageSize,
                    height: postImageSize,
                    margin: 4,
                    borderRadius: 4,
                    backgroundColor: "#eee",
                  }}
                />
              ))}
            </View>
          ) : (
            <Text style={styles.noPostsText}>No hay publicaciones.</Text>
          )}
        </View>
      </ScrollView>

      <Modal visible={modoEdicion} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Perfil</Text>
            <TextInput
              style={styles.input}
              value={profileInfo?.user?.username || ""}
              onChangeText={(text) =>
                setProfileInfo({
                  ...profileInfo,
                  user: { ...profileInfo.user, username: text },
                })
              }
              placeholder="Username"
            />
            <TextInput
              style={styles.input}
              value={profileInfo?.user?.description || ""}
              onChangeText={(text) =>
                setProfileInfo({
                  ...profileInfo,
                  user: { ...profileInfo.user, description: text },
                })
              }
              placeholder="Description"
            />
            <TextInput
              style={styles.input}
              value={profileInfo?.user?.profilePicture || ""}
              onChangeText={(text) =>
                setProfileInfo({
                  ...profileInfo,
                  user: { ...profileInfo.user, profilePicture: text },
                })
              }
              placeholder="Profile Picture URL"
            />
            <TouchableOpacity onPress={manejarGuardar}>
              <Text style={styles.saveButton}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={alternarEdicion}>
              <Text style={styles.cancelButton}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", padding: 16 },
  profilePicture: { width: 80, height: 80, borderRadius: 40, marginRight: 16 },
  headerInfo: { flex: 1 },
  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  username: { fontSize: 18, fontWeight: "bold", marginRight: 8 },
  logoutButton: {
    backgroundColor: "red",
    borderRadius: 5,
    padding: 5,
  },
  logoutText: { color: "white", fontWeight: "bold" },
  description: { fontSize: 14, color: "gray", marginTop: 8 },
  editButton: { color: "blue", marginTop: 8 },
  stats: { flexDirection: "row", justifyContent: "space-around", padding: 16 },
  postsContainer: {
    padding: 10,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 10,
    padding: 8,
  },
  saveButton: {
    color: "white",
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    textAlign: "center",
    width: "100%",
    marginTop: 10,
  },
  cancelButton: {
    color: "white",
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    textAlign: "center",
    width: "100%",
    marginTop: 10,
  },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  noPostsText: { textAlign: "center", fontSize: 16, color: "gray", marginTop: 20 },
});

export default Profile;
