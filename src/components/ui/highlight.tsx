/** Menandai kata yang dicari di teks hasil agar alasan kecocokan langsung terlihat. */
export function Highlight({ text, query }: { text: string; query: string }) {
  const words = query
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 1)
    .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!words.length) return text;
  // split dengan grup tangkap: bagian ganjil adalah kata yang cocok.
  return text.split(new RegExp(`(${words.join('|')})`, 'gi')).map((part, index) =>
    index % 2 ? (
      <mark key={index} className="rounded-[3px] bg-warn text-warn-ink">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}
