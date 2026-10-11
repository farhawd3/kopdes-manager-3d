'use client';
import { useState } from 'react';
import type { Workspace } from '../workspace/useWorkspace';
import { TaskTimeline } from '../tasks/TaskTimeline';
import { MilestoneTracker } from '../projects/MilestoneTracker';
import { Select } from '@/components/ui/Select';
import { Ikon3D } from '@/components/ui/Ikon3D';
export function Roadmap({ data, refresh }: { data: Workspace; refresh: () => Promise<void> }) {
  const [project, setProject] = useState('');
  return (
    <>
      <div className="module-intro">
        <div>
          <h2 className="judul-halaman">
            <Ikon3D kind="bendera" size={30} />
            Linimasa
          </h2>
          <p>Atur tanggal, hubungan antarpekerjaan, dan milestone dalam satu garis waktu.</p>
        </div>
        <label>
          <span>Proyek</span>
          <Select
            value={project}
            onChange={setProject}
            options={[
              { value: '', label: 'Semua Proyek' },
              ...(data.workstreams || []).map((row) => ({
                value: row.id,
                label: String(row.data.title),
              })),
            ]}
            ariaLabel="Proyek"
          />
        </label>
      </div>
      <TaskTimeline
        key={project}
        items={(data['work-items'] || []).filter(
          (row) => !project || row.data.workstream_id === project,
        )}
        workspace={data}
        refresh={refresh}
        scopeId={project || undefined}
      />
      <div className="milestone-section">
        <MilestoneTracker
          workspace={data}
          refresh={refresh}
          scopeProjectId={project || undefined}
        />
      </div>
    </>
  );
}
