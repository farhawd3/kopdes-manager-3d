import { AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { Item } from '@/features/records/schemas';
import { Progress } from '@/components/ui/Progress';

export function Meter({ value }: { value: number | null }) {
  return (
    <div className="meter-row">
      <Progress value={value} label="Kesiapan" />
      <strong>{value === null ? 'Belum dinilai' : `${value}%`}</strong>
    </div>
  );
}

export function RiskMatrix({ items }: { items: Item[] }) {
  const activeRisks = items.filter((row) => row.data.status !== 'ditutup');

  const highRisks = activeRisks.filter(
    (row) => Number(row.data.probability || 3) * Number(row.data.impact || 3) >= 15,
  );
  const mediumRisks = activeRisks.filter((row) => {
    const score = Number(row.data.probability || 3) * Number(row.data.impact || 3);
    return score >= 8 && score < 15;
  });
  const lowRisks = activeRisks.filter(
    (row) => Number(row.data.probability || 3) * Number(row.data.impact || 3) < 8,
  );

  const probabilityLevels = [
    {
      key: 'high',
      label: 'Sering',
      desc: 'Kemungkinan besar terjadi',
      test: (p: number) => p >= 4,
    },
    {
      key: 'mid',
      label: 'Kadang',
      desc: 'Pernah / sesekali terjadi',
      test: (p: number) => p === 3,
    },
    { key: 'low', label: 'Jarang', desc: 'Kecil kemungkinan muncul', test: (p: number) => p <= 2 },
  ];

  const impactLevels = [
    { key: 'low', label: 'Dampak Ringan', desc: 'Gangguan kecil', test: (i: number) => i <= 2 },
    {
      key: 'mid',
      label: 'Dampak Sedang',
      desc: 'Menghambat operasional',
      test: (i: number) => i === 3,
    },
    {
      key: 'high',
      label: 'Dampak Fatal',
      desc: 'Kerugian besar / izin terancam',
      test: (i: number) => i >= 4,
    },
  ];

  return (
    <section className="card risk-dashboard-section">
      <div className="section-head">
        <div>
          <h2>Peta risiko</h2>
          <p className="risk-subtitle">Kemungkinan terjadi (baris) dan besar dampak (kolom).</p>
        </div>
        <span className="badge">{activeRisks.length} dipantau</span>
      </div>

      <ul className="risk-tier-row" aria-label="Tingkat risiko">
        <li className="risk-tier tier-high">
          <ShieldAlert size={16} aria-hidden />
          <span>Kritis</span>
          <strong>{highRisks.length}</strong>
        </li>
        <li className="risk-tier tier-medium">
          <AlertTriangle size={16} aria-hidden />
          <span>Waspada</span>
          <strong>{mediumRisks.length}</strong>
        </li>
        <li className="risk-tier tier-low">
          <ShieldCheck size={16} aria-hidden />
          <span>Terkendali</span>
          <strong>{lowRisks.length}</strong>
        </li>
      </ul>

      {/* Matriks 3x3 yang Ramah & Mudah Dipahami */}
      <div className="risk-matrix-wrapper">
        <div className="risk-matrix-scroll" role="region" aria-label="Matriks risiko" tabIndex={0}>
          <div className="risk-matrix-clean">
            <div className="matrix-header-corner" />
            {impactLevels.map((imp) => (
              <div key={imp.key} className="matrix-col-header">
                <strong>{imp.label}</strong>
                <small>{imp.desc}</small>
              </div>
            ))}

            {probabilityLevels.map((prob) => {
              return (
                <div key={`row-${prob.key}`} className="matrix-row-container">
                  <div className="matrix-row-header">
                    <strong>{prob.label}</strong>
                    <small>{prob.desc}</small>
                  </div>
                  {impactLevels.map((imp) => {
                    const cellItems = activeRisks.filter(
                      (r) =>
                        prob.test(Number(r.data.probability || 3)) &&
                        imp.test(Number(r.data.impact || 3)),
                    );
                    const isHigh =
                      (prob.key === 'high' && (imp.key === 'high' || imp.key === 'mid')) ||
                      (prob.key === 'mid' && imp.key === 'high');
                    const isMed =
                      (prob.key === 'high' && imp.key === 'low') ||
                      (prob.key === 'mid' && imp.key === 'mid') ||
                      (prob.key === 'low' && imp.key === 'high');
                    const cellTier = isHigh ? 'cell-high' : isMed ? 'cell-medium' : 'cell-low';

                    return (
                      <div key={`${prob.key}-${imp.key}`} className={`matrix-cell ${cellTier}`}>
                        <div className="matrix-cell-content">
                          <span className="cell-count-badge">
                            {cellItems.length ? `${cellItems.length} risiko` : ''}
                          </span>
                          {cellItems.slice(0, 2).map((item) => (
                            <div
                              key={item.id}
                              className="matrix-risk-title"
                              title={String(item.data.title)}
                            >
                              {String(item.data.title)}
                            </div>
                          ))}
                          {cellItems.length > 2 && (
                            <span className="matrix-more">+{cellItems.length - 2} lainnya</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </section>
  );
}
