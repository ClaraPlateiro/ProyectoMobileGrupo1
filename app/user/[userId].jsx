import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    Dimensions,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getProfileId, followUser, unfollowUser } from "@/services/profileServices";

const UserPage = () => {
    const { userId } = useLocalSearchParams(); // ID del perfil que se está visitando
    const router = useRouter();

    const [profileInfo, setProfileInfo] = useState(null); // Información del perfil visitado
    const [loading, setLoading] = useState(true); // Carga inicial
    const [isFollowing, setIsFollowing] = useState(false); // Estado de seguimiento

    const screenWidth = Dimensions.get("window").width;
    const imageSize = screenWidth / 3 - 2;

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                if (!userId) throw new Error("No se encontró el ID del usuario visitado.");

                const profileData = await getProfileId(userId);
                setProfileInfo(profileData);

                const loggedInUserId = await AsyncStorage.getItem("userId");

                const isFriend =
                    Array.isArray(profileData.user.friends) &&
                    profileData.user.friends.some(friend => friend._id === loggedInUserId);
                setIsFollowing(isFriend);
            } catch (error) {
                console.error("Error al cargar el perfil:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [userId]);


    const toggleFollow = async () => {
        try {
            if (isFollowing) {
                await unfollowUser(userId);
                Alert.alert("Unfollowed", "Has dejado de seguir a este usuario.");
            } else {
                await followUser(userId);
                Alert.alert("Followed", "Ahora sigues a este usuario.");
            }
            setIsFollowing(!isFollowing);
        } catch (error) {
            console.error("Error al alternar el seguimiento:", error);
            Alert.alert("Error", "No se pudo realizar la acción. Intenta nuevamente.");
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
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backButton}>Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                {/* Botón para regresar */}
                <TouchableOpacity onPress={() => router.back()} style={styles.backButtonContainer}>
                    <Text style={styles.backButtonText}>← Volver</Text>
                </TouchableOpacity>

                {/* Información del perfil */}
                <View style={styles.header}>
                    <Image
                        source={{
                            uri:
                                profileInfo.user.profilePicture ||
                                "https://i.pinimg.com/736x/79/8f/bf/798fbf62ba74a844ceeef90b83c76e59.jpg",
                        }}
                        style={styles.profilePicture}
                    />
                    <View style={styles.infoContainer}>
                        <Text style={styles.username}>{profileInfo.user.username}</Text>
                        <Text style={styles.description}>
                            {profileInfo.user.description || "Sin descripción"}
                        </Text>
                        {/* Botón Follow/Unfollow */}
                        <TouchableOpacity
                            style={[
                                styles.followButton,
                                isFollowing ? styles.unfollowButton : styles.followButton,
                            ]}
                            onPress={toggleFollow}
                        >
                            <Text style={styles.followButtonText}>
                                {isFollowing ? "Unfollow" : "Follow"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.stats}>
                    <Text>{profileInfo.posts ? profileInfo.posts.length : 0} Publicaciones</Text>
                    <Text>
                        {profileInfo.user.friends ? profileInfo.user.friends.length : 0} Amigos
                    </Text>
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
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    header: { flexDirection: "row", alignItems: "center", padding: 16 },
    profilePicture: { width: 80, height: 80, borderRadius: 40, marginRight: 16 },
    username: { fontSize: 18, fontWeight: "bold" },
    description: { fontSize: 14, color: "gray", marginTop: 4 },
    stats: { flexDirection: "row", justifyContent: "space-around", padding: 16 },
    postsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    postImage: {
        margin: 1,
        borderRadius: 4,
        backgroundColor: "#eee",
    },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    errorContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    backButtonContainer: { padding: 10 },
    backButtonText: { color: "blue", fontSize: 16 },
    infoContainer: { flex: 1 },
    followButton: {
        marginTop: 10,
        padding: 10,
        borderRadius: 5,
        backgroundColor: "blue",
        alignItems: "center",
    },
    unfollowButton: {
        backgroundColor: "red",
    },
    followButtonText: { color: "white", fontWeight: "bold" },
});

export default UserPage;
