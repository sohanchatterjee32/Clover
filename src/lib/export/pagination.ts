export const A4_WIDTH_PX = 794;
export const A4_HEIGHT_PX = 1123;

export interface PaginatableBlock {
  id: string;
  keepWithNext?: boolean;
}

export function paginateBlocks<T extends PaginatableBlock>(
  blocks: T[],
  heights: Record<string, number>,
  pageBudgetPx: number,
  fallbackBlockHeight = 40
): T[][] {
  if (blocks.length === 0) return [[]];

  const pages: T[][] = [];
  let currentPage: T[] = [];
  let currentUsed = 0;

  let i = 0;
  while (i < blocks.length) {
    // Group consecutive blocks linked by keepWithNext (e.g., section-header -> exp-header -> first achievement)
    const group: T[] = [blocks[i]];
    let j = i;
    while (blocks[j].keepWithNext && j + 1 < blocks.length) {
      j += 1;
      group.push(blocks[j]);
    }

    const groupHeight = group.reduce(
      (sum, item) => sum + (heights[item.id] ?? fallbackBlockHeight),
      0
    );

    if (currentPage.length > 0 && currentUsed + groupHeight > pageBudgetPx) {
      pages.push(currentPage);
      currentPage = [];
      currentUsed = 0;
    }

    for (const item of group) {
      currentPage.push(item);
      currentUsed += heights[item.id] ?? fallbackBlockHeight;
    }

    i = j + 1;
  }

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return pages.length > 0 ? pages : [[]];
}
