import { createContext, useContext, useState, useCallback } from "react";

// ==========================================================
// AVATAR CONTEXT
//
// Keeps the logged-in user's profile photo in sync between
// Navbar and Profile page, and scopes storage per user ID
// so different accounts never share the same photo.
// ==========================================================

const AvatarContext = createContext(null);

function storageKeyFor(userId) {
  return userId ? `profile_avatar_${userId}` : null;
}

export function AvatarProvider({ children }) {
  const [avatarUrl, setAvatarUrlState] = useState(null);
  const [userId, setUserIdState] = useState(null);

  // Call this once you know which user is logged in
  // (e.g. after fetching /users/me). Loads that user's
  // saved avatar, if any.
  const setUserId = useCallback((id) => {
    setUserIdState(id);

    const key = storageKeyFor(id);

    if (key) {
      const stored = localStorage.getItem(key);
      setAvatarUrlState(stored || null);
    } else {
      setAvatarUrlState(null);
    }
  }, []);

  // Pass a data URL to save/update, or null to remove.
  const setAvatar = useCallback(
    (dataUrl) => {
      setAvatarUrlState(dataUrl);

      const key = storageKeyFor(userId);

      if (!key) return;

      if (dataUrl) {
        localStorage.setItem(key, dataUrl);
      } else {
        localStorage.removeItem(key);
      }
    },
    [userId]
  );

  return (
    <AvatarContext.Provider value={{ avatarUrl, setAvatar, setUserId }}>
      {children}
    </AvatarContext.Provider>
  );
}

export function useAvatar() {
  const ctx = useContext(AvatarContext);

  if (!ctx) {
    throw new Error("useAvatar must be used within an AvatarProvider");
  }

  return ctx;
}