import AsyncStorage from "@react-native-async-storage/async-storage";

const localhost = `10.13.167.3`;

export const likePost = async (postId) => {
    const token = await AsyncStorage.getItem("token");
    try {
        const response = await fetch(
            `http://${localhost}:3001/api/posts/${postId}/like`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al dar like al post");
        }

        const data = await response.json();
        return data; // Devuelve el post actualizado con el nuevo like
    } catch (error) {
        console.error("Error en likePost:", error);
        throw error;
    }
};

export const removeLike = async (postId) => {
    const token = await AsyncStorage.getItem("token");
    try {
        const response = await fetch(
            `http://${localhost}:3001/api/posts/${postId}/like`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al remover el like del post");
        }

        const data = await response.json();
        return data; // Devuelve el post actualizado sin el like
    } catch (error) {
        console.error("Error en removeLike:", error);
        throw error;
    }
};