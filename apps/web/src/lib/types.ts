export interface AuthenticatedUser {
  id: string;
  fullName: string;
  email: string;
}

export interface BoardSummary {
  id: string;
  name: string;
  createdById: string;
  createdAt: string;
  members: { userId: string }[];
}

export interface BoardMemberInfo {
  userId: string;
  role: "OWNER" | "MEMBER";
  user: { id: string; fullName: string; email: string };
}

export interface CardInfo {
  id: string;
  columnId: string;
  title: string;
  description: string | null;
  position: number;
  assignee: { id: string; fullName: string } | null;
  createdBy: { id: string; fullName: string };
  createdAt: string;
}

export interface ColumnInfo {
  id: string;
  name: string;
  position: number;
  cards: CardInfo[];
}

export interface ActivityEventInfo {
  id: string;
  message: string;
  actor: { id: string; fullName: string };
  createdAt: string;
}

export interface BoardDetail {
  id: string;
  name: string;
  createdById: string;
  members: BoardMemberInfo[];
  columns: ColumnInfo[];
  activity: ActivityEventInfo[];
}

export interface PresenceViewer {
  userId: string;
  fullName: string;
}
