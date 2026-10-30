"use client";

import { FolderPlus, MessageSquarePlus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { MarketingProjectsFile } from "@/lib/marketing/projects-store";

type Props = {
  file: MarketingProjectsFile;
  onSelectProject: (projectId: string) => void;
  onSelectChat: (projectId: string, chatId: string) => void;
  onCreateProject: () => void;
  onRenameProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onCreateChat: (projectId: string) => void;
};

export function MarketingProjectsRail({
  file,
  onSelectProject,
  onSelectChat,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
  onCreateChat,
}: Props) {
  return (
    <aside
      className={cn(
        "flex h-full w-[260px] shrink-0 flex-col border-r border-[var(--border-glass)]",
        "bg-[color-mix(in_srgb,var(--bg-elevated)_94%,transparent)]",
        "font-[family-name:var(--font-ui)]",
      )}
      aria-label="Проекты маркетинга"
      data-testid="marketing-projects-rail"
    >
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border-glass)] px-3 py-3">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">
          Проекты
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Новый проект"
          onClick={onCreateProject}
          className="size-8"
        >
          <FolderPlus className="size-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain p-2">
        {file.projects.map((project) => {
          const projectActive = file.activeProjectId === project.id;
          return (
            <div key={project.id} className="mb-3">
              <div
                className={cn(
                  "group flex items-center gap-1 rounded-lg px-2 py-1.5",
                  projectActive
                    ? "bg-[color-mix(in_srgb,var(--accent-blue)_14%,transparent)]"
                    : "hover:bg-[var(--bg-hover)]",
                )}
              >
                <button
                  type="button"
                  className="min-w-0 flex-1 truncate text-left text-sm font-semibold text-[var(--text-primary)]"
                  onClick={() => onSelectProject(project.id)}
                >
                  {project.name}
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Переименовать проект"
                  className="size-7 opacity-0 group-hover:opacity-100"
                  onClick={() => onRenameProject(project.id)}
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Удалить проект"
                  className="size-7 opacity-0 group-hover:opacity-100"
                  onClick={() => onDeleteProject(project.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Новый чат"
                  className="size-7"
                  onClick={() => onCreateChat(project.id)}
                >
                  <MessageSquarePlus className="size-3.5" />
                </Button>
              </div>

              <ul className="mt-1 space-y-0.5 pl-2">
                {project.chats.map((chat) => {
                  const active =
                    file.activeProjectId === project.id &&
                    file.activeChatId === chat.id;
                  return (
                    <li key={chat.id}>
                      <button
                        type="button"
                        onClick={() => onSelectChat(project.id, chat.id)}
                        className={cn(
                          "w-full truncate rounded-md px-2 py-1.5 text-left text-xs",
                          active
                            ? "bg-[var(--bg-hover)] text-[var(--accent-blue-bright)]"
                            : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
                        )}
                      >
                        {chat.title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
