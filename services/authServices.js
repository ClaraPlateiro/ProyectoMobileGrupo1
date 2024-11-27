import AsyncStorage from "@react-native-async-storage/async-storage";

const localhost = `10.166.0.136`;

export const postLogin = async (email, password) => {
    const request = await fetch(`http://${localhost}:3001/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    if (!request.ok) {
        throw new Error("Credenciales Incorrectass");
    }
    const data = await request.json();
    AsyncStorage.setItem("token", data.token);
    return data;
};

export const postSingin = async (username, email, password) => {
    const request = await fetch(`http://${localhost}:3001/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
    });
    const data = await request.json();
    return data;
};