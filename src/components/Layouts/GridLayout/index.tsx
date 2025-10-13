import { useEffect } from "react";
import { ActionIcon, Box, rem, Text } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

import { useGridLayout } from "./useGridLayout";
import { BaseItem } from "..";
import { usePagination } from "./usePagination";

type Props = {
  items: BaseItem[];
  onClickItem?: (id: string) => void;
};

export function GridLayout(props: Props) {
  const { items, onClickItem } = props;

  const { ref, width, height } = useElementSize();

  // TODO: [5] LiveKit 로직 사용으로 같은 훅 두번 사용해야 원하는 UI 를 그릴 수 있음, 수정 필요
  const { maxTiles } = useGridLayout({
    width,
    height,
    trackCount: items.length,
  });

  const {
    totalPage,
    page,
    setPage,
    firstItemIndex,
    lastItemIndex,
    hasPrevPage,
    hasNextPage,
    setPrevPage,
    setNextPage,
  } = usePagination({
    totalCount: items.length,
    pageSize: maxTiles,
  });

  const { rows, columns } = useGridLayout({
    width,
    height,
    trackCount: items.slice(firstItemIndex, lastItemIndex).length,
  });

  useEffect(() => {
    if (page > totalPage) {
      setPage(Math.min(page, totalPage));
    }
  }, [totalPage, page, setPage]);

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        width: "100%",
        height: "100%",
      }}
    >
      <Box
        ref={ref}
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          width: "100%",
          height: "100%",
          overflow: "hidden",
          "--grid-col-count": columns,
          "--grid-row-count": rows,
        }}
      >
        {items.slice(firstItemIndex, lastItemIndex).map((item) => (
          <Box
            key={item.id}
            style={{
              padding: rem(4),
              width: "calc(100% / var(--grid-col-count))",
              height: "calc(100% / var(--grid-row-count))",
            }}
            onClick={() => {
              onClickItem && onClickItem(item.id);
            }}
          >
            {item.render()}
          </Box>
        ))}
      </Box>

      {totalPage > 1 ? (
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: rem(8),
            marginTop: rem(4),
          }}
        >
          <ActionIcon
            variant="light"
            size="sm"
            onClick={setPrevPage}
            disabled={!hasPrevPage}
          >
            <IconChevronLeft style={{ width: rem(16), height: rem(16) }} />
          </ActionIcon>

          <Text
            fz="sm"
            style={{ fontVariantNumeric: "tabular-nums", color: "#fff" }}
          >{`${page} / ${totalPage}`}</Text>

          <ActionIcon
            variant="light"
            size="sm"
            onClick={setNextPage}
            disabled={!hasNextPage}
          >
            <IconChevronRight style={{ width: rem(16), height: rem(16) }} />
          </ActionIcon>
        </Box>
      ) : null}
    </Box>
  );
}
