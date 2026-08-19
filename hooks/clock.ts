const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export function stamp(now: Date) {
  const dd = String(now.getDate()).padStart(2, "0");
  const mon = MONTHS[now.getMonth()];
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return `${dd} ${mon} ${now.getFullYear()} ${hh}:${mm}:${ss}`;
}
