export type EnableStep = "idle" | "scanning";

export type ReceivedFriendRequest = {
  id: number;
  sender: {
    id: number;
    name: string;
    email: string;
  };
};

export type Friend = {
  id: number;
  name: string;
  email: string;
  online?: boolean;
};
