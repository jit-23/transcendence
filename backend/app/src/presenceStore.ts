const socketsByUserId = new Map<number, Set<string>>();
const userIdBySocketId = new Map<string, number>();

type OnlineTransition = {
  userId: number;
  becameOnline: boolean;
};

type OfflineTransition = {
  userId: number;
  becameOffline: boolean;
};

export function markUserOnline(userId: number, socketId: string): OnlineTransition {
  const existing = socketsByUserId.get(userId) ?? new Set<string>();
  const wasOffline = existing.size === 0;

  existing.add(socketId);
  socketsByUserId.set(userId, existing);
  userIdBySocketId.set(socketId, userId);

  return {
    userId,
    becameOnline: wasOffline,
  };
}

export function markSocketOffline(socketId: string): OfflineTransition | null {
  const userId = userIdBySocketId.get(socketId);
  if (!userId) return null;

  userIdBySocketId.delete(socketId);
  const sockets = socketsByUserId.get(userId);
  if (!sockets) return { userId, becameOffline: true };

  sockets.delete(socketId);
  if (sockets.size === 0) {
    socketsByUserId.delete(userId);
    return { userId, becameOffline: true };
  }

  socketsByUserId.set(userId, sockets);
  return { userId, becameOffline: false };
}

export function isUserOnline(userId: number): boolean {
  return (socketsByUserId.get(userId)?.size ?? 0) > 0;
}

export function getSocketIdsForUser(userId: number): string[] {
  return Array.from(socketsByUserId.get(userId) ?? []);
}
