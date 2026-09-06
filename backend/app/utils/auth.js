export function getCurrentUser() {
    const user = localStorage.getItem("user");

    if (!user) return null;

    return JSON.parse(user);
}

export function getRole() {
    const user = getCurrentUser();

    return user ? user.role : null;
}