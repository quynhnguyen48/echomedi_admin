import classNames from "classnames"
import { useCallback, useRef, useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { JWT_TOKEN, BRANCH } from "../../constants/Authentication"

import Button from "components/Button"
import Icon from "components/Icon"
import Page from "components/Page"
import SearchInput from "components/SearchInput"
import { getListProducts, updateProduct } from "services/api/products"
import { getListServiceBundles } from "services/api/serviceBundle"
import { getListEmailTemplates } from "services/api/emailTemplates";
import { resetPageIndex } from "slice/tableSlice"
import { formatStrapiArr, formatStrapiObj } from "utils/strapi"
import { getErrorMessage } from "../../utils/error"
import ImportExportHistory from "./components/ImportExportHistory"
import ProductAnalytics from "./components/ProductAnalytics"
import ProductsTable from "./components/ProductsTable"
import ProductDetail from "./ProductDetail"
import {
  getPatientSource,
} from "services/api/patientSource";

const ServiceBundles = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [pageCount, setPageCount] = useState(0)
  const [detailData, setDetailData] = useState()
  const [searchKey, setSearchKey] = useState()
  const [patientSource, setPatientSource] = useState();

  const fetchIdRef = useRef(0)

  useEffect(() => {
    ; (async () => {
      try {
        const res = await getPatientSource()
        const data = formatStrapiArr(res?.data);
       
        let rs = data.map(r => {
          r.label = r.label;
          r.value = r.value;
          return r;
        })

        setPatientSource(rs);
      } catch (error) { }
    })()
  }, [])

  const fetchData = useCallback(
    async ({ pageSize, pageIndex }) => {
      const fetchId = ++fetchIdRef.current
      let filters = {
      }
      if (searchKey?.length) {
        filters = {
          $or: [
            { label: { $containsi: searchKey } },
          ],
        }
      }

      if (fetchId === fetchIdRef.current) {
        try {
          setLoading(true)
          const res = await getListEmailTemplates(
            {
              pageSize: 10,
              page: pageIndex + 1,
            },
            filters,
            "preview"
          )
          if (res.data) {
            const listProducts = formatStrapiArr(res.data)
            setData(
              listProducts?.map((product) => {
                return {
                  ...product,
                  medical_services: formatStrapiArr(product.medical_services)
                };
              })
            )
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
      const res = await updateProduct(detailData?.id, {
        publishedAt: !!detailData?.publishedAt ? null : new Date().toISOString(),
      })
      let updatedData = formatStrapiObj(res.data)
      setDetailData((oldDetailData) => ({
        ...oldDetailData,
        publishedAt: updatedData?.publishedAt,
      }))
      setData((oldData) => {
        const pos = oldData.findIndex((t) => t.id === detailData?.id)
        if (pos > -1) {
          oldData[pos].publishedAt = updatedData?.publishedAt
        }
        return oldData
      })
      toast.success(
        `Product ${!!detailData?.publishedAt ? "unpublished" : "published"} successfully!`
      )
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }, [detailData?.id, detailData?.publishedAt])

  const onUpdateProduct = useCallback(
    (newProductData) => {
      setDetailData(newProductData)
      const index = data?.findIndex((product) => product.id === newProductData?.id)

      setData((productItems) => {
        productItems[index] = newProductData
        return productItems
      })
    },
    [data]
  )

  return (
    <Page
      title="Quản lý email template"
    // rightContent={detailData ? <ProductAnalytics data={detailData} /> : <ImportExportHistory />}
    >
      <div className="w-full flex items-center gap-x-9">
        <SearchInput
          placeholder="Tìm bằng tên gói dịch vụ"
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
          "flex gap-x-6": detailData,
        })}
      >
        <ProductsTable
          data={data}
          loading={loading}
          pageCount={pageCount}
          activeRow={detailData}
          fetchData={fetchData}
          onClickRow={setDetailData}
        />
        {detailData && (
          <ProductDetail
            data={detailData}
            onUpdateProduct={onUpdateProduct}
            onTogglePublish={togglePublish}
            patientSource={patientSource}
          />
        )}
      </div>
    </Page>
  )
}

export default ServiceBundles
