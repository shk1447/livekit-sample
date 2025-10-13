/**
 * 인자로 받은 배열의 마지막 요소를 반환합니다.
 *
 * @example
 * last([]); // undefined
 * last([1, 2, 3]); // 3
 */
export const last = <T>(arr: T[]): T | undefined => {
  return arr[arr.length - 1];
};

type Props = {
  width: number;
  height: number;
  trackCount: number;
};
// 그리드 코드 정리 필요
export const useGridLayout = (props: Props) => {
  const { width, height, trackCount } = props;

  return width > 0 && height > 0
    ? selectGridLayout(GRID_LAYOUTS, trackCount, width, height)
    : GRID_LAYOUTS[0];
};

// TODO: [5] 리팩토링 필요, LiveKit 로직
function selectGridLayout(
  layouts: GridLayoutDefinition[],
  participantCount: number,
  width: number,
  height: number
): GridLayoutDefinition {
  // Find the best layout to fit all participants.
  let currentLayoutIndex = 0;
  let layout = layouts.find((layout_, index, allLayouts) => {
    currentLayoutIndex = index;
    const isBiggerLayoutAvailable =
      allLayouts.findIndex((l, i) => {
        const layoutIsBiggerThanCurrent = i > index;
        const layoutFitsSameAmountOfParticipants =
          l.maxTiles === layout_.maxTiles;
        return layoutIsBiggerThanCurrent && layoutFitsSameAmountOfParticipants;
      }) !== -1;
    return layout_.maxTiles >= participantCount && !isBiggerLayoutAvailable;
  });
  if (layout === undefined) {
    layout = last(layouts);
    if (!layout) {
      throw new Error(`No layout or fallback layout found.`);
    }
  }

  // Check if the layout fits into the screen constraints. If not, recursively check the next smaller layout.
  if (width < layout.minWidth || height < layout.minHeight) {
    // const currentLayoutIndex = layouts.indexOf(layout);
    if (currentLayoutIndex > 0) {
      const smallerLayout = layouts[currentLayoutIndex - 1];
      layout = selectGridLayout(
        layouts.slice(0, currentLayoutIndex),
        smallerLayout.maxTiles,
        width,
        height
      );
    }
  }
  return layout;
}

type GridLayoutDefinition = {
  /** Layout name (convention `<column_count>x<row_count>`). */
  name: string;
  /** Column count of the layout. */
  columns: number;
  /** Row count of the layout. */
  rows: number;
  // # Constraints that have to be meet to use this layout.
  // ## 1. Participant range:
  /** Minimum number of tiles needed to use this layout. */
  minTiles: number;
  /** Maximum tiles that fit into this layout. */
  maxTiles: number;
  // ## 2. Screen size limits:
  /** Minimum width required to use this layout. */
  minWidth: number;
  /** Minimum height required to use this layout. */
  minHeight: number;
};

const GRID_LAYOUTS: GridLayoutDefinition[] = [
  {
    columns: 1,
    rows: 1,
    name: "1x1",
    minTiles: 1,
    maxTiles: 1,
    minWidth: 0,
    minHeight: 0,
  },
  {
    columns: 1,
    rows: 2,
    name: "1x2",
    minTiles: 2,
    maxTiles: 2,
    minWidth: 0,
    minHeight: 0,
  },
  {
    columns: 2,
    rows: 1,
    name: "2x1",
    minTiles: 2,
    maxTiles: 2,
    minWidth: 900,
    minHeight: 0,
  },
  {
    columns: 2,
    rows: 2,
    name: "2x2",
    minTiles: 3,
    maxTiles: 4,
    minWidth: 560,
    minHeight: 0,
  },
  {
    columns: 3,
    rows: 2,
    name: "3x2",
    minTiles: 5,
    maxTiles: 6,
    minWidth: 700,
    minHeight: 0,
  },
  {
    columns: 3,
    rows: 3,
    name: "3x3",
    minTiles: 7,
    maxTiles: 9,
    minWidth: 700,
    minHeight: 0,
  },
  {
    columns: 4,
    rows: 3,
    name: "4x3",
    minTiles: 10,
    maxTiles: 12,
    minWidth: 960,
    minHeight: 0,
  },
  {
    columns: 4,
    rows: 4,
    name: "4x4",
    minTiles: 13,
    maxTiles: 16,
    minWidth: 960,
    minHeight: 0,
  },
  // {
  //   columns: 5,
  //   rows: 5,
  //   name: '5x5',
  //   minTiles: 17,
  //   maxTiles: 25,
  //   minWidth: 1100,
  //   minHeight: 0,
  // },
];
