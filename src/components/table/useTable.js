import { useState, useCallback } from 'react';

import { dispatch } from '../../redux/store.ts';

// ----------------------------------------------------------------------

export default function useTable(props) {
  const [dense, setDense] = useState(!!props?.defaultDense);

  const [orderBy, setOrderBy] = useState(props?.defaultOrderBy || 'name');

  const [order, setOrder] = useState(props?.defaultOrder || 'asc');

  const [page, setPage] = useState(props?.defaultCurrentPage || 0);

  const [rowsPerPage, setRowsPerPage] = useState(props?.defaultRowsPerPage || 5);

  // console.log("defaultSelected:", props?.defaultSelected);

  const [selected, setSelected] = useState(props?.defaultSelected || new Set());

  // console.log("table after setting selected:", selected);

  const onSort = useCallback(
    (id) => {
      const isAsc = orderBy === id && order === 'asc';
      if (id !== '') {
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(id);
      }
    },
    [order, orderBy],
  );

  const onSelectRow = useCallback(
    (id) => {
      const newSelected = new Set(selected);

      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }

      setSelected(newSelected);
    },
    [selected, props.mode, dispatch],
  );

  const onSelectAllRows = useCallback(
    (checked, newSelecteds) => {
      if (checked) {
        const newSet = new Set(newSelecteds);
        setSelected(newSet);
      } else {
        setSelected(new Set());
      }
    },
    [props.mode, dispatch],
  );

  const onChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback((event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  }, []);

  const onChangeDense = useCallback((event) => {
    setDense(event.target.checked);
  }, []);

  // console.log("table final selected:", selected);

  return {
    dense,
    order,
    page,
    orderBy,
    rowsPerPage,
    //
    selected,
    onSelectRow,
    onSelectAllRows,
    //
    onSort,
    onChangePage,
    onChangeDense,
    onChangeRowsPerPage,
    //
    setPage,
    setDense,
    setOrder,
    setOrderBy,
    setSelected,
    setRowsPerPage,
  };
}
