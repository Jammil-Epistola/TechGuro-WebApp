import React, { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { Award, Pencil } from "lucide-react";

const ProfileSection = () => {
    const { user, setUser } = useUser();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [profileIcon, setProfileIcon] = useState("avatar_default.png");
    const [loading, setLoading] = useState(false);
    const [milestoneCount, setMilestoneCount] = useState(0);
    const [setTotalMilestones] = useState(0);

    const PROFILE_ICON_URLS = {
        "avatar_default.png": "https://res.cloudinary.com/ddnf1lqu6/image/upload/v1761242991/avatar_default_nblkb8.png",
        "avatar_img1.png": "https://res.cloudinary.com/ddnf1lqu6/image/upload/v1761243138/avatar_img1_qhi4wq.png",
        "avatar_img2.png": "https://res.cloudinary.com/ddnf1lqu6/image/upload/v1761243141/avatar_img2_jws4qs.png",
        "avatar_img3.png": "https://res.cloudinary.com/ddnf1lqu6/image/upload/v1761243145/avatar_img3_x37qzk.png",
        "avatar_img4.png": "https://res.cloudinary.com/ddnf1lqu6/image/upload/v1761243141/avatar_img4_fiesak.png",
        "avatar_img5.png": "https://res.cloudinary.com/ddnf1lqu6/image/upload/v1761243141/avatar_img5_fwbncb.png",
        "avatar_img6.png": "https://res.cloudinary.com/ddnf1lqu6/image/upload/v1761243184/avatar_img6_eudbg9.png",
        "avatar_img7.png": "https://res.cloudinary.com/ddnf1lqu6/image/upload/v1761243188/avatar_img7_eu5mwt.png",
        "avatar_img8.png": "https://res.cloudinary.com/ddnf1lqu6/image/upload/v1761243188/avatar_img8_eh1nyc.png",
        "avatar_img9.png": "https://res.cloudinary.com/ddnf1lqu6/image/upload/v1761243188/avatar_img9_lphd1n.png",
    };

    const profileIcons = Object.keys(PROFILE_ICON_URLS);

    // Helper function to get the correct Cloudinary URL
    const getProfileIconUrl = (iconName) => {
        // If it's already a full URL (from database after saving), use it
        if (iconName?.startsWith("http")) {
            return iconName;
        }
        // Otherwise, get from our mapping
        return PROFILE_ICON_URLS[iconName] || PROFILE_ICON_URLS["avatar_default.png"];
    };

    // Initialize form state when user changes
    useEffect(() => {
        if (user) {
            setUsername(user.username || "");
            setBio(user.bio || "");
            setProfileIcon(user.profile_icon || "avatar_default.png");
        }
    }, [user]);

    // Fetch milestone data dynamically
    useEffect(() => {
        const fetchMilestoneData = async () => {
            if (!user?.user_id) return;

            try {
                const [earnedRes, allRes] = await Promise.all([
                    fetch(`http://localhost:8000/milestones/earned/${user.user_id}`),
                    fetch(`http://localhost:8000/milestones/${user.user_id}`)
                ]);

                if (earnedRes.ok && allRes.ok) {
                    const earnedData = await earnedRes.json();
                    const allData = await allRes.json();

                    setMilestoneCount(Array.isArray(earnedData) ? earnedData.length : 0);
                    setTotalMilestones(Array.isArray(allData) ? allData.length : 0);
                }
            } catch (error) {
                console.error("Error fetching milestone data:", error);
            }
        };

        fetchMilestoneData();
    }, [user?.user_id]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const profileIconUrl = getProfileIconUrl(profileIcon);
            
            const response = await fetch(`http://localhost:8000/user/update/${user.user_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    username, 
                    bio, 
                    profile_icon: profileIconUrl  // Send full URL
                }),
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
            <div className="relative flex items-start sm:items-center bg-[#F9F8FE] border-[1.5px] border-[#6B708D] p-4 sm:p-6 rounded-lg mb-8">
                {/* Profile Info Section*/}
                <div className="flex gap-3 sm:gap-6 items-start sm:items-center flex-1">
                    {/* Profile Image  */}
                    <img
                        src={getProfileIconUrl(user?.profile_icon || "avatar_default.png")}
                        alt="User Avatar"
                        className="w-20 h-20 sm:w-28 sm:h-28 md:w-35 md:h-35 rounded-full object-cover border border-black flex-shrink-0"
                    />

                    {/* User Details */}
                    <div className="flex-1 min-w-0">
                        <h2 className="text-[18px] sm:text-[26px] md:text-[32px] font-bold break-words">
                            {user?.username || "User"}
                        </h2>
                        <p className="text-[13px] sm:text-[18px] md:text-[23px] break-all">
                            <span className="font-semibold">Email:</span> {user?.email || "No Email"}
                        </p>
                        <p className="text-[13px] sm:text-[18px] md:text-[23px] break-words">
                            <span className="font-semibold">Bio:</span> {user?.bio || "Welcome to TechGuro!"}
                        </p>
                    </div>
                </div>

                {/* Edit Button */}
                <button
                    className="absolute top-2 right-2 sm:top-3 sm:right-3 border border-black p-2 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-md font-semibold text-[16px] sm:text-[18px] md:text-[20px] hover:bg-gray-200 transition-colors flex items-center gap-2"
                    onClick={() => setIsModalOpen(true)}
                >
                    <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Edit Profile</span>
                </button>

                {/* Milestone Counter */}
                <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 flex items-center gap-1.5 sm:gap-2 bg-white px-3 py-1.5 sm:px-4 sm:py-2 md:px-5.5 md:py-2.5 rounded-full border border-gray-300 shadow-md">
                    <Award className="w-5 h-5 sm:w-7 sm:h-7 md:w-9 md:h-9 text-yellow-500" />
                    <span className="font-semibold text-[16px] sm:text-[20px] md:text-[24px]">
                        {milestoneCount}
                    </span>
                </div>
            </div>

            {/* Modal  */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-100 p-4">
                    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-[600px] relative max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg sm:text-xl font-bold mb-4">Edit Profile</h3>

                        <div className="flex flex-col items-center gap-4">
                            {/* ✅ Current selected icon - Use helper function */}
                            <img
                                src={getProfileIconUrl(profileIcon)}
                                alt="Profile"
                                className="w-28 h-28 sm:w-40 sm:h-40 rounded-full border-2 border-gray-300"
                            />

                            {/* ✅ Selectable Icons - Use helper function */}
                            <div className="grid grid-cols-5 gap-2 sm:gap-3 mt-2">
                                {profileIcons.map((icon) => (
                                    <img
                                        key={icon}
                                        src={getProfileIconUrl(icon)}
                                        alt={icon}
                                        className={`w-16 h-16 sm:w-20 sm:h-20 md:w-27 md:h-27 rounded-full cursor-pointer border-2 ${
                                            profileIcon === icon ? "border-blue-500" : "border-transparent"
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
                                className="w-full p-2 border rounded mb-2 text-sm sm:text-base"
                                placeholder="Username"
                                maxLength={20}
                            />
                            <p className="text-xs sm:text-sm text-gray-500 mt-1 text-right">
                                {username.length}/20
                            </p>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="w-full p-2 border rounded text-sm sm:text-base"
                                placeholder="Bio"
                                maxLength={65}
                                rows={3}
                            />
                            <p className="text-xs sm:text-sm text-gray-500 mt-1 text-right">
                                {bio.length}/65
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-300 rounded font-semibold hover:bg-gray-400 text-sm sm:text-base"
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-500 text-white rounded font-semibold hover:bg-blue-600 text-sm sm:text-base"
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