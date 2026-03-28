import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [authReady, setAuthReady] = useState(false);

	const fetchUserData = async (token: string) => {
		try {
			const response = await fetch("http://localhost:8081/users/me", {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!response.ok) throw new Error("Failed to fetch user data");
			const userData = await response.json();
			setUser(userData);
		} catch (error) {
			console.error("Error fetching user data:", error);
			localStorage.removeItem("token");
			setUser(null);
		} finally {
			setAuthReady(true);
		}
	};

	const login = async (token: string) => {
		localStorage.setItem("token", token);
		await fetchUserData(token);
	};

	const logout = () => {
		localStorage.removeItem("token");
		setUser(null);
	};

	const refreshUser = async () => {
		const token = localStorage.getItem("token");
		if (token) await fetchUserData(token);
	};

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) {
			setAuthReady(true);
			return;
		}
		fetchUserData(token);
	}, []);

	return (
		<AuthContext.Provider value={{ user, authReady, login, logout, refreshUser }}>
			{children}
		</AuthContext.Provider>
	);
}