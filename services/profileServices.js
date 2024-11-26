import AsyncStorage from "@react-native-async-storage/async-storage";

const localhost = `192.168.1.11`;

export const getProfileId = async (id) => {
    const token = await AsyncStorage.getItem("token");
    try {
        const response = await fetch(
            `http://${localhost}:3001/api/user/profile/${id}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error.message);
    }
};

//Editar el perfil
export const saveUserProfile = async (username, description, profilePicture) => {
    try {
        const response = await fetch(
            `http://${localhost}:3001/api/user/profile/edit`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    username, description, profilePicture
                }),
            }
        );
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error en la solicitud:", error);
        throw error; // Lanza el error para que pueda ser manejado por el llamador
    }
};

export const followUser = async (userId) => {
    try {
        const response = await fetch(
            `http://${localhost}:3001/api/user/add-friend/${userId}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        if (!response.ok) {
            console.log("Error al seguir al usuario");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al seguir al usuario:", error);
    }
};

export const unfollowUser = async (userId) => {
    try {
        const response = await fetch(
            `http://${localhost}:3001/api/user/remove-friend/${userId}`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        if (!response.ok) {
            console.log("Error al dejar de seguir al usuario");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al dejar de seguir al usuario:", error);
    }
}