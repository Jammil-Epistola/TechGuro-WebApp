import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loadingMilestones, setLoadingMilestones] = useState(false);

  const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:8000";

  // Fetch milestones when user is set
  useEffect(() => {
    const fetchMilestones = async () => {
      if (!user?.user_id) return;
      setLoadingMilestones(true);
      try {
        const res = await fetch(`${API_BASE}/milestones/${user.user_id}`);
        if (!res.ok) throw new Error("Failed to fetch milestones");
        const data = await res.json();
        setUser(prev => ({ ...prev, milestones: data }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMilestones(false);
      }
    };
    fetchMilestones();
  }, [user?.user_id, API_BASE]);

  // Persist user to localStorage
  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  const login = (userData) => {
    const normalized = {
      user_id: userData.user_id,
      username: userData.username || "",
      email: userData.email || "",
      bio: userData.bio || "",
      profile_icon: userData.profile_icon || "avatar_default.png",
      milestones: userData.milestones || [],
    };
    setUser(normalized);
    localStorage.setItem("user", JSON.stringify(normalized));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const contextValue = {
    user,
    setUser,
    login,
    logout,
    loadingMilestones
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

const useUser = () => useContext(UserContext);
export { useUser };