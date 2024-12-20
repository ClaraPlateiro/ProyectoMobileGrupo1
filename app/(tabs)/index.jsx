import React, { useState, useEffect } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import PostCard from "@/components/PostCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFeed, getAllUsers } from "@/services/api";
import { likePost, removeLike } from "@/services/likeServices"
import { useToken } from "@/context/TokenContext";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const { userData } = useToken();
  const [user, setUsers] = useState([]);
  const userId = userData._id;

  const fetchAllUsers = async () => {
    console.log(userData);
    try {
      const profiles = await getAllUsers();
      setUsers(profiles);
      console.log(profiles);
    } catch (error) {
      console.error("Error fetching all profiles:", error);
    }
  };

  const fetchPosts = async () => {
    try {
      const data = await getFeed();
      setPosts(data);
    } catch (error) {
      console.error("Error al obtener el feed:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
      fetchAllUsers();
    }, [])
  );

  return (
    <View style={styles.container}>
      <SafeAreaView>
      <FlatList
        data={posts}
        keyExtractor={(post) => post._id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            setPosts={setPosts}
          />
        )}
        contentContainerStyle={styles.postsContainer}
        ListEmptyComponent={() => <Text>No hay publicaciones disponibles</Text>}
      />
      </SafeAreaView>
    </View>
  );
};

export default Feed;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  postsContainer: {
    paddingBottom: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
