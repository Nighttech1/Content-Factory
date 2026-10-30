/**
 * C-marketing-director-chat — projects + chats in localStorage (v1).
 * Key locked: cf.marketing.projects
 */

export const MARKETING_PROJECTS_KEY = "cf.marketing.projects";

export type MarketingChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type MarketingChat = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: MarketingChatMessage[];
};

export type MarketingProject = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  chats: MarketingChat[];
};

export type MarketingProjectsFile = {
  version: 1;
  projects: MarketingProject[];
  activeProjectId: string | null;
  activeChatId: string | null;
};

function nowIso() {
  return new Date().toISOString();
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

export function emptyProjectsFile(): MarketingProjectsFile {
  const projectId = uid("proj");
  const chatId = uid("chat");
  const ts = nowIso();
  return {
    version: 1,
    activeProjectId: projectId,
    activeChatId: chatId,
    projects: [
      {
        id: projectId,
        name: "Основной",
        createdAt: ts,
        updatedAt: ts,
        chats: [
          {
            id: chatId,
            title: "Новый чат",
            createdAt: ts,
            updatedAt: ts,
            messages: [],
          },
        ],
      },
    ],
  };
}

export function parseProjectsFile(raw: unknown): MarketingProjectsFile {
  if (!raw || typeof raw !== "object") return emptyProjectsFile();
  const src = raw as Record<string, unknown>;
  if (src.version !== 1 || !Array.isArray(src.projects)) {
    return emptyProjectsFile();
  }
  const projects: MarketingProject[] = [];
  for (const p of src.projects) {
    if (!p || typeof p !== "object") continue;
    const pr = p as Record<string, unknown>;
    if (typeof pr.id !== "string" || typeof pr.name !== "string") continue;
    const chats: MarketingChat[] = [];
    if (Array.isArray(pr.chats)) {
      for (const c of pr.chats) {
        if (!c || typeof c !== "object") continue;
        const ch = c as Record<string, unknown>;
        if (typeof ch.id !== "string" || typeof ch.title !== "string") continue;
        const messages: MarketingChatMessage[] = [];
        if (Array.isArray(ch.messages)) {
          for (const m of ch.messages) {
            if (!m || typeof m !== "object") continue;
            const msg = m as Record<string, unknown>;
            if (
              typeof msg.id !== "string" ||
              (msg.role !== "user" && msg.role !== "assistant") ||
              typeof msg.content !== "string"
            ) {
              continue;
            }
            messages.push({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              createdAt:
                typeof msg.createdAt === "string" ? msg.createdAt : nowIso(),
            });
          }
        }
        chats.push({
          id: ch.id,
          title: ch.title,
          createdAt:
            typeof ch.createdAt === "string" ? ch.createdAt : nowIso(),
          updatedAt:
            typeof ch.updatedAt === "string" ? ch.updatedAt : nowIso(),
          messages,
        });
      }
    }
    projects.push({
      id: pr.id,
      name: pr.name,
      createdAt: typeof pr.createdAt === "string" ? pr.createdAt : nowIso(),
      updatedAt: typeof pr.updatedAt === "string" ? pr.updatedAt : nowIso(),
      chats,
    });
  }
  if (projects.length === 0) return emptyProjectsFile();

  let activeProjectId =
    typeof src.activeProjectId === "string" ? src.activeProjectId : null;
  let activeChatId =
    typeof src.activeChatId === "string" ? src.activeChatId : null;

  if (!projects.some((p) => p.id === activeProjectId)) {
    activeProjectId = projects[0]!.id;
  }
  const activeProject = projects.find((p) => p.id === activeProjectId)!;
  if (!activeProject.chats.some((c) => c.id === activeChatId)) {
    activeChatId = activeProject.chats[0]?.id ?? null;
  }

  return {
    version: 1,
    projects,
    activeProjectId,
    activeChatId,
  };
}

export function readProjectsFromStorage(): MarketingProjectsFile {
  if (typeof window === "undefined") return emptyProjectsFile();
  try {
    const raw = window.localStorage.getItem(MARKETING_PROJECTS_KEY);
    if (!raw) return emptyProjectsFile();
    return parseProjectsFile(JSON.parse(raw) as unknown);
  } catch {
    return emptyProjectsFile();
  }
}

export function writeProjectsToStorage(file: MarketingProjectsFile): void {
  if (typeof window === "undefined") return;
  const next = parseProjectsFile(file);
  window.localStorage.setItem(MARKETING_PROJECTS_KEY, JSON.stringify(next));
}

export function createProject(
  file: MarketingProjectsFile,
  name: string,
): MarketingProjectsFile {
  const ts = nowIso();
  const projectId = uid("proj");
  const chatId = uid("chat");
  const project: MarketingProject = {
    id: projectId,
    name: name.trim() || "Проект",
    createdAt: ts,
    updatedAt: ts,
    chats: [
      {
        id: chatId,
        title: "Новый чат",
        createdAt: ts,
        updatedAt: ts,
        messages: [],
      },
    ],
  };
  return {
    ...file,
    projects: [project, ...file.projects],
    activeProjectId: projectId,
    activeChatId: chatId,
  };
}

export function renameProject(
  file: MarketingProjectsFile,
  projectId: string,
  name: string,
): MarketingProjectsFile {
  const nextName = name.trim() || "Проект";
  return {
    ...file,
    projects: file.projects.map((p) =>
      p.id === projectId
        ? { ...p, name: nextName, updatedAt: nowIso() }
        : p,
    ),
  };
}

export function deleteProject(
  file: MarketingProjectsFile,
  projectId: string,
): MarketingProjectsFile {
  const projects = file.projects.filter((p) => p.id !== projectId);
  if (projects.length === 0) return emptyProjectsFile();
  const activeProjectId =
    file.activeProjectId === projectId
      ? projects[0]!.id
      : file.activeProjectId;
  const active = projects.find((p) => p.id === activeProjectId)!;
  return {
    version: 1,
    projects,
    activeProjectId,
    activeChatId: active.chats[0]?.id ?? null,
  };
}

export function createChat(
  file: MarketingProjectsFile,
  projectId: string,
): MarketingProjectsFile {
  const ts = nowIso();
  const chatId = uid("chat");
  return {
    ...file,
    activeProjectId: projectId,
    activeChatId: chatId,
    projects: file.projects.map((p) => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        updatedAt: ts,
        chats: [
          {
            id: chatId,
            title: "Новый чат",
            createdAt: ts,
            updatedAt: ts,
            messages: [],
          },
          ...p.chats,
        ],
      };
    }),
  };
}

export function appendMessages(
  file: MarketingProjectsFile,
  projectId: string,
  chatId: string,
  messages: MarketingChatMessage[],
): MarketingProjectsFile {
  const ts = nowIso();
  return {
    ...file,
    projects: file.projects.map((p) => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        updatedAt: ts,
        chats: p.chats.map((c) => {
          if (c.id !== chatId) return c;
          const nextMsgs = [...c.messages, ...messages];
          const firstUser = nextMsgs.find((m) => m.role === "user");
          const title =
            c.title === "Новый чат" && firstUser
              ? firstUser.content.slice(0, 48)
              : c.title;
          return {
            ...c,
            title,
            updatedAt: ts,
            messages: nextMsgs,
          };
        }),
      };
    }),
  };
}

export function getActiveChat(
  file: MarketingProjectsFile,
): MarketingChat | null {
  const p = file.projects.find((x) => x.id === file.activeProjectId);
  if (!p) return null;
  return p.chats.find((c) => c.id === file.activeChatId) ?? null;
}
