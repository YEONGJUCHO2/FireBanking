const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function toKstParts(date: Date) {
  const kst = new Date(date.getTime() + KST_OFFSET_MS);

  return {
    year: kst.getUTCFullYear(),
    monthIndex: kst.getUTCMonth(),
  };
}

export function getKstMonthEndDate(date: Date) {
  const { year, monthIndex } = toKstParts(date);
  const end = new Date(Date.UTC(year, monthIndex + 1, 0));

  return end.toISOString().slice(0, 10);
}

export function getSnapshotMonthDate(snapshotDate: string) {
  return `${snapshotDate.slice(0, 7)}-01`;
}
