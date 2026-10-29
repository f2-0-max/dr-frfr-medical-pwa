import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarHeart, HeartPulse, BookOpen, Sparkles, ListChecks, BellRing, CalendarDays } from "lucide-react";
import { Frfr } from "@/components/frfr";
import { Card, TaskList } from "@/components/task-list";
import { useApp, useT, setState, iso, addDays, shiftMeta, type Shift } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dr. Frfr — Today" },
      { name: "description", content: "Today's tasks, tomorrow's reminders and shift overview for Dr. Frfr." },
      { property: "og:title", content: "Dr. Frfr — Today" },
      { property: "og:description", content: "A calm daily dashboard for an internal medicine doctor." },
    ],
  }),
  component: Home,
});

function Home() {
  const t = useT();
  const lang = useApp((s) => s.lang);
  const todayTasks = useApp((s) => s.todayTasks);
  const shifts = useApp((s) => s.shifts);
  const patients = useApp((s) => s.patients);
  const now = new Date();
  const hour = now.getHours();
  const greet = hour < 12 ? t("Good morning", "صباح الخير") : hour < 18 ? t("Good afternoon", "مساء الخير") : t("Good evening", "مساء النور");
  const today = shifts[iso(now)];
  const tmKey = iso(addDays(now, 1));
  const tomorrow = shifts[tmKey];
  const done = todayTasks.filter((x) => x.done).length;
  const critical = patients.filter((p) => p.status === "critical").length;
  const week = Array.from({ length: 7 }, (_, i) => shifts[iso(addDays(now, i))]).filter(Boolean) as Shift[];
  const locale = lang === "ar" ? "ar" : "en";

  const lines = [
    t(`${done}/${todayTasks.length} tasks done — lovely pace!`, `أنجزتِ ${done}/${todayTasks.length} — أحسنتِ!`),
    critical ? t(`${critical} patient needs close watch 💙`, `${critical} مريض يحتاج متابعة 💙`) : t("All patients steady ✨", "المرضى مستقرون ✨"),
    t("Remember to hydrate 💧", "لا تنسي شرب الماء 💧"),
  ];

  const shortcuts = [
    { to: "/shifts", icon: CalendarHeart, en: "Shifts", ar: "المناوبات", cls: "bg-primary-soft text-primary" },
    { to: "/patients", icon: HeartPulse, en: "Patients", ar: "المرضى", cls: "bg-rose-soft text-rose" },
    { to: "/reference", icon: BookOpen, en: "Reference", ar: "المرجع", cls: "bg-sky-soft text-sky" },
    { to: "/progress", icon: Sparkles, en: "Progress", ar: "تقدّمي", cls: "bg-gold/20 text-foreground" },
  ] as const;

  return (
    <div className="space-y-4">
      <section className="bg-hero relative overflow-hidden rounded-3xl p-5 shadow-soft animate-rise">
        <svg viewBox="0 0 300 40" className="absolute inset-x-0 bottom-3 h-10 w-full opacity-30">
          <path className="animate-ecg stroke-primary" fill="none" strokeWidth="2" d="M0 20 H90 L100 8 L110 32 L120 4 L130 26 L140 20 H300" />
        </svg>
        <div className="flex items-end">
          <div className="relative z-10 flex-1 pb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {now.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <h1 className="mt-2 text-4xl font-semibold leading-tight text-secondary-foreground">
              {greet},<br />Dr. Frfr
            </h1>
            {today && (
              <span className={cn("mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold", shiftMeta[today.type].cls)}>
                {t("Today", "اليوم")}: {t(shiftMeta[today.type].en, shiftMeta[today.type].ar)} · {shiftMeta[today.type].hours}
              </span>
            )}
          </div>
          <Frfr lines={lines} className="-mb-5 -me-3 h-56 w-40 shrink-0" />
        </div>
      </section>

      <div className="grid grid-cols-4 gap-2">
        {shortcuts.map((s, i) => (
          <Link key={s.to} to={s.to} style={{ animationDelay: `${i * 70}ms` }}
            className="glass group flex flex-col items-center gap-1.5 rounded-2xl py-3 text-[11px] font-semibold animate-rise transition-transform active:scale-95 hover:-translate-y-1">
            <span className={cn("grid h-10 w-10 place-items-center rounded-2xl transition-transform group-hover:rotate-6", s.cls)}>
              <s.icon className="h-5 w-5" />
            </span>
            {t(s.en, s.ar)}
          </Link>
        ))}
      </div>

      <Card title={t("Today's tasks", "مهام اليوم")} icon={<ListChecks className="h-4 w-4" />}
        action={<span className="text-xs text-muted-foreground">{done}/{todayTasks.length}</span>}>
        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="bg-brand h-full rounded-full transition-all duration-700" style={{ width: `${todayTasks.length ? (done / todayTasks.length) * 100 : 0}%` }} />
        </div>
        <TaskList tasks={todayTasks} onChange={(tasks) => setState((s) => ({ ...s, todayTasks: tasks }))} />
      </Card>

      <Card title={t("Tomorrow", "الغد")} icon={<BellRing className="h-4 w-4" />}
        action={<Link to="/shifts" className="text-xs font-semibold text-primary">{t("Edit", "تعديل")}</Link>}>
        {tomorrow ? (
          <div className="space-y-2 text-sm">
            <span className={cn("inline-block rounded-full px-3 py-1 text-xs font-semibold", shiftMeta[tomorrow.type].cls)}>
              {t(shiftMeta[tomorrow.type].en, shiftMeta[tomorrow.type].ar)} · {shiftMeta[tomorrow.type].hours}
            </span>
            {tomorrow.prep && <p className="rounded-2xl bg-sky-soft p-3">🎒 {tomorrow.prep}</p>}
            {tomorrow.tasks.map((x) => <p key={x.id} className="text-muted-foreground">• {x.text}</p>)}
            {!tomorrow.prep && !tomorrow.tasks.length && <p className="text-muted-foreground">{t("No reminders yet.", "لا تذكيرات بعد.")}</p>}
          </div>
        ) : <p className="text-sm text-muted-foreground">{t("No shift set.", "لا مناوبة محددة.")}</p>}
      </Card>

      <Card title={t("This week", "هذا الأسبوع")} icon={<CalendarDays className="h-4 w-4" />}>
        <div className="grid grid-cols-7 gap-1.5">
          {week.map((s, i) => {
            const d = new Date(s.date + "T00:00");
            return (
              <div key={s.date} className={cn("flex flex-col items-center rounded-2xl py-2 text-[10px] font-semibold", shiftMeta[s.type].cls, i === 0 && "ring-2 ring-primary")}>
                <span className="opacity-70">{d.toLocaleDateString(locale, { weekday: "narrow" })}</span>
                <span className="text-base">{d.getDate()}</span>
                <span className="truncate">{t(shiftMeta[s.type].en, shiftMeta[s.type].ar)}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
