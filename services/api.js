import AsyncStorage from "@react-native-async-storage/async-storage";

const localhost = `10.13.167.3`;

export const getFeed = async () => {
  const token = await AsyncStorage.getItem("token");
  try {
    const request = await fetch(`http://${localhost}:3001/api/posts/feed`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    // Si la solicitud no es exitosa, lanzamos un error
    if (!request.ok) {
      throw new Error("Error al obtener el feed");
    }
    // Parseamos la respuesta como JSON
    const data = await request.json();
    // Devolvemos los datos para que puedan ser utilizados en el frontend
    return data;
  } catch (error) {
    console.error("Error en getFeed:", error);
    throw error; // Re-lanzar el error para que pueda ser manejado en la llamada
  }
};

export const getAllUsers = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await fetch(`http://${localhost}:3001/api/user/all`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error.message);
  }
};
