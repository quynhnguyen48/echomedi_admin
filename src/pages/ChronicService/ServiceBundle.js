import classNames from "classnames"
import { useCallback, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { JWT_TOKEN, BRANCH } from "../../constants/Authentication"

import Button from "components/Button"
import Icon from "components/Icon"
import Page from "components/Page"
import SearchInput from "components/SearchInput"
import { getListProducts, updateProduct } from "services/api/products"
import { getListChronicService } from "services/api/serviceBundle"
import { resetPageIndex } from "slice/tableSlice"
import { formatStrapiArr, formatStrapiObj } from "utils/strapi"
import { getErrorMessage } from "../../utils/error"
import ImportExportHistory from "./components/ImportExportHistory"
import ProductAnalytics from "./components/ProductAnalytics"
import ProductsTable from "./components/ProductsTable"
import ProductDetail from "./ProductDetail"
import { removeVietnameseTones } from "../../utils/string";

const ServiceBundles = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const currentUser = useSelector((state) => state.user.currentUser)

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [pageCount, setPageCount] = useState(0)
  const [detailData, setDetailData] = useState()
  const [searchKey, setSearchKey] = useState()

  const fetchIdRef = useRef(0)

  const fetchData = useCallback(
    async ({ pageSize, pageIndex }) => {
      const fetchId = ++fetchIdRef.current
      let filters = {
      }
      if (searchKey?.length) {
        filters = {
          $or: [
            { label_i: { $containsi: searchKey } },
          ],
        }
      }

      if (fetchId === fetchIdRef.current) {
        try {
          setLoading(true)
          const res = await getListChronicService(
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
  console.log("data",data)
  return (
    <Page
      title="Quản lý gói dịch vụ mạn tính"
    >
      <div className="w-full flex items-center gap-x-9">
        <SearchInput
          placeholder="Tìm bằng tên gói dịch vụ"
          className="flex-1"
          onSearch={(value) => {
            dispatch(resetPageIndex())
            setSearchKey(removeVietnameseTones(value))
          }}
        />
      </div>

      <div
        className={classNames({
          "w-full": !detailData,
          "sm:block flex gap-x-6": detailData,
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
            editable={currentUser?.role?.type == "admin"}
            data={detailData}
            onUpdateProduct={onUpdateProduct}
            onTogglePublish={togglePublish}
          />
        )}
      </div>
    </Page>
  )
}

export default ServiceBundles
