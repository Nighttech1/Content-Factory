/**
 * C-97 — calendar autofill rules (client localStorage only).
 * Rules seed future slots; manual calendar edits win.
 */

export const SCHEDULE_AUTOFILL_KEY = "cf.schedule.autofill.v1";

export type AutofillFrequency =
  | "every_day"
  | "weekdays"
  | "every_monday"
  | "every_tuesday"
  | "every_wednesday"
  | "every_thursday"
  | "every_friday"
  | "every_saturday"
  | "every_sunday";

export type ScheduleAutofillRule = {
  id: string;
  contentTypeId: string;
  platformId: string;
  time: string; // HH:MM
  frequency: AutofillFrequency;
  enabled: boolean;
};

export type ScheduleAutofillFile = {
  version: 1;
  rules: ScheduleAutofillRule[];
};

export const AUTOFILL_FREQUENCY_LABELS: Record<AutofillFrequency, string> = {
  every_day: "Каждый день",
  weekdays: "Будни",
  every_monday: "Каждый понедельник",
  every_tuesday: "Каждый вторник",
  every_wednesday: "Каждую среду",
  every_thursday: "Каждый четверг",
  every_friday: "Каждую пятницу",
  every_saturday: "Каждую субботу",
  every_sunday: "Каждое воскресенье",
};

export function emptyAutofillFile(): ScheduleAutofillFile {
  return { version: 1, rules: [] };
}

export function readAutofillFromStorage(): ScheduleAutofillFile {
  if (typeof window === "undefined") return emptyAutofillFile();
  try {
    const raw = window.localStorage.getItem(SCHEDULE_AUTOFILL_KEY);
    if (!raw) return emptyAutofillFile();
    const parsed = JSON.parse(raw) as ScheduleAutofillFile;
    if (parsed?.version !== 1 || !Array.isArray(parsed.rules)) {
      return emptyAutofillFile();
    }
    return parsed;
  } catch {
    return emptyAutofillFile();
  }
}

export function writeAutofillToStorage(file: ScheduleAutofillFile): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SCHEDULE_AUTOFILL_KEY, JSON.stringify(file));
  } catch {
    /* ignore */
  }
}

export function newAutofillRuleId(): string {
  return `rule_${Date.now().toString(36)}`;
}
