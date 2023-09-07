import classNames from "classnames"
import { useCallback, useRef, useState } from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"

import Page from "components/Page"
import SearchInput from "components/SearchInput"
import format from "date-fns/format"
import getDay from "date-fns/getDay"
import viVN from "date-fns/locale/vi"
import parse from "date-fns/parse"
import startOfWeek from "date-fns/startOfWeek"
import { dateFnsLocalizer } from "react-big-calendar"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { getInvoices, updateInvoice, markInvoiceAsPaid } from "services/api/invoice"
import { resetPageIndex } from "slice/tableSlice"
import { formatStrapiArr, formatStrapiObj } from "utils/strapi"
import InvoiceTable from "./Components/InvoiceTable"
import InvoiceDetail from "./InvoiceDetail"
import { toast } from "react-toastify"
import { getErrorMessage } from "utils/error"

const locales = {
  vi: viVN,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

const Invoice = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [pageCount, setPageCount] = useState(0)
  const [detailData, setDetailData] = useState()
  const [searchKey, setSearchKey] = useState()
  const fetchIdRef = useRef(0)

  const fetchData = useCallback(
    async ({ pageSize, pageIndex }) => {
      const fetchId = ++fetchIdRef.current

      if (fetchId === fetchIdRef.current) {
        try {
          setLoading(true)
          let filters = {}
          if (searchKey?.length) {
            setDetailData(null)
            filters = {
              $or: [
                {
                  idu: { $containsi: searchKey },
                },
                // {
                //   name: { $containsi: searchKey },
                // },
              ],
            }
          }
          const res = await getInvoices(
            {
              pageSize: 10,
              page: pageIndex + 1,
            },
            filters
          )
          if (res.data) {
            const listTreatments = formatStrapiArr(res.data)
            let data2 = listTreatments?.map((treatment) => {
              const booking = formatStrapiObj(treatment?.booking)
              return {
                ...treatment,
                cashier_in_charge: formatStrapiObj(treatment?.cashier_in_charge),
                areaImage: formatStrapiObj(treatment?.areaImage),
                background: formatStrapiObj(treatment?.background),
                thumbnail: formatStrapiObj(treatment?.thumbnail),
                categories: formatStrapiArr(treatment?.categories),
                bookings: formatStrapiArr(treatment?.bookings),
                transactions: formatStrapiArr(treatment?.transactions),
                patient: formatStrapiObj(booking?.patient),
                medicalRecord: formatStrapiObj(booking?.medical_record),
                prescription: formatStrapiObj(treatment?.prescription),
                booking,
                treatmentHistories: formatStrapiArr(treatment?.treatmentHistories),
              }
            });

            setData(data2);
            setPageCount(res?.data?.meta?.pagination?.pageCount)
          }
        } catch (error) {
        } finally {
          setLoading(false)
        }
      }
    },
    [searchKey]
  )

  const togglePublish = useCallback(async () => {
      try {
        // const res = await updateInvoice(detailData?.id, {
        //   publishedAt: !!detailData?.publishedAt ? null : new Date().toISOString(),
        // })
        const res = await markInvoiceAsPaid(detailData?.id);
        let updatedData = formatStrapiObj(res.data)
        setDetailData((oldDetailData) => ({
          ...oldDetailData,
          publishedAt: updatedData?.publishedAt,
        }))
        // setData((oldData) => {
        //   const pos = oldData.findIndex((t) => t.id === detailData?.id)
        //   if (pos > -1) {
        //     oldData[pos].publishedAt = updatedData?.publishedAt
        //   }
        //   return oldData
        // })
        toast.success(
          `Thành công`
        )
      } catch (error) {
        toast.error(getErrorMessage(error))
      }
  }, [detailData?.id, detailData?.publishedAt])

  const onUpdate = useCallback(
    (newData) => {
      setDetailData(newData)
      const index = data?.findIndex((item) => item.id === newData?.id)

      setData((items) => {
        items[index] = newData
        return items
      })
    },
    [data]
  )

  console.log('detailData', detailData)

  return (
    <Page
      title="Quản lý hoá đơn"
    >
      <div className="w-full flex items-center gap-x-9">
        <SearchInput
          placeholder="Tìm kiếm bằng ID hoá đơn"
          className="flex-1"
          onSearch={(value) => {
            dispatch(resetPageIndex())
            setSearchKey(value)
          }}
        />
      </div>
      <div
        className={classNames({
          "w-full": !detailData,
          "sm:block flex gap-x-6": detailData,
        })}
      >
        <InvoiceTable
          data={data}
          loading={loading}
          pageCount={pageCount}
          activeRow={detailData}
          fetchData={fetchData}
          onClickRow={setDetailData}
        />
        {detailData && (
          <InvoiceDetail data={detailData} onTogglePublish={togglePublish} onUpdate={onUpdate} />
        )}
      </div>
    </Page>
  )
}

export default Invoice
