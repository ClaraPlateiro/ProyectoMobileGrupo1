import ProfileCard from "./ProfileCard";

const Profile = ({ profileInfo }) => {
    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            {/* Información del usuario */}
            <View style={{ padding: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                    {profileInfo.user.username}
                </Text>
                <Text style={{ color: "#888" }}>{profileInfo.user.description}</Text>
            </View>

            {/* Publicaciones */}
            <ProfileCard posts={profileInfo.posts} />
        </View>
    );
};
