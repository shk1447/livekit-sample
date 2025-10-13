import { useState } from "react";

type Props = {
  totalCount: number;
  pageSize: number;
  initialPage?: number;
};

export const usePagination = (props: Props) => {
  const { totalCount, pageSize, initialPage = 1 } = props;

  const totalPage = Math.max(Math.ceil(totalCount / pageSize), 1);
  const [page, setPage] = useState(Math.max(initialPage, 1));

  const lastItemIndex = page * pageSize;
  const firstItemIndex = lastItemIndex - pageSize;

  const hasPrevPage = page > 1;
  const hasNextPage = page < totalPage;

  const setPrevPage = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const setNextPage = () => {
    setPage((prev) => Math.min(prev + 1, totalPage));
  };

  const setPageSafety = (page: number) => {
    setPage(Math.max(Math.min(page, 1), totalPage));
  };

  return {
    totalPage,
    page,
    setPage: setPageSafety,
    setPrevPage,
    setNextPage,
    firstItemIndex,
    lastItemIndex,
    hasPrevPage,
    hasNextPage,
  };
};
