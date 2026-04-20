import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { useTheme } from "./ThemeContext";
import { Avatar } from "./Avatar";
import { CanvasesCard } from "./components/dashboard/CanvasesCard";
import { useTranslation } from 'react-i18next';
import { changeLanguage } from "./components/i18n.tsx";


type Canvas = {
  id: number;
  name: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
};

export function CanvasesPage() {
  const { user } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [canvases, setCanvases] = useState<Canvas[]>([]);
	const [canvasesLoading, setCanvasesLoading] = useState(false);
	const [canvasesError, setCanvasesError] = useState<string | null>(null);
  const {t} = useTranslation()


    const authHeader = () => ({
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        "Content-Type": "application/json",
    });
	

    console.log("CanvasesPage: entered");
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

      const handleOpenCanvas = (canvasId: number) => {
        navigate(`/canvas?id=${canvasId}`);
      };

      useEffect(() => {
        fetchCanvases();
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
        <button
          //FIX THE POSITION
          className="theme-toggle"//change classname
          onClick={changeLanguage}//onClick LANGUAGECHANGE
          title="Toggle theme"//change title
          style={{ position: 'fixed', top: 20, right: 70 }}//change the icon
      >
          ☾
      </button>
		</div>
	  </header>

	  <main className="dashboard-body">
		<div className="page-title fade-up">
		  <h1>{t("plan_group_proj")}</h1>
		  <p>{t("create_canvas_proj")}</p>
		</div>
		 <div className="dashboard-layout">
                    <section className="dashboard-main-column">
                        <CanvasesCard
                            canvases={canvases}
                            canvasesLoading={canvasesLoading}
                          canvasesError={canvasesError}
                            onAddCanvas={handleAddCanvas}
                            onDeleteCanvas={handleDeleteCanvas}
                          onOpenCanvas={handleOpenCanvas}/>
					</section>
			</div>
		<div className="section-card fade-up fade-up-1" style={{ maxWidth: 785 }}>
		  <div className="section-card-header" >
			<h3>{t("chat_rooms")}</h3>
		  </div>
		  <p style={{ color: "var(--ink2)", marginBottom: 10, fontSize: "0.82rem" }}>
			{t("use_canvas")}
		  </p>
		  <div style={{ display: "flex", gap: 8 }}>
			<button className="btn btn-ghost" onClick={() => navigate("/groups")}>{t("chat_rooms")}</button>
		  </div>
		</div>
	  </main>
	</div>
  );
}
