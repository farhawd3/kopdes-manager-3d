'use client';
import { useEffect, useRef, useState } from 'react';
import { Home, Minus, Plus, RotateCcw, RotateCw } from 'lucide-react';
import type { MonitoringScene, PinPeta } from './monitoring-scene';
import type { LokasiMonitoring } from './bidang';
import type { CharacterPlan } from './character-plan';
import type { LogistikInput } from './warehouse-room';
import type { Suasana } from './monitor-data';

type Props = {
  lokasi: LokasiMonitoring;
  input: LogistikInput;
  plans: CharacterPlan[];
  selected: string;
  tag: string;
  suasana: Suasana;
  /** Hal yang perlu perhatian (≤5), tampil sebagai pin biru. */
  pins: PinPeta[];
  onPick: (key: string) => void;
};

/** Jembatan React ↔ adegan WebGL: lazy load, fallback, kontrol peta, dan label pilihan. */
export function MonitoringStage({ lokasi, input, plans, selected, tag, suasana, pins, onPick }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);
  const hover = useRef<HTMLDivElement>(null);
  const pinLayer = useRef<HTMLDivElement>(null);
  const mark = useRef<HTMLDivElement>(null);
  const markRuang = useRef<SVGSVGElement>(null);
  const scene = useRef<MonitoringScene | null>(null);
  const latest = useRef({ lokasi, input, plans, selected, suasana, pins, onPick });
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    latest.current = { lokasi, input, plans, selected, suasana, pins, onPick };
  });
  useEffect(() => {
    scene.current?.show(lokasi, input);
    scene.current?.select(latest.current.selected);
  }, [lokasi, input]);
  useEffect(() => {
    scene.current?.setPlans(plans);
  }, [plans]);
  useEffect(() => {
    scene.current?.select(selected);
  }, [selected]);
  useEffect(() => {
    scene.current?.setSuasana(suasana);
  }, [suasana]);
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
      .then(({ buatMonitoring }) => {
        if (cancelled) return;
        const s = buatMonitoring(element, {
          onPick: (key) => latest.current.onPick(key),
          tag: label.current,
          hover: hover.current,
          pins: pinLayer.current,
          mark: mark.current,
          markRuang: markRuang.current,
        });
        scene.current = s;
        const now = latest.current;
        s.setPlans(now.plans);
        s.show(now.lokasi, now.input);
        s.select(now.selected);
        s.setSuasana(now.suasana);
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
  const [judul, status] = tag.split(' · ');
  return (
    <div className="mt-stage">
      <div ref={host} className="mt-canvas" />
      <div ref={pinLayer} className="mt-pins" />
      <svg ref={markRuang} className="mt-mark-ruang" aria-hidden="true">
        <polygon />
        <path />
      </svg>
      <div ref={mark} className="mt-mark" hidden aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div ref={hover} className="mt-hover" hidden aria-hidden="true" />
      <div ref={label} className="mt-tag" hidden aria-hidden="true">
        <b>{judul}</b>
        {status && <span>{status}</span>}
      </div>
      {failed && (
        <div className="mt-fallback" role="status">
          <p>Tampilan 3D belum tersedia. Semua data tetap ada di kartu.</p>
          <button
            type="button"
            className="mt-btn"
            onClick={() => {
              setFailed(false);
              setAttempt((n) => n + 1);
            }}
          >
            Coba 3D lagi
          </button>
        </div>
      )}
      <div className="mt-card mt-map-tools" role="group" aria-label="Kontrol tampilan">
        <button type="button" aria-label="Perbesar" title="Perbesar" onClick={() => scene.current?.zoom(0.2)}>
          <Plus size={18} />
        </button>
        <button type="button" aria-label="Perkecil" title="Perkecil" onClick={() => scene.current?.zoom(-0.2)}>
          <Minus size={18} />
        </button>
        <hr />
        <button type="button" aria-label="Putar ke kiri" title="Putar ke kiri" onClick={() => scene.current?.putar(-1)}>
          <RotateCcw size={16} />
        </button>
        <button type="button" aria-label="Putar ke kanan" title="Putar ke kanan" onClick={() => scene.current?.putar(1)}>
          <RotateCw size={16} />
        </button>
        <button type="button" aria-label="Kembali ke tampilan awal" title="Tampilan awal" onClick={() => scene.current?.home()}>
          <Home size={16} />
        </button>
      </div>
    </div>
  );
}
