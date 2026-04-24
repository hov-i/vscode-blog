export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

export type ChatState =
  | "idle"
  | "thinking"
  | "typing"
  | "happy"
  | "confused"
  | "error";

export type AvatarMood =
  | ChatState
  | "wink"
  | "nod"
  | "love"
  | "sleepy";
