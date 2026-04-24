import { Friend } from "./types";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useTranslation } from "react-i18next";

type FriendsCardProps = {
  friends: Friend[];
  loading: boolean;
  error: string | null;
  unfriendingId: number | null;
  onRefresh: () => void;
  onViewProfile: (friendId: number) => void;
  onChat: (friend: Friend) => void;
  onUnfriend: (friendId: number) => void;
};

export function FriendsCard({
  friends,
  loading,
  error,
  unfriendingId,
  onRefresh,
  onViewProfile,
  onChat,
  onUnfriend,
}: FriendsCardProps) {
  const {t} = useTranslation();
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">{t("FRC_my_friends")}</CardTitle>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
          {loading ? t("FRC_loading") : t("FRC_refresh")}
        </Button>
      </CardHeader>

      <CardContent className="space-y-3">
        {error && <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</div>}

        {!loading && friends.length === 0 && (
          <p className="text-sm text-muted">{t("FRC_no_friends")}</p>
        )}

        {friends.length > 0 && (
          <div className="space-y-2">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface2 p-2.5"
              >
                <div>
                  <p className="text-sm font-semibold text-ink">{friend.name}</p>
                </div>

                <div className="flex gap-1.5">
                  <Button variant="outline" size="sm" onClick={() => onViewProfile(friend.id)}>
                    {t("FRC_profile")}
                  </Button>
                  <Button size="sm" onClick={() => onChat(friend)}>
                    {t("FRC_chat")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUnfriend(friend.id)}
                    disabled={unfriendingId === friend.id}
                  >
                    {unfriendingId === friend.id ? t("FRC_remove") : t("FRC_unfriend")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
