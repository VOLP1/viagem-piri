import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import TinderCard from 'react-tinder-card';
import {
  AlertTriangle,
  Car,
  CheckCircle2,
  CircleParking,
  Clock,
  CloudRain,
  ExternalLink,
  Footprints,
  MapPin,
  ParkingCircle,
  Route,
  ShieldAlert,
  Ticket,
  Timer,
  Toilet,
  Users,
  Utensils,
  Wifi,
  X
} from 'lucide-react';

import waterfallsRaw from '../data/waterfalls.json';

type Waterfall = {
  id: number;
  name: string;
  bio: string;
  tags: string[];
  accessibility: string;
  red_flag: string;
  price_est: string;
  crowd_meter: number;
  reservation_rule: string;
  image_url: string;
  website?: string;
  trail?: {
    dist_m?: number;
    time_min?: number;
    difficulty?: string;
  };
  infra?: {
    toilets?: boolean;
    food?: string;
    parking?: string;
    signal?: string;
  };
  safety?: {
    flood_risk?: string;
    rain_policy?: string;
  };
  driving?: {
    distance_km?: number;
    duration_min?: number;
  };
};

type SwipeDeckProps = {
  userName: string;
};

const VITE_API_BASE = String(import.meta.env.VITE_API_BASE || '').trim();
const API_BASE = VITE_API_BASE || 'http://localhost:3000';

function isLocalhostUrl(url: string) {
  return url.includes('localhost') || url.includes('127.0.0.1');
}

const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

function formatMeters(meters?: number) {
  if (meters == null) return null;
  if (meters === 0) return '0 m';
  if (meters >= 1000) {
    const km = meters / 1000;
    return `${nf1.format(km)} km`;
  }
  return `${nf0.format(meters)} m`;
}

function formatKm(km?: number) {
  if (km == null) return null;
  if (km === 0) return '0 km';
  return `${nf1.format(km)} km`;
}

function formatMinutes(mins?: number) {
  if (mins == null) return null;
  if (mins === 0) return '0 min';
  if (mins >= 60) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `${h}h ${m}min` : `${h}h`;
  }
  return `${nf0.format(mins)} min`;
}

function isReservationRequired(rule: string) {
  return rule.toLowerCase().includes('obrigatória');
}

export default function SwipeDeck({ userName }: SwipeDeckProps) {
  const waterfalls = waterfallsRaw as Waterfall[];

  const [lastError, setLastError] = useState<string | null>(null);
  const [sendingIds, setSendingIds] = useState<Record<number, boolean>>({});
  const [goneIds, setGoneIds] = useState<Record<number, true>>({});
  const [selected, setSelected] = useState<Waterfall | null>(null);

  const pointerRef = useRef<{ x: number; y: number; moved: boolean } | null>(null);

  const ordered = useMemo(() => [...waterfalls].sort((a, b) => b.id - a.id), [waterfalls]);
  const remainingCount = ordered.length - Object.keys(goneIds).length;

  useEffect(() => {
    if (!selected) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
    };

    window.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [selected]);

  const sendVote = useCallback(
    async (waterfallId: number, voteType: 'like' | 'pass') => {
      setLastError(null);
      setSendingIds((prev) => ({ ...prev, [waterfallId]: true }));
      try {
        await axios.post(
          `${API_BASE}/vote`,
          {
            user_name: userName,
            waterfall_id: waterfallId,
            vote_type: voteType
          },
          {
            timeout: 10000
          }
        );
      } catch (err) {
        console.error('Vote request failed:', err);

        const onWeb = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
        if (onWeb && isLocalhostUrl(API_BASE)) {
          setLastError(
            'Falha ao enviar seu voto. Este site foi compilado apontando para localhost. No Coolify, defina VITE_API_BASE como Build Variable e faça um Rebuild sem cache.'
          );
        } else {
          setLastError(`Falha ao enviar seu voto. Verifique se a API está acessível em ${API_BASE}.`);
        }
      } finally {
        setSendingIds((prev) => ({ ...prev, [waterfallId]: false }));
      }
    },
    [userName]
  );

  return (
    <div className="min-h-dvh relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900" />
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />

      <div className="relative min-h-dvh flex flex-col">
        <header className="px-6 py-4 border-b border-slate-800 bg-slate-950/40 backdrop-blur">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div>
              <h1 className="text-lg font-semibold tracking-tight">PiriMatch</h1>
              <p className="text-sm text-slate-300">Olá, {userName}. Deslize para votar.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-xs text-slate-400">Direita = curtir • Esquerda = passar</div>
              <div className="text-xs text-slate-200 bg-slate-950/40 border border-slate-200/10 rounded-full px-3 py-1">
                Restam {Math.max(0, remainingCount)}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-8">
          <div className="max-w-5xl mx-auto">
          {lastError ? (
            <div className="mb-6 rounded-xl border border-rose-900/50 bg-rose-950/40 px-4 py-3 text-rose-200 text-sm">
              {lastError}
            </div>
          ) : null}

            <div className="relative w-full max-w-md mx-auto" style={{ height: 640 }}>
              {remainingCount <= 0 ? (
                <div className="h-full w-full rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur shadow-2xl grid place-items-center pm-fade-up">
                  <div className="px-6 text-center">
                    <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-500/15 border border-emerald-300/20 grid place-items-center">
                      <CheckCircle2 className="h-7 w-7 text-emerald-200 animate-pulse" />
                    </div>
                    <h2 className="mt-4 text-2xl font-semibold tracking-tight">Acabaram as cachoeiras</h2>
                    <p className="mt-2 text-sm text-slate-300">
                      Você já votou em todas. Valeu!
                    </p>
                    <p className="mt-4 text-xs text-slate-400">
                      Dica: se o servidor estiver ligado, seus votos já foram salvos.
                    </p>
                  </div>
                </div>
              ) : null}

              {ordered.map((w) => {
              const required = isReservationRequired(w.reservation_rule);
                const crowd = Math.min(5, Math.max(1, Number(w.crowd_meter || 1)));

                const driveDistance = formatKm(w.driving?.distance_km);
                const driveTime = formatMinutes(w.driving?.duration_min);

                const trailDistance = formatMeters(w.trail?.dist_m);
                const trailTime = formatMinutes(w.trail?.time_min);
                const trailDifficulty = w.trail?.difficulty || null;

                const hasToilets = w.infra?.toilets;
                const infraFood = w.infra?.food || null;
                const infraParking = w.infra?.parking || null;
                const infraSignal = w.infra?.signal || null;

                const floodRisk = w.safety?.flood_risk || null;
                const rainPolicy = w.safety?.rain_policy || null;

                const website = w.website || null;

              return (
                <TinderCard
                  key={w.id}
                  onSwipe={(dir) => {
                    const voteType: 'like' | 'pass' = dir === 'right' ? 'like' : 'pass';
                    void sendVote(w.id, voteType);
                  }}
                  onCardLeftScreen={() => {
                    setGoneIds((prev) => ({ ...prev, [w.id]: true }));
                  }}
                  preventSwipe={['up', 'down']}
                  className="absolute inset-0"
                >
                  <article className="h-full w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900 transition-transform duration-200">
                    <div
                      className="h-full w-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${w.image_url})` }}
                    >
                        <div
                          className="h-full w-full bg-gradient-to-t from-slate-950/95 via-slate-950/35 to-slate-950/15 p-5 flex flex-col"
                          onPointerDown={(e) => {
                            pointerRef.current = { x: e.clientX, y: e.clientY, moved: false };
                          }}
                          onPointerMove={(e) => {
                            const g = pointerRef.current;
                            if (!g) return;
                            const dx = Math.abs(e.clientX - g.x);
                            const dy = Math.abs(e.clientY - g.y);
                            if (dx + dy > 10) g.moved = true;
                          }}
                          onPointerUp={() => {
                            const g = pointerRef.current;
                            pointerRef.current = null;
                            if (!g?.moved) setSelected(w);
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                              {required ? (
                                <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-500/20 text-amber-100 px-3 py-1 text-xs font-semibold shadow-sm">
                                  <Ticket className="h-4 w-4" />
                                  {w.reservation_rule}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/20 bg-slate-950/30 text-slate-100 px-3 py-1 text-xs font-semibold">
                                  <Ticket className="h-4 w-4" />
                                  {w.reservation_rule}
                                </span>
                              )}

                              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/15 bg-slate-950/40 text-slate-100 px-3 py-1 text-xs font-semibold">
                                <Users className="h-4 w-4 text-slate-200" />
                                <span>Lotação</span>
                                <span className="ml-1 text-slate-100/90 tabular-nums">{crowd}/5</span>
                                <span className="ml-1 inline-flex items-center gap-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <span
                                      key={i}
                                      className={
                                        i < crowd
                                          ? 'h-2.5 w-4 rounded-full bg-white/90'
                                          : 'h-2.5 w-4 rounded-full border border-white/35 bg-transparent'
                                      }
                                    />
                                  ))}
                                </span>
                              </span>

                              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/15 bg-slate-950/40 text-slate-100 px-3 py-1 text-xs font-semibold">
                                <span className="font-semibold">Preço</span>
                                <span className="text-slate-100/90">{w.price_est}</span>
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {sendingIds[w.id] ? (
                                <span className="text-xs text-slate-200 bg-slate-950/40 border border-slate-200/20 rounded-full px-3 py-1">
                                  Enviando...
                                </span>
                              ) : null}
                            </div>
                          </div>

                          <div className="mt-auto">
                            <h2 className="text-3xl font-bold tracking-tight drop-shadow">{w.name}</h2>
                            <p className="mt-2 text-sm text-slate-100/90 leading-relaxed line-clamp-3">
                              {w.bio}
                            </p>

                            <div className="mt-4 rounded-2xl bg-slate-950/45 border border-slate-200/15 px-4 py-3">
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5 h-9 w-9 rounded-xl bg-slate-950/50 border border-slate-200/10 grid place-items-center">
                                  <MapPin className="h-4 w-4 text-slate-200" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-sm font-semibold text-slate-100">Acesso</div>
                                  <div className="text-sm text-slate-100/90 break-words line-clamp-2">
                                    {w.accessibility}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 text-xs text-slate-200/70">
                              Toque no card para ver detalhes (role).
                            </div>
                          </div>
                        </div>
                    </div>
                  </article>
                </TinderCard>
              );
              })}
          </div>
          </div>
        </main>

        {selected ? (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            onClick={() => setSelected(null)}
          >
            <div
              className="h-full w-full flex items-end sm:items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full max-w-md max-h-[90dvh] rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl flex flex-col">
                <div
                  className="h-40 bg-cover bg-center"
                  style={{ backgroundImage: `url(${selected.image_url})` }}
                >
                  <div className="h-full w-full bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-slate-950/10" />
                </div>

                <div className="px-5 py-4 border-b border-slate-800 flex items-start justify-between gap-3 shrink-0">
                  <div className="min-w-0">
                    <div className="text-lg font-semibold tracking-tight truncate">{selected.name}</div>
                    <div className="mt-1 text-sm text-slate-300 line-clamp-2">{selected.bio}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="shrink-0 inline-flex items-center justify-center h-10 w-10 rounded-full border border-slate-200/15 bg-slate-900/40 hover:bg-slate-900/60 transition"
                    aria-label="Fechar"
                  >
                    <X className="h-5 w-5 text-slate-100" />
                  </button>
                </div>

                <div className="px-5 py-4 overflow-y-auto flex-1 min-h-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {isReservationRequired(selected.reservation_rule) ? (
                      <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-500/20 text-amber-100 px-3 py-1 text-xs font-semibold">
                        <Ticket className="h-4 w-4" />
                        {selected.reservation_rule}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/20 bg-slate-900/40 text-slate-100 px-3 py-1 text-xs font-semibold">
                        <Ticket className="h-4 w-4" />
                        {selected.reservation_rule}
                      </span>
                    )}

                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/15 bg-slate-900/40 text-slate-100 px-3 py-1 text-xs font-semibold">
                      <Users className="h-4 w-4 text-slate-200" />
                      Lotação
                      <span className="ml-1 text-slate-100/90 tabular-nums">
                        {Math.min(5, Math.max(1, Number(selected.crowd_meter || 1)))}/5
                      </span>
                      <span className="ml-1 inline-flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => {
                          const crowd = Math.min(5, Math.max(1, Number(selected.crowd_meter || 1)));
                          return (
                            <span
                              key={i}
                              className={
                                i < crowd
                                  ? 'h-2.5 w-4 rounded-full bg-white/90'
                                  : 'h-2.5 w-4 rounded-full border border-white/35 bg-transparent'
                              }
                            />
                          );
                        })}
                      </span>
                    </span>

                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/15 bg-slate-900/40 text-slate-100 px-3 py-1 text-xs font-semibold">
                      <span className="font-semibold">Preço</span>
                      <span className="text-slate-100/90">{selected.price_est}</span>
                    </span>

                    {selected.website ? (
                      <a
                        href={selected.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200/20 bg-white/10 text-white px-3 py-1 text-xs font-semibold hover:bg-white/15 transition"
                        title="Abrir site"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Site
                      </a>
                    ) : null}
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-2">
                    <div className="rounded-2xl bg-slate-900/40 border border-slate-200/10 px-4 py-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 h-9 w-9 rounded-xl bg-slate-950/40 border border-slate-200/10 grid place-items-center">
                          <MapPin className="h-4 w-4 text-slate-200" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-100">Acesso</div>
                          <div className="text-sm text-slate-100/90 break-words">{selected.accessibility}</div>
                        </div>
                      </div>

                      {(() => {
                        const driveDistance = formatKm(selected.driving?.distance_km);
                        const driveTime = formatMinutes(selected.driving?.duration_min);
                        if (!driveDistance && !driveTime) return null;
                        return (
                          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                            <div className="rounded-xl bg-slate-950/30 border border-slate-200/10 px-3 py-2 flex items-center gap-2">
                              <Car className="h-4 w-4 text-slate-200" />
                              <span className="text-slate-100/90">{driveDistance || '—'}</span>
                            </div>
                            <div className="rounded-xl bg-slate-950/30 border border-slate-200/10 px-3 py-2 flex items-center gap-2">
                              <Clock className="h-4 w-4 text-slate-200" />
                              <span className="text-slate-100/90">{driveTime || '—'}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="rounded-2xl bg-slate-900/40 border border-slate-200/10 px-4 py-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-xl bg-slate-950/30 border border-slate-200/10 px-3 py-2">
                          <div className="flex items-center gap-2 text-xs text-slate-300">
                            <Route className="h-4 w-4" />
                            Trilha
                          </div>
                          <div className="mt-1 text-sm font-semibold text-slate-100">
                            {selected.trail?.difficulty || '—'}
                          </div>
                        </div>
                        <div className="rounded-xl bg-slate-950/30 border border-slate-200/10 px-3 py-2">
                          <div className="flex items-center gap-2 text-xs text-slate-300">
                            <Footprints className="h-4 w-4" />
                            Distância
                          </div>
                          <div className="mt-1 text-sm font-semibold text-slate-100">
                            {formatMeters(selected.trail?.dist_m) || '—'}
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 rounded-xl bg-slate-950/30 border border-slate-200/10 px-3 py-2">
                        <div className="flex items-center gap-2 text-xs text-slate-300">
                          <Timer className="h-4 w-4" />
                          Tempo estimado
                        </div>
                        <div className="mt-1 text-sm font-semibold text-slate-100">
                          {formatMinutes(selected.trail?.time_min) || '—'}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-slate-900/40 border border-slate-200/10 px-4 py-3">
                      <div className="text-sm font-semibold text-slate-100">Infra</div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div className="rounded-xl bg-slate-950/30 border border-slate-200/10 px-3 py-2 flex items-start gap-2">
                          <Toilet className="h-4 w-4 text-slate-200 mt-0.5" />
                          <div className="min-w-0">
                            <div className="text-xs text-slate-300">Banheiro</div>
                            <div className="text-sm text-slate-100/90">
                              {selected.infra?.toilets ? 'Tem' : 'Não tem'}
                            </div>
                          </div>
                        </div>
                        <div className="rounded-xl bg-slate-950/30 border border-slate-200/10 px-3 py-2 flex items-start gap-2">
                          <Utensils className="h-4 w-4 text-slate-200 mt-0.5" />
                          <div className="min-w-0">
                            <div className="text-xs text-slate-300">Comida</div>
                            <div className="text-sm text-slate-100/90 break-words">{selected.infra?.food || '—'}</div>
                          </div>
                        </div>
                        <div className="rounded-xl bg-slate-950/30 border border-slate-200/10 px-3 py-2 flex items-start gap-2">
                          <ParkingCircle className="h-4 w-4 text-slate-200 mt-0.5" />
                          <div className="min-w-0">
                            <div className="text-xs text-slate-300">Estacionamento</div>
                            <div className="text-sm text-slate-100/90 break-words">{selected.infra?.parking || '—'}</div>
                          </div>
                        </div>
                        <div className="rounded-xl bg-slate-950/30 border border-slate-200/10 px-3 py-2 flex items-start gap-2">
                          <Wifi className="h-4 w-4 text-slate-200 mt-0.5" />
                          <div className="min-w-0">
                            <div className="text-xs text-slate-300">Sinal</div>
                            <div className="text-sm text-slate-100/90 break-words">{selected.infra?.signal || '—'}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {(selected.safety?.flood_risk || selected.safety?.rain_policy) ? (
                      <div className="rounded-2xl border border-sky-300/15 bg-slate-900/40 px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold text-slate-100">Segurança</div>
                          <span className="inline-flex items-center gap-2 rounded-full border border-sky-200/15 bg-sky-500/10 text-slate-50 px-3 py-1 text-xs font-semibold">
                            <ShieldAlert className="h-4 w-4" />
                            {selected.safety?.flood_risk || '—'}
                          </span>
                        </div>
                        {selected.safety?.rain_policy ? (
                          <div className="mt-2 flex items-start gap-2 text-sm text-slate-100/90">
                            <CloudRain className="h-4 w-4 text-slate-200 mt-0.5" />
                            <span className="break-words">{selected.safety?.rain_policy}</span>
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    {selected.red_flag ? (
                      <div className="rounded-2xl border border-rose-500/30 bg-rose-950/40 px-4 py-3">
                        <div className="flex items-center gap-2 text-rose-100">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm font-semibold">ALERTA</span>
                        </div>
                        <p className="mt-1 text-sm text-rose-100/90">{selected.red_flag}</p>
                      </div>
                    ) : null}
                  </div>

                  {selected.tags?.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selected.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-slate-900/40 border border-slate-200/10 px-3 py-1 text-xs text-slate-100"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
