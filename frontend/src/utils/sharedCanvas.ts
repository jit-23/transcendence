type SharedCanvas = {
  id: number;
  name: string;
  userId: number;
  content: string | null;
  createdAt: string;
  updatedAt: string;
};

const API_BASE = "http://localhost:8081";

const authHeader = () => ({
  Authorization: `Bearer ${sessionStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

export async function createSharedCanvas(options: {
  groupName: string;
  collaboratorIds: number[];
}): Promise<SharedCanvas> {
  const canvasName = options.groupName.trim();

  const createResponse = await fetch(`${API_BASE}/canvases`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify({ name: canvasName, content: null }),
  });
  const createdCanvas = (await createResponse.json()) as SharedCanvas;

  if (!createResponse.ok) {
    throw new Error((createdCanvas as unknown as { error?: string })?.error || "Failed to create shared canvas");
  }

  await Promise.all(
    Array.from(new Set(options.collaboratorIds))
      .filter((friendId) => Number.isInteger(friendId) && friendId > 0)
      .map(async (friendId) => {
        const response = await fetch(`${API_BASE}/canvases/${createdCanvas.id}/collaborators`, {
          method: "POST",
          headers: authHeader(),
          body: JSON.stringify({ friendId }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Failed to add canvas collaborator");
        }
      })
  );

  return createdCanvas;
}

export async function openSharedCanvas(canvasId: number) {
  return `${API_BASE}/canvas?id=${canvasId}`;
}
