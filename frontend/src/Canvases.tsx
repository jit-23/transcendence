import { useContext, useEffect, useState, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { CanvasesCard } from "./components/dashboard/CanvasesCard";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./components/i18n";
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
  const {t} = useTranslation();
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
  const [canvasCollaboratorIds, setCanvasCollaboratorIds] = useState<Set<number>>(new Set());
  const [sessionInvitedIds, setSessionInvitedIds] = useState<Set<number>>(new Set());

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
              setCanvasesError(data.error || t("CVS_failed_load_cvs", "Failed to load canvases"));
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
            setFriendsError(data.error || t("CVS_failed_load_friends", "Failed to load friends"));
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
            setCanvases((prev) => [
              ...prev,
              {
                ...data,
                isOwner: true,
              },
            ]);
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
            throw new Error(data.error || t("CVS_failed_invite", "Failed to invite friend"));
          }

          setSessionInvitedIds((prev) => new Set([...prev, friendId]));
          setInviteCanvasId(canvasId);
        } catch (err: any) {
          setInviteError(err.message || t("CVS_network_fail_invite"));
        } finally {
          setInvitingFriendId(null);
        }
      };

      const handleRemoveCollaborator = async (canvasId: number, collaboratorId: number) => {
        setCanvasesError(null);
        try {
          const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
          const res = await fetch(`${apiUrl}/canvases/${canvasId}/collaborators/${collaboratorId}`, {
            method: "DELETE",
            headers: authHeader(),
          });
          const data = await res.json();
          if (!res.ok) {
            setCanvasesError(data.error || t("CVS_failed_remove_collaborator", "Failed to remove collaborator"));
            return;
          }

          // Refresh the collaborators for this canvas
          groupChat(canvasId);
        } catch (err: any) {
          setCanvasesError(err.message || t("CVS_failed_remove_collaborator", "Failed to remove collaborator"));
        }
      };

      const handleOpenCanvas = (canvasId: number) => {
        navigate(`/canvas?id=${canvasId}`);
      };

      const handleOpenInviteCanvas = async (canvasId: number | null) => {
        if (canvasId !== null) {
          await fetchFriends();
          setSessionInvitedIds(new Set());
          try {
            const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
            const res = await fetch(`${apiUrl}/canvases/${canvasId}/collaborators`, {
              headers: authHeader(),
            });
            if (res.ok) {
              const data = await res.json();
              const ids = new Set<number>(
                [data.owner?.id, ...(data.collaborators ?? []).map((c: any) => c.id)].filter(
                  (id): id is number => typeof id === "number"
                )
              );
              setCanvasCollaboratorIds(ids);
            }
          } catch {}
        } else {
          setCanvasCollaboratorIds(new Set());
          setSessionInvitedIds(new Set());
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
		  <h1>{t("CVS_plan_group_proj")}</h1>
		  <p>{t("CVS_create_canvas_proj")}</p>
		</div>

		{groupIntegrators.length > 0 && (
		  <div className="section-card fade-up fade-up-1">
			<div className="section-card-header">
              <h3>{t("CVS_canvas_collaborators", "Canvas Collaborators")}</h3>
			</div>
			{canvasesError && <div className="msg msg-error" style={{ marginBottom: 12 }}>{canvasesError}</div>}

			<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
			  {groupIntegrators.map((collaborator) => (
				<div key={collaborator.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "8px 12px", backgroundColor: "var(--surface2)", borderRadius: 6, border: "1px solid var(--border)" }}>
				  <div>
					<p style={{ fontSize: "0.85rem", fontWeight: 600 }}>{collaborator.name}</p>
					<p style={{ fontSize: "0.75rem", color: "var(--ink3)" }}>
                  {collaborator.role === "owner" ? t("CVS_owner", "Owner") : t("CVS_collaborator", "Collaborator")}
					</p>
				  </div>
				  {collaborator.role === "owner" && groupIntegrators.some(c => c.id === user?.id && c.role === "owner") && collaborator.id !== user?.id && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    const canvasId = Number(new URLSearchParams(window.location.search).get("id"));
                    if (canvasId) handleRemoveCollaborator(canvasId, collaborator.id);
                  }}
                  disabled={canvasesLoading}
                  style={{ color: "var(--error)" }}
                >
                  {t("CVS_remove", "Remove")}
                </button>
				  )}
				</div>
			  ))}
			</div>
		  </div>
		)}
		{(() => {
			const myCanvases = canvases.filter((canvas) => canvas.isOwner || canvas.userId === user?.id);
			const invitedCanvases = canvases.filter((canvas) => !canvas.isOwner && canvas.userId !== user?.id);

			return (
     <div className="dashboard-layout" style={{ width: "100%", maxWidth: 1200, margin: "0 auto" }}>
          <section className="dashboard-main-column" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 20, width: "100%", alignItems: "stretch" }}>
                        <CanvasesCard
                            title={t("CVS_your_canvases")}
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
                          alreadyInvitedIds={new Set([...canvasCollaboratorIds, ...sessionInvitedIds])}
                          onOpenInviteCanvas={handleOpenInviteCanvas}
                          onInviteFriend={handleInviteFriend}/>

            <CanvasesCard
              title={t("CVS_chat_rooms")}
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
              alreadyInvitedIds={new Set([...canvasCollaboratorIds, ...sessionInvitedIds])}
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
