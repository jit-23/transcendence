import { useContext, useEffect, useState, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { useTheme } from "./ThemeContext";
import { Avatar } from "./Avatar";
import { CanvasesCard } from "./components/dashboard/CanvasesCard";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./components/i18n";

type Canvas = {
  id: number;
  name: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  isOwner?: boolean;
};

type Friend = {
  id: number;
  name: string;
  email: string;
};

export function CanvasesPage() {
  const {t} = useTranslation();
  const { user } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [canvases, setCanvases] = useState<Canvas[]>([]);
	const [canvasesLoading, setCanvasesLoading] = useState(false);
	const [canvasesError, setCanvasesError] = useState<string | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [friendsError, setFriendsError] = useState<string | null>(null);
  const [inviteCanvasId, setInviteCanvasId] = useState<number | null>(null);
  const [invitingFriendId, setInvitingFriendId] = useState<number | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const [groupIntegrators, setGroupIntegrators] = useState<Friend[]>([]);


    const authHeader = () => ({
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        "Content-Type": "application/json",
    });
	
    const groupChat = async (canvasId: number) => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
        const res = await fetch(`${apiUrl}/canvases/${canvasId}/collaborators`, {
          headers: authHeader(),
        });
        if (!res.ok)
          return ;
        const data = await res.json();
        const merged = [
        { ...data.owner, role: "owner" as const },
        ...data.collaborators.map((u: any) => ({ id: u.id, name: u.name, email: u.email, role: "collaborator" as const })),
        ];
        
        setGroupIntegrators(merged);

      } catch (error) {
        console.error("Error fetching group chats:", error);
      }
    }

    const fetchCanvases = async () => {
        setCanvasesLoading(true);
        setCanvasesError(null);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
            const res = await fetch(`${apiUrl}/canvases`, {
                headers: authHeader(),
            });
            const data = await res.json();
            if (!res.ok) {
                setCanvasesError(data.error || t("CVS_failed_load_cvs"));
                setCanvases([]);
            } else {
                setCanvases(data);
            }
        } catch {
            setCanvasesError(t("CVS_network_fail_load_cvs"));
            setCanvases([]);
        } finally {
            setCanvasesLoading(false);
        }
    };

      const fetchFriends = async () => {
        setFriendsLoading(true);
        setFriendsError(null);
        try {
          const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
          const res = await fetch(`${apiUrl}/users/friends`, {
            headers: authHeader(),
          });
          const data = await res.json();
          if (!res.ok) {
            setFriendsError(data.error || t("CVS_failed_load_friends"));
            setFriends([]);
          } else {
            setFriends(data);
          }
        } catch {
          setFriendsError(t("CVS_network_fail_load_friends"));
          setFriends([]);
        } finally {
          setFriendsLoading(false);
        }
      };

    const handleAddCanvas = async (name: string): Promise<boolean> => {
        setCanvasesError(null);
        try {
			const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
			const res = await fetch(`${apiUrl}/canvases`, {
				method: "POST",
                headers: authHeader(),
                body: JSON.stringify({ name: name.trim() || `Canvas ${canvases.length + 1}` }),
            });
            const data = await res.json();
            if (!res.ok) {
				setCanvasesError(data.error || t("CVS_failed_create"));
          return false;
            }
            setCanvases(prev => [...prev, data]);
        return true;
        } catch {
			setCanvasesError(t("CVS_network_fail_create"));
        return false;
        }
    };

    const handleDeleteCanvas = async (canvasId: number) => {
        setCanvasesError(null);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
            const res = await fetch(`${apiUrl}/canvases/${canvasId}`, {
                method: "DELETE",
                headers: authHeader(),
            });
            const data = await res.json();
            if (!res.ok) {
                setCanvasesError(data.error || t("CVS_failed_delete"));
                return;
            }
            setCanvases(prev => prev.filter(canvas => canvas.id !== canvasId));
        } catch {
            setCanvasesError(t("CVS_network_fail_delete"));
        }
    };

      const handleInviteFriend = async (canvasId: number, friendId: number) => {
        setInviteError(null);
        setInvitingFriendId(friendId);
        try {
          const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
          const res = await fetch(`${apiUrl}/canvases/${canvasId}/collaborators`, {
            method: "POST",
            headers: authHeader(),
            body: JSON.stringify({ friendId }),
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || t("CVS_failed_invite"));
          }

          setInviteCanvasId(canvasId);
        } catch (err: any) {
          setInviteError(err.message || t("CVS_network_fail_invite"));
        } finally {
          setInvitingFriendId(null);
        }
      };

      const handleOpenCanvas = (canvasId: number) => {
        navigate(`/canvas?id=${canvasId}`);
      };

      useEffect(() => {
        
        fetchCanvases();
        fetchFriends();
        const canvasId = Number(new URLSearchParams(window.location.search).get("id"));
        if (!Number.isInteger(canvasId) || canvasId <= 0)
          return;
        groupChat(canvasId);
      }, []);



  return (
	<div className="dashboard-shell">
	  <header className="topbar">
		<div className="logo">
		  <div className="logo-mark">W</div>
		  whiteboard
		</div>

		<div className="topbar-right">
		  <div className="user-chip">
			<Avatar avatar={user?.avatar} name={user?.name ?? "?"} size={24} />
			{user?.name}
		  </div>
		  <button className="btn btn-ghost btn-sm" onClick={() => navigate("/dashboard")}>Dashboard</button>
		  {/* <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
			{theme === "dark" ? "☀" : "☾"}
		  </button> */}
      <LanguageSwitcher />
		</div>
	  </header>

	  <main className="dashboard-body">
		<div className="page-title fade-up">
		  <h1>{t("CVS_plan_group_proj")}</h1>
		  <p>{t("CVS_create_canvas_proj")}</p>
		</div>
		 <div className="dashboard-layout">
                    <section className="dashboard-main-column">
                        <CanvasesCard
                            canvases={canvases}
                            canvasesLoading={canvasesLoading}
                          canvasesError={canvasesError}
                            onAddCanvas={handleAddCanvas}
                            onDeleteCanvas={handleDeleteCanvas}
                          onOpenCanvas={handleOpenCanvas}
                          friends={friends}
                          friendsLoading={friendsLoading}
                          friendsError={friendsError}
                          inviteCanvasId={inviteCanvasId}
                          inviteError={inviteError}
                          invitingFriendId={invitingFriendId}
                          onOpenInviteCanvas={setInviteCanvasId}
                          onInviteFriend={handleInviteFriend}/>
					</section>
			</div>
		<div className="section-card fade-up fade-up-1" style={{ maxWidth: 785 }}>
		  <div className="section-card-header" >
			<h3>{t("CVS_chat_rooms")}</h3>
		  </div>
		  <p style={{ color: "var(--ink2)", marginBottom: 10, fontSize: "0.82rem" }}>
			{t("CVS_use_canvas")}
		  </p>
		  <div style={{ display: "flex", gap: 8 }}>
			<button className="btn btn-ghost" onClick={() => navigate("/groups")}>{t("CVS_chat_room")}</button>
		  </div>
		</div>
	  </main>
	</div>
  );
}
