import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Alert, TextInput, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useToken } from "@/context/TokenContext";


const localhost = `192.168.1.11`;


export default function FormularioScreen() {
    const [image, setImage] = useState(null);
    const [caption, setCaption] = useState('');
    const { token } = useToken();


    const seleccionarDeGaleria = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const tomarFoto = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('Se requiere acceso a la cámara');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleUpload = async () => {
        if (!image) {
            Alert.alert('Por favor selecciona una imagen primero');
            return;
        }

        // Get the filename from the image URI
        const imageUriParts = image.split('/');
        const filename = imageUriParts[imageUriParts.length - 1];

        const formData = new FormData();
        formData.append('image', {
            uri: image,
            name: filename,
            type: 'image/jpeg'
        });
        formData.append('caption', caption);

        try {
            const response = await fetch(`http://${localhost}:3001/api/posts/upload`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                Alert.alert('Publicación creada exitosamente');
                setImage(null);
                setCaption('');
                router.back();
            } else {
                const errorData = await response.json();
                Alert.alert('Error al crear publicación', errorData.message);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error de red', 'No se pudo conectar con el servidor');
        }
    };


    return (
        <View style={styles.container}>
            <View style={styles.buttonGroup}>
                <TouchableOpacity style={styles.button} onPress={seleccionarDeGaleria}>
                    <Text style={styles.buttonText}>Añadir imagen</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={tomarFoto}>
                    <Text style={styles.buttonText}>Sacar foto</Text>
                </TouchableOpacity>
            </View>

            {image && (
                <Image
                    title="image"
                    source={{ uri: image }}
                    style={styles.imagePreview}
                />
            )}

            <TextInput
                placeholder="Escribe un caption..."
                value={caption}
                onChangeText={setCaption}
                style={styles.captionInput}
            />

            <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
                <Text style={styles.buttonText}>Subir publicación</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
    },
    button: {
        marginTop: 60,
        backgroundColor: '#007bff',
        padding: 12,
        borderRadius: 8,
        width: '48%',
        alignItems: 'center',
    },
    uploadButton: {
        backgroundColor: '#28a745',
        padding: 15,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        marginBottom: 90,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    imagePreview: {
        width: '80%',
        aspectRatio: 4 / 3,
        borderRadius: 10,
        marginVertical: 10,
        resizeMode: 'cover',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    captionInput: {
        width: '100%',
        borderColor: '#ccc',
        borderWidth: 1,
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
        backgroundColor: '#fff',
    }
});