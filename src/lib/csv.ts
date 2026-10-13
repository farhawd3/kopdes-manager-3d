/** CSV dengan koma, kutip ganda, dan baris baru di dalam sel. */
export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [],
    field = '',
    quoted = false,
    closed = false;
  const finishRow = () => {
    row.push(field);
    if (row.some((value) => value.trim())) rows.push(row);
    row = [];
    field = '';
    closed = false;
  };
  const input = text.replace(/^\uFEFF/, '');
  for (let index = 0; index < input.length; index++) {
    const char = input[index];
    if (quoted) {
      if (char === '"' && input[index + 1] === '"') {
        field += '"';
        index++;
      } else if (char === '"') {
        quoted = false;
        closed = true;
      } else field += char;
    } else if (char === ',') {
      row.push(field);
      field = '';
      closed = false;
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && input[index + 1] === '\n') index++;
      finishRow();
    } else if (closed) {
      if (char !== ' ' && char !== '\t') throw new Error('Ada teks setelah kutip penutup CSV.');
    } else if (char === '"') {
      if (field) throw new Error('Kutip CSV harus berada di awal sel.');
      quoted = true;
    } else field += char;
  }
  if (quoted) throw new Error('Kutip CSV belum ditutup.');
  finishRow();
  if (rows.length < 2) throw new Error('CSV kosong atau tidak memiliki baris data.');
  const headers = rows.shift()!.map((value) => value.trim());
  if (headers.some((header) => !header) || new Set(headers).size !== headers.length)
    throw new Error('Judul kolom CSV harus terisi dan tidak boleh ganda.');
  return rows.map((values, index) => {
    if (values.length !== headers.length)
      throw new Error(`Jumlah kolom pada baris ${index + 2} tidak sesuai.`);
    return Object.fromEntries(headers.map((header, column) => [header, values[column]]));
  });
}
