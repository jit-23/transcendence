import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { useTheme } from "./ThemeContext";
import { Avatar } from "./Avatar";
import { QuickActionsCard } from "./components/dashboard/QuickActionsCard";
export function CanvasesPage() {
  const { user } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();


  const [canvases, setCanvases] = useState<Canvas[]>([]);
	  
	const [canvasesLoading, setCanvasesLoading] = useState(false);
	  
	const [canvasesError, setCanvasesError] = useState<string | null>(null);


    const authHeader = () => ({
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        "Content-Type": "application/json",
    });
	
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

    const handleAddCanvas = async (name: string) => {
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
                return;
            }
            setCanvases(prev => [...prev, data]);
        } catch {
			setCanvasesError("Network error while creating canvas");
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
                        <QuickActionsCard
                            canvases={canvases}
                            canvasesLoading={canvasesLoading}
                            onAddCanvas={handleAddCanvas}
                            onDeleteCanvas={handleDeleteCanvas}
                            onOpenCanvas={(canvasId) => navigate(`/canvas?id=${canvasId}`)}/>
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
