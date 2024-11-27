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

const Profile = () => {
  const [profileInfo, setProfileInfo] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  const screenWidth = Dimensions.get("window").width;
  const imageSize = screenWidth / 3 - 2;

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
        .then((updatedProfile) => {
          setProfileInfo(updatedProfile);
          setModoEdicion(false);
        })
        .catch((error) => {
          console.error("Error al guardar los datos del perfil:", error);
        });
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Image
            source={{
              uri: profileInfo.user.profilePicture ||
                "https://i.pinimg.com/736x/79/8f/bf/798fbf62ba74a844ceeef90b83c76e59.jpg",
            }}
            style={styles.profilePicture}
          />
          <View>
            <Text style={styles.username}>{profileInfo.user.username}</Text>
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

        {/* Contenedor con imágenes en cuadrícula */}
        <View style={styles.postsContainer}>
          {profileInfo.posts.map((post, index) => (
            <Image
              key={index}
              source={{
                uri: `http://192.168.1.11:3001/${post.imageUrl.replace(/\\/g, "/")}`,
              }}
              style={[styles.postImage, { width: imageSize, height: imageSize }]}
            />
          ))}
        </View>
      </ScrollView>

      <Modal visible={modoEdicion} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.input}
            value={profileInfo.user.username}
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
            value={profileInfo.user.description}
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
            value={profileInfo.user.profilePicture}
            onChangeText={(text) =>
              setProfileInfo({
                ...profileInfo,
                user: { ...profileInfo.user, profilePicture: text },
              })
            }
            placeholder="Profile Picture URL"
          />
          <TouchableOpacity onPress={manejarGuardar}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", padding: 16 },
  profilePicture: { width: 80, height: 80, borderRadius: 40, marginRight: 16 },
  username: { fontSize: 18, fontWeight: "bold" },
  description: { fontSize: 14, color: "gray", marginTop: 8 },
  editButton: { color: "blue", marginTop: 8 },
  stats: { flexDirection: "row", justifyContent: "space-around", padding: 16 },
  postsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  postImage: {
    margin: 1,
    borderRadius: 4,
    backgroundColor: "#eee",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "white",
    padding: 20,
  },
  input: { borderBottomWidth: 1, marginBottom: 10, padding: 8 },
  saveButton: { color: "blue", textAlign: "center", marginTop: 10 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default Profile;
