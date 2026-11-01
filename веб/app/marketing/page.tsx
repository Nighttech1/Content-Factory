import { redirect } from "next/navigation";

// Чат «Маркетинг-директор» убран из веба: общение с агентами — в облачных чатах Claude.
// Роут оставлен как редирект, чтобы старые ссылки вели в Студию (результаты).
export default function MarketingPage() {
  redirect("/studio");
}
