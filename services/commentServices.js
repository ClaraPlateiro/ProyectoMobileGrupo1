import AsyncStorage from "@react-native-async-storage/async-storage";

const localhost = `10.166.0.136`;

// Crear un nuevo comentario
export const createComment = async (postId, content) => {
    const token = await AsyncStorage.getItem("token");
    try {
      const response = await fetch(
        `http://${localhost}:3001/api/posts/${postId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content }),
        }
      );
  
      if (!response.ok) {
        throw new Error("Error al crear el comentario");
      }
  
      const newComment = await response.json();
      return newComment;
    } catch (error) {
      console.error("Error en createComment:", error);
    }
  };
  
  // Obtener un comentario específico
  export const getComment = async (commentId) => {
    const token = await AsyncStorage.getItem("token");
    try {
      const response = await fetch(
        `http://${localhost}:3001/api/posts/comments/${commentId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (!response.ok) {
        throw new Error("Error al obtener el comentario");
      }
  
      const comment = await response.json();
      return comment;
    } catch (error) {
      console.error("Error en getComment:", error);
    }
  };
  
  // Eliminar un comentario
  export const removeComment = async (postId, commentId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `http://${localhost}:3001/api/posts/${postId}/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (!response.ok) {
        throw new Error("Error al eliminar el comentario");
      }
  
      const deletedComment = await response.json();
      return deletedComment;
    } catch (error) {
      console.error("Error en removeComment:", error);
    }
  };
