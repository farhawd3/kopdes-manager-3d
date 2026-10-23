'use client';
import { useEffect, useRef, useState } from 'react';
import { Home, Minus, Plus, RotateCcw, RotateCw } from 'lucide-react';
import type { MonitoringScene, AttentionPin } from './monitoring-scene';
import type { WorldSite } from './office-rooms';
import type { CharacterPlan } from './character-plan';
import type { LogisticsInput } from './warehouse-room';
import type { Ambience } from './monitor-data';
import { cn } from '@/lib/utils';
import { BTN, CARD, STAGE } from './monitor-cards';

const TOOL =
  'grid size-[38px] place-items-center rounded-[10px] border-0 bg-transparent text-ink-2 hover:bg-accent hover:text-accent-strong max-md:size-10';
/** Siku bingkai pilihan; ukurannya dari --siku yang diatur adegan sesuai besar objek. */
const CORNER =
  'absolute size-(--siku) border-[3px] border-accent-strong [filter:drop-shadow(0_2px_4px_color-mix(in_srgb,var(--accent-strong)_35%,transparent))]';

type Props = {
  site: WorldSite;
  input: LogisticsInput;
  plans: CharacterPlan[];
  selected: string;
  tag: string;
  ambience: Ambience;
  /** Hal yang perlu perhatian (≤5), tampil sebagai pin biru. */
  pins: AttentionPin[];
  onPick: (key: string) => void;
};

/** Jembatan React ↔ adegan WebGL: lazy load, fallback, kontrol peta, dan label pilihan. */
export function MonitoringStage({
  site,
  input,
  plans,
  selected,
  tag,
  ambience,
  pins,
  onPick,
}: Props) {
  const host = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);
  const hover = useRef<HTMLDivElement>(null);
  const pinLayer = useRef<HTMLDivElement>(null);
  const mark = useRef<HTMLDivElement>(null);
  const markRoom = useRef<SVGSVGElement>(null);
  const scene = useRef<MonitoringScene | null>(null);
  const latest = useRef({ site, input, plans, selected, ambience, pins, onPick });
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    latest.current = { site, input, plans, selected, ambience, pins, onPick };
  });
  useEffect(() => {
    scene.current?.show(site, input);
    scene.current?.select(latest.current.selected);
  }, [site, input]);
  useEffect(() => {
    scene.current?.setPlans(plans);
  }, [plans]);
  useEffect(() => {
    scene.current?.select(selected);
  }, [selected]);
  useEffect(() => {
    scene.current?.setAmbience(ambience);
  }, [ambience]);
  useEffect(() => {
    scene.current?.setPins(pins);
  }, [pins]);
  useEffect(() => {
    let cancelled = false;
    const element = host.current!;
    const fail = () => {
      scene.current?.destroy();
      scene.current = null;
      if (!cancelled) setFailed(true);
    };
    element.addEventListener('webglcontextlost', fail, true);
    import('./monitoring-scene')
      .then(({ createMonitoring }) => {
        if (cancelled) return;
        const s = createMonitoring(element, {
          onPick: (key) => latest.current.onPick(key),
          tag: label.current,
          hover: hover.current,
          pins: pinLayer.current,
          mark: mark.current,
          markRoom: markRoom.current,
        });
        scene.current = s;
        const now = latest.current;
        s.setPlans(now.plans);
        s.show(now.site, now.input);
        s.select(now.selected);
        s.setAmbience(now.ambience);
        s.setPins(now.pins);
      })
      .catch(fail);
    return () => {
      cancelled = true;
      element.removeEventListener('webglcontextlost', fail, true);
      scene.current?.destroy();
      scene.current = null;
    };
  }, [attempt]);
  // Label pilihan "Nama · status": bagian kedua tampil sebagai status di pil biru.
  const [title, status] = tag.split(' · ');
  return (
    <div className={STAGE}>
      <div
        ref={host}
        className="absolute inset-0 [--inset-bottom:24px] [--inset-left:24px] [--inset-right:24px] [--inset-top:24px] [&_canvas]:block [&_canvas]:size-full [&_canvas]:touch-none"
      />
      <div ref={pinLayer} className="pointer-events-none absolute inset-0 z-2" />
      <svg
        ref={markRoom}
        className="pointer-events-none absolute inset-0 z-2 size-full overflow-visible not-data-[on]:hidden [&_path]:fill-none [&_path]:stroke-accent-strong [&_path]:[stroke-linecap:round] [&_path]:[stroke-linejoin:round] [&_path]:[stroke-width:3.5] [&_path]:[filter:drop-shadow(0_2px_4px_color-mix(in_srgb,var(--accent-strong)_35%,transparent))] [&_polygon]:[fill:color-mix(in_srgb,var(--accent-strong)_7%,transparent)] [&_polygon]:[stroke:color-mix(in_srgb,var(--accent-strong)_38%,transparent)] [&_polygon]:[stroke-linejoin:round] [&_polygon]:[stroke-width:1.5]"
        aria-hidden="true"
      >
        <polygon />
        <path />
      </svg>
      <div
        ref={mark}
        className="pointer-events-none absolute top-0 left-0 z-2 rounded-[10px] border-[1.5px] border-[color-mix(in_srgb,var(--accent-strong)_32%,transparent)] bg-[color-mix(in_srgb,var(--accent-strong)_6%,transparent)] shadow-[0_0_0_4px_color-mix(in_srgb,var(--accent-strong)_6%,transparent)] [--siku:16px] data-[jenis=orang]:rounded-[14px]"
        hidden
        aria-hidden="true"
      >
        <i
          className={cn(CORNER, '-top-[3px] -left-[3px] rounded-tl-[10px] border-r-0 border-b-0')}
        />
        <i
          className={cn(CORNER, '-top-[3px] -right-[3px] rounded-tr-[10px] border-b-0 border-l-0')}
        />
        <i
          className={cn(
            CORNER,
            '-bottom-[3px] -left-[3px] rounded-bl-[10px] border-t-0 border-r-0',
          )}
        />
        <i
          className={cn(
            CORNER,
            '-right-[3px] -bottom-[3px] rounded-br-[10px] border-t-0 border-l-0',
          )}
        />
      </div>
      <div
        ref={hover}
        className="pointer-events-none absolute top-0 left-0 z-3 rounded-[8px] bg-surface px-2.5 py-[5px] text-[12px] font-semibold whitespace-nowrap text-ink shadow-card"
        hidden
        aria-hidden="true"
      />
      <div
        ref={label}
        className="pointer-events-none absolute top-0 left-0 z-3 inline-flex items-stretch overflow-hidden rounded-[8px] text-[12px] font-bold whitespace-nowrap shadow-[0_6px_16px_color-mix(in_srgb,var(--accent-strong)_28%,transparent)]"
        hidden
        aria-hidden="true"
      >
        <b className="bg-action px-[9px] py-[5px] text-on-action">{title}</b>
        {status && (
          <span className="bg-accent px-[9px] py-[5px] font-semibold text-accent-ink">
            {status}
          </span>
        )}
      </div>
      {failed && (
        <div
          className="absolute inset-0 z-1 flex flex-col items-center justify-center gap-3 bg-surface-3 p-6 text-ink-3"
          role="status"
        >
          <p>Tampilan 3D belum tersedia. Semua data tetap ada di kartu.</p>
          <button
            type="button"
            className={BTN}
            onClick={() => {
              setFailed(false);
              setAttempt((n) => n + 1);
            }}
          >
            Coba 3D lagi
          </button>
        </div>
      )}
      <div
        className={cn(
          CARD,
          'absolute top-4 right-4 z-3 flex flex-col items-center rounded-[14px] p-1 max-md:p-0.5',
        )}
        role="group"
        aria-label="Kontrol tampilan"
      >
        <button
          type="button"
          className={TOOL}
          aria-label="Perbesar"
          title="Perbesar"
          onClick={() => scene.current?.zoom(0.2)}
        >
          <Plus size={18} />
        </button>
        <button
          type="button"
          className={TOOL}
          aria-label="Perkecil"
          title="Perkecil"
          onClick={() => scene.current?.zoom(-0.2)}
        >
          <Minus size={18} />
        </button>
        <hr className="my-1 w-[22px] border-0 border-t border-line" />
        <button
          type="button"
          className={TOOL}
          aria-label="Putar ke kiri"
          title="Putar ke kiri"
          onClick={() => scene.current?.rotate(-1)}
        >
          <RotateCcw size={16} />
        </button>
        <button
          type="button"
          className={TOOL}
          aria-label="Putar ke kanan"
          title="Putar ke kanan"
          onClick={() => scene.current?.rotate(1)}
        >
          <RotateCw size={16} />
        </button>
        <button
          type="button"
          className={TOOL}
          aria-label="Kembali ke tampilan awal"
          title="Tampilan awal"
          onClick={() => scene.current?.home()}
        >
          <Home size={16} />
        </button>
      </div>
    </div>
  );
}
