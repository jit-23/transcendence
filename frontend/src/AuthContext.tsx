import { createContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

// export const AuthContext = createContext(null);
interface User {
	id: number;
	name: string;
	email: string;
	twoFactorEnabled: boolean;
	avatar?: string | null;
}

interface AuthContextType {
	user: User | null;
	authReady: boolean;
	login: (token: string) => Promise<void>;
	logout: () => void;
	refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
	user: null,
	authReady: false,
	login: async () => {},
	logout: () => {},
	refreshUser: async () => {},
});

export function AuthProvider({ children }) {
	const [user, setUser]         = useState<User | null>(null);
	const [authReady, setAuthReady] = useState(false);
	const presenceSocketRef = useRef<Socket | null>(null);

		const fetchUserData = async (token: string) => {
			try {
				const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
				const response = await fetch(`${apiUrl}/users/me`, { 
					headers: { Authorization: `Bearer ${token}` },
			});
			if (!response.ok) throw new Error("Failed to fetch user data");
			const userData = await response.json();
			setUser(userData);
		} catch (error) {
			console.error("Error fetching user data:", error);
			sessionStorage.removeItem("token");
			setUser(null);
	} finally {
			setAuthReady(true);
		}
	};

	const login = async (token: string) => {
		sessionStorage.setItem("token", token);
		await fetchUserData(token);
	};

	const logout = () => {
		sessionStorage.removeItem("token");
		setUser(null);
	};

	const refreshUser = async () => {  // checa o token e atualiza os dados do usuário, útil para manter a sessão ativa
		const token = sessionStorage.getItem("token");
		if (token) 
			await fetchUserData(token);
	};

	useEffect(() => { // e para renovar o token
		const token = sessionStorage.getItem("token");
		if (!token) {
			setAuthReady(true);
			return;
		}
		fetchUserData(token);
	}, []);

	useEffect(() => {
		if (!user?.name) {
			if (presenceSocketRef.current) {
				presenceSocketRef.current.disconnect();
				presenceSocketRef.current = null;
			}
			return;
		}

		const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
		const socket = io(apiUrl, {
			auth: { username: user.name },
			withCredentials: true,
		});

		presenceSocketRef.current = socket;

		return () => {
			socket.disconnect();
			if (presenceSocketRef.current === socket) {
				presenceSocketRef.current = null;
			}
		};
	}, [user?.name]);

	return (
		<AuthContext.Provider value={{ user, authReady, login, logout, refreshUser }}>
			{children}
		</AuthContext.Provider>
	);
}