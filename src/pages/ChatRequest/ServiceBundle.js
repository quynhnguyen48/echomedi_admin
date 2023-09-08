import classNames from "classnames"
import { useCallback, useRef, useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { JWT_TOKEN, BRANCH } from "../../constants/Authentication"

import Button from "components/Button"
import Icon from "components/Icon"
import Page from "components/Page"
import SearchInput from "components/SearchInput"
import { getListProducts, updateProduct } from "services/api/products"
import { getListServiceBundles } from "services/api/serviceBundle"
import { getListConversationQueues } from "services/api/conversationQueue"
import { resetPageIndex } from "slice/tableSlice"
import { formatStrapiArr, formatStrapiObj } from "utils/strapi"
import { getErrorMessage } from "../../utils/error"
import ImportExportHistory from "./components/ImportExportHistory"
import ProductAnalytics from "./components/ProductAnalytics"
import ProductsTable from "./components/ProductsTable"
import { io } from "socket.io-client";
import axios from "../../services/axios";
import { formatDate } from "utils/dateTime"

const ServiceBundles = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [pageCount, setPageCount] = useState(0)
  const [detailData, setDetailData] = useState()
  const [searchKey, setSearchKey] = useState()
  const [conversations, setConversations] = useState([]);
  const currentUser = useSelector((state) => state.user.currentUser);

  const fetchIdRef = useRef(0)

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
          const res = await getListConversationQueues(
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
              listProducts
            )
            setPageCount(res?.data?.meta?.pagination?.pageCount);
          }
        } catch (error) {
        } finally {
          setLoading(false)
        }
      }
    },
    [searchKey]
  )

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

  // const loadConversation = async () => {
  //   await axios.get("/conversation-queues?populate[user][populate]=*&populate[second_person][populate]=*&filters[second_person][id][\$null]=true")
  //     .then((response) => {
  //       setConversations(response.data?.data);
  //     })
  //     .finally(() => {
  //       // toast.dismiss(toastId);
  //     });
  // }

  const createConversation = async (c) => {
    console.log('c', c)
    c.second_person = currentUser.id;
    await axios.put("/conversation-queues/" + c.id, { data: c })
      .then((response) => {
        navigate(`/chat/${c?.id}/${c.user?.data.attributes.email}`)
      })
      .finally(() => {
        // toast.dismiss(toastId);
      });
  }

  const askForPermissioToReceiveNotifications = async () => {
    try {
      const messaging = firebase.messaging();
      await messaging.requestPermission();
      const token = await messaging.getToken();

      return token;
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Page
      title="Nhắn tin"
    >
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
          createConversation={createConversation}
          // onClickRow={setDetailData}
        />
        {/* {detailData && <CustomerDetail data={detailData} onToggleStatus={null} />} */}
      </div>

    </Page>
  )
}

export default ServiceBundles
