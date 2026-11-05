export interface PageRange {
  start: number;
  end: number;
}
export function invoicePageRanges(
  height: number,
  pageHeight: number,
  blocks: PageRange[] = [],
): PageRange[] {
  if (
    !Number.isFinite(height) ||
    height <= 0 ||
    !Number.isFinite(pageHeight) ||
    pageHeight < 1
  )
    throw new Error("Invalid invoice page dimensions");
  const ranges: PageRange[] = [];
  let start = 0;
  while (start < height) {
    let end = Math.min(height, start + Math.floor(pageHeight));
    const crossing = blocks.find(
      (b) =>
        b.start > start &&
        b.start < end &&
        b.end > end &&
        b.end - b.start <= pageHeight,
    );
    if (crossing) end = Math.floor(crossing.start);
    if (end <= start) end = Math.min(height, start + Math.floor(pageHeight));
    ranges.push({ start, end });
    start = end;
  }
  return ranges;
}
