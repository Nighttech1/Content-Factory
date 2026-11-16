"use client";
import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Copy, ExternalLink } from "lucide-react";
import { GlowButton } from "@/components/ui/glow-button";
import { DISCOVERY_ERRORS, reelHandoff } from "@/lib/studio/reels-discovery";
import type { FeedPost } from "@/lib/studio/feed-types";
type Status={configured:boolean;status:string;error?:string;nextRunAt?:string;updatedAt?:string;budget:{reservedUsd:number;accountLimitUsd:number}};
function date(value?:string|null){return value?new Date(value).toLocaleString("ru-RU",{timeZone:"Europe/Moscow",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}):"ещё не было";}
export function ReelsDiscoveryStatus() {
 const [state,setState]=useState<Status|null>(null); const [failed,setFailed]=useState(false);
 useEffect(()=>{let active=true; const load=async()=>{try{const r=await fetch("/api/studio/reels-discovery",{cache:"no-store"});if(!r.ok)throw Error();const s=await r.json();if(active){setState(s);setFailed(false);}}catch{if(active)setFailed(true);}};void load();const t=setInterval(()=>void load(),60000);return()=>{active=false;clearInterval(t);};},[]);
 return <section aria-label="Авторазведка рилсов" data-testid="reels-discovery-status" className="rounded-xl border border-[var(--border-glass)] bg-[var(--bg-elevated)] px-4 py-3 text-sm">
   <div className="flex flex-wrap justify-between gap-2"><strong>Армянская тема · обновление раз в 3 дня</strong><span>Лимит Apify: $5 / расчётный месяц</span></div>
   <p className="mt-1 text-[var(--text-muted)]">@mosarmclub · язык, юмор, культура, диаспора. Подборка среди найденных рилсов за 30 дней; не рейтинг всего Instagram.</p>
   {state?<><p className="mt-2">Обновлено: {date(state.updatedAt)} · следующая проверка: {date(state.nextRunAt)} МСК · зарезервировано: ${state.budget.reservedUsd.toFixed(2)}.</p>
   {(!state.configured||state.error)?<p role="status" className="mt-1 text-[var(--accent-gold)]">{DISCOVERY_ERRORS[state.error||"scraper_not_configured"] || `Сбор остановлен защитой (${state.error}). Последняя подборка сохранена.`}</p>:null}</>:<p role="status" className="mt-2 text-[var(--text-muted)]">{failed?"Статус сервера недоступен. Это не запускает повторный платный сбор.":"Проверяю расписание и бюджет…"}</p>}
 </section>;
}
export function ReelAnalysisDialog({post,onClose}:{post:FeedPost;onClose:()=>void}){
 const [copied,setCopied]=useState(false);const [copyFailed,setCopyFailed]=useState(false);const brief=reelHandoff(post);
 const external=post.permalink && /^https:\/\/(www\.)?instagram\.com\/reel\/[A-Za-z0-9_-]+\/?(?:\?.*)?$/.test(post.permalink)?post.permalink:null;
 return <Dialog.Root open onOpenChange={open=>{if(!open)onClose();}}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm"/>
 <Dialog.Content data-testid="reel-analysis-dialog" className="fixed inset-x-3 top-[4dvh] z-[101] mx-auto flex max-h-[92dvh] max-w-5xl flex-col overflow-y-auto overscroll-contain rounded-2xl border border-[var(--border-glass)] bg-[var(--bg-canvas)] p-4 text-[var(--text-primary)] shadow-2xl md:p-6">
 <div className="flex items-center justify-between gap-3"><Dialog.Title className="text-xl font-semibold">Разбор рилса · @{post.username}</Dialog.Title><Dialog.Close aria-label="Закрыть разбор" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--border-glass)]"><X className="h-5 w-5"/></Dialog.Close></div>
 <Dialog.Description className="mt-2 text-sm text-[var(--text-muted)]">Метрики и подпись — данные источника. Кадры, звук и причины успеха требуют просмотра оригинала.</Dialog.Description>
 <div className="mt-4 grid min-w-0 gap-5 md:grid-cols-[minmax(180px,280px)_minmax(0,1fr)]">
 <div className="min-w-0">{post.mediaUrl?<video controls playsInline preload="none" poster={post.thumbUrl} src={post.mediaUrl} className="aspect-[9/16] w-full rounded-xl bg-black"/>:post.thumbUrl?<img src={post.thumbUrl} alt="Превью оригинального рилса" className="aspect-[9/16] w-full rounded-xl object-cover"/>:<p>Превью недоступно</p>}
 {external?<a href={external} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm underline"><ExternalLink className="h-4 w-4"/>Смотреть оригинал в Instagram</a>:null}<p className="mt-2 text-xs text-[var(--text-muted)]">Если видео не загружается, откройте оригинал: ссылки Instagram на медиа могут истекать.</p></div>
 <div className="min-w-0"><dl className="grid grid-cols-2 gap-3 text-sm"><div><dt>Просмотры</dt><dd className="text-lg font-semibold">{post.metrics.views.toLocaleString("ru-RU")}</dd></div><div><dt>Отрыв от автора</dt><dd className="text-lg font-semibold">{post.discovery?.outlier!=null?`${post.discovery.outlier}×`:"нет выборки"}</dd></div><div><dt>Опубликован</dt><dd>{date(post.postedAt)} МСК</dd></div><div><dt>Замер</dt><dd>{date(post.discovery?.measuredAt)} МСК</dd></div></dl>
 <p className="mt-3 text-sm text-[var(--text-muted)]">Рейтинг учитывает просмотры, свежесть, реакции и отрыв от медианы других роликов автора (от 3 примеров). Досмотры, сохранения и репосты не выдумываются.</p>
 <h3 className="mt-4 font-semibold">Задание нашему рилсмейкеру</h3><p className="mb-2 mt-1 text-sm text-[var(--text-muted)]">Скопируйте целиком и вставьте в ваш чат. Сценарист сначала проверит видео, затем предложит нашу версию.</p>
 <textarea aria-label="Задание рилсмейкеру" readOnly value={brief} className="min-h-64 w-full resize-y rounded-xl border border-[var(--border-glass)] bg-[var(--bg-elevated)] p-3 text-sm leading-relaxed"/>
 <div className="mt-3"><GlowButton onClick={async()=>{try{await navigator.clipboard.writeText(brief);setCopied(true);setCopyFailed(false);}catch{setCopyFailed(true);}}}><Copy className="mr-2 h-4 w-4"/>{copied?"Скопировано":"Скопировать разбор и задание"}</GlowButton>{copyFailed?<p role="alert" className="mt-2 text-sm">Буфер недоступен. Выделите текст задания и скопируйте вручную.</p>:null}<span role="status" className="sr-only">{copied?"Задание скопировано":""}</span></div>
 </div></div></Dialog.Content></Dialog.Portal></Dialog.Root>;
}
