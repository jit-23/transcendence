import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { useTheme } from "./ThemeContext";
import { Avatar } from "./Avatar";
import { CanvasesCard } from "./components/dashboard/CanvasesCard";

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
        const res = await fetch(`http://localhost:8081/canvases/${canvasId}/collaborators`, {
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
            const res = await fetch("http://localhost:8081/canvases", {
                headers: authHeader(),
            });
            const data = await res.json();
            if (!res.ok) {
                setCanvasesError(data.error || "Failed to load canvases");
                setCanvases([]);
            } else {
                setCanvases(data);
            }
        } catch {
            setCanvasesError("Network error while loading canvases");
            setCanvases([]);
        } finally {
            setCanvasesLoading(false);
        }
    };

      const fetchFriends = async () => {
        setFriendsLoading(true);
        setFriendsError(null);
        try {
          const res = await fetch("http://localhost:8081/users/friends", {
            headers: authHeader(),
          });
          const data = await res.json();
          if (!res.ok) {
            setFriendsError(data.error || "Failed to load friends");
            setFriends([]);
          } else {
            setFriends(data);
          }
        } catch {
          setFriendsError("Network error while loading friends");
          setFriends([]);
        } finally {
          setFriendsLoading(false);
        }
      };

    const handleAddCanvas = async (name: string): Promise<boolean> => {
        setCanvasesError(null);
        try {
			const res = await fetch("http://localhost:8081/canvases", {
				method: "POST",
                headers: authHeader(),
                body: JSON.stringify({ name: name.trim() || `Canvas ${canvases.length + 1}` }),
            });
            const data = await res.json();
            if (!res.ok) {
				setCanvasesError(data.error || "Failed to create canvas");
          return false;
            }
            setCanvases(prev => [...prev, data]);
        return true;
        } catch {
			setCanvasesError("Network error while creating canvas");
        return false;
        }
    };

    const handleDeleteCanvas = async (canvasId: number) => {
        setCanvasesError(null);
        try {
            const res = await fetch(`http://localhost:8081/canvases/${canvasId}`, {
                method: "DELETE",
                headers: authHeader(),
            });
            const data = await res.json();
            if (!res.ok) {
                setCanvasesError(data.error || "Failed to delete canvas");
                return;
            }
            setCanvases(prev => prev.filter(canvas => canvas.id !== canvasId));
        } catch {
            setCanvasesError("Network error while deleting canvas");
        }
    };

      const handleInviteFriend = async (canvasId: number, friendId: number) => {
        setInviteError(null);
        setInvitingFriendId(friendId);
        try {
          const res = await fetch(`http://localhost:8081/canvases/${canvasId}/collaborators`, {
            method: "POST",
            headers: authHeader(),
            body: JSON.stringify({ friendId }),
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || "Failed to invite friend");
          }

          setInviteCanvasId(canvasId);
        } catch (err: any) {
          setInviteError(err.message || "Failed to invite friend");
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
		  <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
			{theme === "dark" ? "☀" : "☾"}
		  </button>
		</div>
	  </header>

	  <main className="dashboard-body">
		<div className="page-title fade-up">
		  <h1>Plan Your Group Projects</h1>
		  <p>Create canvases for project planning and collaboration.</p>
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
			<h3>Chat Rooms</h3>
		  </div>
		  <p style={{ color: "var(--ink2)", marginBottom: 10, fontSize: "0.82rem" }}>
			Use canvases to sketch, plan, and organize group work.
		  </p>
		  <div style={{ display: "flex", gap: 8 }}>
			<button className="btn btn-ghost" onClick={() => navigate("/groups")}>Chat Room</button>
		  </div>
		</div>
	  </main>
	</div>
  );
}
