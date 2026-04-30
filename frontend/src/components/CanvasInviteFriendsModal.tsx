import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Avatar } from "../Avatar";

type Friend = {
  id: number;
  name: string;
  email: string;
  online?: boolean;
};

type CanvasInviteFriendsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  friends: Friend[];
  friendsLoading: boolean;
  friendsError: string | null;
  invitingFriendId: number | null;
  inviteError: string | null;
  onInviteFriend: (friendId: number) => void;
  onRefreshFriends: () => void;
};

export function CanvasInviteFriendsModal({
  isOpen,
  onClose,
  friends,
  friendsLoading,
  friendsError,
  invitingFriendId,
  inviteError,
  onInviteFriend,
  onRefreshFriends,
}: CanvasInviteFriendsModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const modalRef = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation();

  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!isOpen) return;

    const onClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("mousedown", onClickOutside);
    window.addEventListener("keydown", onEscape);

    return () => {
      window.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("keydown", onEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/55 p-4" onClick={onClose}>
      <Card className="w-full max-w-md shadow-xl" ref={modalRef} onClick={(e) => e.stopPropagation()}>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base">{t("CVS_invite")}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onRefreshFriends} disabled={friendsLoading}>
            {friendsLoading ? "..." : t("FRC_refresh")}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {inviteError && (
            <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {inviteError}
            </div>
          )}

          {friendsError && (
            <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {friendsError}
            </div>
          )}

          <Input
            type="text"
            placeholder={t("FRS_search_user")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={friendsLoading}
          />

          {!friendsLoading && friends.length === 0 && (
            <p className="text-sm text-muted">{t("CVS_no_friends")}</p>
          )}

          {filteredFriends.length === 0 && friends.length > 0 && (
            <p className="text-sm text-muted">{t("FRS_no_user_match")}</p>
          )}

          {filteredFriends.length > 0 && (
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {filteredFriends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface2 p-2.5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar avatar={undefined} name={friend.name} size={32} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">{friend.name}</p>
                      <p className="text-xs text-muted truncate">{friend.email}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onInviteFriend(friend.id)}
                    disabled={invitingFriendId === friend.id || friendsLoading}
                  >
                    {invitingFriendId === friend.id ? t("CVS_inviting") : t("CVS_invite")}
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>
              {t("DB_close")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
