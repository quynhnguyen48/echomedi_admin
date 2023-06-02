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
import { resetPageIndex } from "slice/tableSlice"
import { formatStrapiArr, formatStrapiObj } from "utils/strapi"
import { getErrorMessage } from "../../utils/error"
import ImportExportHistory from "./components/ImportExportHistory"
import ProductAnalytics from "./components/ProductAnalytics"
import ProductsTable from "./components/ProductsTable"
import ProductDetail from "./ProductDetail"
import { io } from "socket.io-client";
import axios from "../../services/axios";

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
          const res = await getListServiceBundles(
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

  const loadConversation = async () => {
    await axios.get("/conversation-queues?populate[user][populate]=*&populate[second_person][populate]=*&filters[second_person][id][\$null]=true")
      .then((response) => {
        console.log('response', response.data?.data)
        setConversations(response.data?.data);

      })
      .finally(() => {
        // toast.dismiss(toastId);
      });
  }

  const createConversation = async (c) => {
    c.attributes["second_person"] = currentUser.id;
    await axios.put("/conversation-queues/" + c.id, { data: c.attributes })
      .then((response) => {
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
      console.log('token do usuário:', token);

      return token;
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {

    loadConversation();

    var socket = io();
  }, []);

  return (
    <Page
      title="Nhắn tin"
    // rightContent={detailData ? <ProductAnalytics data={detailData} /> : <ImportExportHistory />}
    >
      <div className="w-full flex items-center gap-x-9">
        <div class="container mx-auto">
          <div class="min-w-full border rounded lg:grid lg:grid-cols-3">
            <div class="border-r border-gray-300 lg:col-span-1">
              <div class="mx-3 my-3">
                <div class="relative text-gray-600">
                  <span class="absolute inset-y-0 left-0 flex items-center pl-2">
                    <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      viewBox="0 0 24 24" class="w-6 h-6 text-gray-300">
                      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </span>
                  <input type="search" class="block w-full py-2 pl-10 bg-gray-100 rounded outline-none" name="search"
                    placeholder="Search" required />
                </div>
              </div>

              <ul class="overflow-auto h-[32rem]">
                <li>
                  {conversations && conversations.map(c => <a
                    class="flex items-center px-3 py-2 text-sm transition duration-150 ease-in-out border-b border-gray-300 cursor-pointer hover:bg-gray-100 focus:outline-none"
                  >
                    {/* <button 
                    class="flex items-center px-3 py-2 text-sm transition duration-150 ease-in-out border-gray-300 cursor-pointer hover:bg-gray-100 focus:outline-none"
                    onClick={e => {
                          navigate(`/chat/${c?.id}/${c.attributes.user?.data.attributes.email}`)
                        }}> */}
                    <img class="object-cover w-10 h-10 rounded-full"
                      src="https://cdn.pixabay.com/photo/2018/09/12/12/14/man-3672010__340.jpg" alt="username" />
                    <div class="w-full pb-2">
                      <div class="flex justify-between">

                        <span class="block ml-2 font-semibold text-gray-600">{c.attributes.user.data.attributes.patient.data?.attributes.full_name}</span>
                        {/* <span class="block ml-2 text-sm text-gray-600">25 minutes</span> */}
                      </div>
                      {/* <span class="block ml-2 text-sm text-gray-600">bye</span> */}
                    </div>
                    <button
                      onClick={async e => {
                        await createConversation(c);
                        navigate(`/chat/${c?.id}/${c.attributes.user?.data.attributes.email}`)
                      }}
                    >Bắt đầu hội thoại</button>
                    {/* </button> */}
                  </a>)}
                </li>
              </ul>
            </div>
            <div class="hidden lg:col-span-2 lg:block">
              <div class="w-full">
                <div class="relative flex items-center p-3 border-b border-gray-300">
                  <img class="object-cover w-10 h-10 rounded-full"
                    src="https://cdn.pixabay.com/photo/2018/01/15/07/51/woman-3083383__340.jpg" alt="username" />
                  <span class="block ml-2 font-bold text-gray-600">Emma</span>
                  <span class="absolute w-3 h-3 bg-green-600 rounded-full left-10 top-3">
                  </span>
                </div>
                <div class="relative w-full p-6 overflow-y-auto h-[40rem]">
                  <ul class="space-y-2">
                    <li class="flex justify-start">
                      <div class="relative max-w-xl px-4 py-2 text-gray-700 rounded shadow">
                        <span class="block">Hi</span>
                      </div>
                    </li>
                    <li class="flex justify-end">
                      <div class="relative max-w-xl px-4 py-2 text-gray-700 bg-gray-100 rounded shadow">
                        <span class="block">Hiiii</span>
                      </div>
                    </li>
                    <li class="flex justify-end">
                      <div class="relative max-w-xl px-4 py-2 text-gray-700 bg-gray-100 rounded shadow">
                        <span class="block">how are you?</span>
                      </div>
                    </li>
                    <li class="flex justify-start">
                      <div class="relative max-w-xl px-4 py-2 text-gray-700 rounded shadow">
                        <span class="block">Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>

                <div class="flex items-center justify-between w-full p-3 border-t border-gray-300">
                  <button>
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <button>
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>

                  <input type="text" placeholder="Message"
                    class="block w-full py-2 pl-4 mx-3 bg-gray-100 rounded-full outline-none focus:text-gray-700"
                    name="message" required />
                  <button>
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                  <button type="submit">
                    <svg class="w-5 h-5 text-gray-500 origin-center transform rotate-90" xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20" fill="currentColor">
                      <path
                        d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  )
}

export default ServiceBundles
