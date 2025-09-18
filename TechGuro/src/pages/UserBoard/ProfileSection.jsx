import React, { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { Award } from "lucide-react";

const ProfileSection = () => {
    const { user, setUser } = useUser();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [profileIcon, setProfileIcon] = useState("avatar_default.png");
    const [loading, setLoading] = useState(false);

    const profileIcons = [
        "avatar_default.png",
        "avatar_img1.png",
        "avatar_img2.png",
        "avatar_img3.png",
        "avatar_img4.png",
        "avatar_img5.png",
        "avatar_img6.png",
        "avatar_img7.png",
        "avatar_img8.png",
        "avatar_img9.png",
    ];

    // Initialize form state when user changes
    useEffect(() => {
        if (user) {
            setUsername(user.username || "");
            setBio(user.bio || "");
            setProfileIcon(user.profile_icon || "avatar_default.png");
        }
    }, [user]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/user/update/${user.user_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, bio, profile_icon: profileIcon }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Error: ${errorData.detail}`);
                setLoading(false);
                return;
            }

            const data = await response.json();
            
            // Update user context with fresh data from backend
            const updatedUser = {
                ...user,
                username: data.user.username,
                bio: data.user.bio,
                profile_icon: data.user.profile_icon,
            };
            
            setUser(updatedUser);
            
            // Also update localStorage directly to ensure persistence
            localStorage.setItem("user", JSON.stringify(updatedUser));

            setIsModalOpen(false);
        } catch (err) {
            console.error(err);
            alert("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    // Reset form when modal is canceled
    const handleCancel = () => {
        if (user) {
            setUsername(user.username || "");
            setBio(user.bio || "");
            setProfileIcon(user.profile_icon || "avatar_default.png");
        }
        setIsModalOpen(false);
    };

    return (
        <>
            {/* Profile Card */}
            <div className="relative flex items-center justify-between bg-[#F9F8FE] border-[1.5px] border-[#6B708D] p-6 rounded-lg mb-8">
                <div className="flex gap-6 items-center">
                    <img
                        src={`/images/profile_icons/${user?.profile_icon || "avatar_default.png"}`}
                        alt="User Avatar"
                        className="w-35 h-35 rounded-full object-cover border border-black"
                    />
                    <div>
                        <h2 className="text-[32px] font-bold">{user?.username || "User"}</h2>
                        <p className="text-[23px]"><span className="font-semibold">Email:</span> {user?.email || "No Email"}</p>
                        <p className="text-[23px]"><span className="font-semibold">Bio:</span> {user?.bio || "Welcome to TechGuro!"}</p>
                    </div>
                </div>

                {/* Edit Button */}
                <button
                    className="absolute top-3 right-3 border border-black px-6 py-3 rounded-md font-semibold text-[20px] hover:bg-gray-200"
                    onClick={() => setIsModalOpen(true)}
                >
                    Edit Profile
                </button>

                {/* Milestone Counter */}
                <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-white px-5.5 py-2.5 rounded-full border border-gray-300 shadow-md">
                    <Award className="w-9 h-9 text-yellow-500" />
                    <span className="font-semibold text-[24px]">
                        {user?.milestones?.filter(m => m.status === "earned").length || 0}
                    </span>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-100">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-[600px] relative"> {/* Wider modal */}
                        <h3 className="text-xl font-bold mb-4">Edit Profile</h3>

                        <div className="flex flex-col items-center gap-4">
                            {/* Current Icon */}
                            <img
                                src={`/images/profile_icons/${profileIcon}`}
                                alt="Profile"
                                className="w-40 h-40 rounded-full border-2 border-gray-300"
                            />

                            {/* Selectable Icons */}
                            <div className="grid grid-cols-5 gap-3 mt-2"> {/* Slightly more gap */}
                                {profileIcons.map((icon) => (
                                    <img
                                        key={icon}
                                        src={`/images/profile_icons/${icon}`}
                                        alt={icon}
                                        className={`w-27 h-27 rounded-full cursor-pointer border-2 ${profileIcon === icon ? "border-blue-500" : "border-transparent"
                                            }`}
                                        onClick={() => setProfileIcon(icon)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Inputs */}
                        <div className="mt-4">
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full p-2 border rounded mb-2"
                                placeholder="Username"
                                maxLength={20} // Limit to 20 characters
                            />
                            <p className="text-sm text-gray-500 mt-1 text-right">
                                {username.length}/20
                            </p>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="w-full p-2 border rounded"
                                placeholder="Bio"
                                maxLength={65}
                            />
                            <p className="text-sm text-gray-500 mt-1 text-right">
                                {bio.length}/65
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                className="px-4 py-2 bg-gray-300 rounded font-semibold hover:bg-gray-400"
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-500 text-white rounded font-semibold hover:bg-blue-600"
                                onClick={handleSave}
                                disabled={loading}
                            >
                                {loading ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProfileSection;