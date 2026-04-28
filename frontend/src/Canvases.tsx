import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { CanvasesCard } from "./components/dashboard/CanvasesCard";
import { CanvasInviteFriendsModal } from "./components/CanvasInviteFriendsModal";
import TopBar from "./components/ui/topbar";

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
          const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
          const res = await fetch(`${apiUrl}/users/friends`, {
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
			const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
			const res = await fetch(`${apiUrl}/canvases`, {
				method: "POST",
                headers: authHeader(),
                body: JSON.stringify({ name: name.trim() || `Canvas ${canvases.length + 1}` }),
            });
            const data = await res.json();
            if (!res.ok) {
				setCanvasesError(data.error || "Failed to create canvas");
          return false;
            }
            setCanvases((prev) => [
              ...prev,
              {
                ...data,
                isOwner: true,
              },
            ]);
        return true;
        } catch {
			setCanvasesError("Network error while creating canvas");
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
          const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
          const res = await fetch(`${apiUrl}/canvases/${canvasId}/collaborators`, {
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

      const handleOpenInviteCanvas = async (canvasId: number | null) => {
        if (canvasId !== null) {
          await fetchFriends();
        }
        setInviteCanvasId(canvasId);
      };

      const handleInviteFriendWithCanvas = (friendId: number) => {
        if (inviteCanvasId) {
          handleInviteFriend(inviteCanvasId, friendId);
        }
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
	  <TopBar />

      <CanvasInviteFriendsModal
        isOpen={inviteCanvasId !== null}
        onClose={() => setInviteCanvasId(null)}
        friends={friends}
        friendsLoading={friendsLoading}
        friendsError={friendsError}
        invitingFriendId={invitingFriendId}
        inviteError={inviteError}
        onInviteFriend={handleInviteFriendWithCanvas}
        onRefreshFriends={fetchFriends}
      />

	  <main className="dashboard-body">
		<div className="page-title fade-up">
		  <h1>Plan Your Group Projects</h1>
		  <p>Manage your own canvases and the canvases where you were invited.</p>
		</div>
		{(() => {
			const myCanvases = canvases.filter((canvas) => canvas.isOwner || canvas.userId === user?.id);
			const invitedCanvases = canvases.filter((canvas) => !canvas.isOwner && canvas.userId !== user?.id);

			return (
     <div className="dashboard-layout" style={{ width: "100%", maxWidth: 1200, margin: "0 auto" }}>
          <section className="dashboard-main-column" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 20, width: "100%", alignItems: "stretch" }}>
                        <CanvasesCard
                            title="My Canvases"
                            canCreateCanvas
                            canvases={myCanvases}
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
                          onOpenInviteCanvas={handleOpenInviteCanvas}
                          onInviteFriend={handleInviteFriend}/>

            <CanvasesCard
              title="Invited Canvases"
              canCreateCanvas={false}
              canvases={invitedCanvases}
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
              onOpenInviteCanvas={handleOpenInviteCanvas}
              onInviteFriend={handleInviteFriend}
            />
					</section>
			</div>
      );
    })()}
     
	  </main>
	</div>
  );
}
