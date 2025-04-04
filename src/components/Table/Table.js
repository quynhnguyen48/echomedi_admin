import { useCallback, useEffect } from "react"
import { useTable, useResizeColumns, useFlexLayout, useRowSelect, usePagination } from "react-table"
import ReactPaginate from "react-paginate"
import classNames from "classnames"
import fill from "lodash/fill"
import { useSelector } from "react-redux"
import { useSearchParams } from "react-router-dom"

import Icon from "components/Icon"
import Empty from "components/Empty/Empty"
import TableRowSkeleton from "./TableRowSkeleton"
import { isMobile } from "react-device-detect"

const headerProps = (props, { column }) => getStyles(props, column.align)

const cellProps = (props, { cell }) => getStyles(props, cell.column.align)

const getStyles = (props, align = "left") => [
  props,
  {
    style: {
      paddingRight: align === "right" ? 20 : 0,
      textAlign: align,
      justifyContent: align === "right" ? "flex-end" : "flex-start",
      alignItems: "flex-start",
      display: "flex",
    },
  },
]

const Table = ({
  hidePagination,
  columns,
  data,
  fetchData,
  loading,
  pageCount: controlledPageCount,
  className,
  onClickRow,
  activeRow,
  isModal = false,
  fullHeight = false,
  disableLineClamp = false,
  rowClassName,
  createConversation,
}) => {
  const [searchParams, setSearchParams] = useSearchParams()

  const isResetPageIndex = useSelector((state) => state.table.isResetPageIndex)

  const {
    rows,
    getTableProps,
    headerGroups,
    prepareRow,
    pageCount,
    gotoPage,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: searchParams.get("page") ? searchParams.get("page") - 1 : 0 },
      manualPagination: true,
      pageCount: controlledPageCount,
    },
    usePagination,
    useResizeColumns,
    useFlexLayout,
    useRowSelect
  )

  const handlePageClick = useCallback(
    (event) => {
      setSearchParams(`page=${event.selected + 1}`)
      gotoPage(event.selected)
    },
    [gotoPage, setSearchParams]
  )

  // Listen for changes in pagination and use the state to fetch our new data
  useEffect(() => {
    if (typeof fetchData === "function") {
      fetchData({ pageIndex, pageSize })
    }
  }, [fetchData, pageIndex, pageSize])

  useEffect(() => {
    if (isResetPageIndex) {
      gotoPage(0)
    }
  }, [gotoPage, isResetPageIndex])

  return (
    <div>
      <div
        {...getTableProps()}
        className={`border border-grey overflow-auto ${className} ${!fullHeight && !isMobile && "h-[calc(100vh-180px)]"}`}
      >
        <div className="flex bg-primary sticky top-0 full-w z-10 opacity-90">
          {headerGroups.map((headerGroup) => (
            <div {...headerGroup.getHeaderGroupProps()} className="px-6">
              {headerGroup.headers.map(
                (column) =>
                  !column.hidden && (
                    <div
                      {...column.getHeaderProps(headerProps)}
                      className="text-16 py-2 font-bold text-secondary/30 !pr-0 !text-white"
                    >
                      {column.render("Header")}
                    </div>
                  )
              )}
            </div>
          ))}
        </div>
        <div className="mt-0 space-y-1">
          {loading ? (
            fill(new Array(10), "")?.map((_, i) => (
              <TableRowSkeleton key={i} headerGroups={headerGroups} />
            ))
          ) : rows?.length ? (
            rows.map((row) => {
              prepareRow(row)
              const isActive = `${activeRow?.id}` === `${row?.original?.id}`

              return (
                <div
                  key={row.id}
                  className="flex -ml-0.5 cursor-pointer"
                  onClick={(e) => {
                    onClickRow && onClickRow(row?.original, e.target?.id)
                  }}
                >
                  <div
                    {...row.getRowProps()}
                    className={classNames("relative flex items-center py-2 px-2", {
                      "text-white bg-primary": isActive,
                      "bg-primary/10": isModal,
                      "shadow-sm": !isModal,
                      [rowClassName]: true,
                    })}
                    // style={{
                    //   backgroundColor: "red"
                    // }}
                  >
                    {row.cells.map((cell) => {
                      if (cell.column.hidden) return null
                      return (
                        <div
                          {...cell.getCellProps(cellProps)}
                          className={`text-14 ${!disableLineClamp && "!line-clamp-2"} !pr-0`}
                        >
                          {cell.render("Cell")}
                        </div>
                      )
                    })}
                    {isActive && (
                      <div className="absolute right-4">
                        <Icon name="arrows/right" />
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <Empty />
          )}
        </div>
      </div>
      <ReactPaginate
        className={`flex items-center justify-end gap-x-4 mt-2 pb-4 mb-0`}
        pageClassName="bg-primary/10 rounded text-14"
        pageLinkClassName="w-6 h-6 flex items-center justify-center"
        activeClassName="!bg-primary text-white font-bold"
        disabledClassName="cursor-not-allowed opacity-30"
        breakLabel={<Icon name="more-square" className="opacity-30" />}
        previousLabel={<Icon name="arrows/left-square" />}
        nextLabel={<Icon name="arrows/right-square" />}
        forcePage={pageIndex || 0}
        onPageChange={handlePageClick}
        marginPagesDisplayed={1}
        pageRangeDisplayed={3}
        pageCount={pageCount}
        renderOnZeroPageCount={null}
      />
    </div>
  )
}

export default Table
