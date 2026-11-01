import { redirect } from "next/navigation";

// Настройки убраны: всё настраивается через агентов в облачных чатах Claude.
// См. shared/rules/web-settings-to-agents.md. Роут редиректит на Дашборд.
export default function SettingsPage() {
  redirect("/dashboard");
}
