import classNames from "classnames"
import { useCallback, useRef, useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { JWT_TOKEN, BRANCH } from "../../constants/Authentication"
import { useSelector } from "react-redux"
import { useParams } from "react-router-dom";
import Select from "components/Select"
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
import dayjs from 'dayjs';
import { getListEmployee } from "services/api/users"

const Message = () => <li className="flex justify-start">
  <div class="relative max-w-xl px-4 py-2 text-gray-700 bg-gray-100 rounded shadow">
    <span class="block">123</span>
  </div>
</li>;

const ServiceBundles = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [pageCount, setPageCount] = useState(0)
  const [detailData, setDetailData] = useState()
  const [searchKey, setSearchKey] = useState()
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const currentUser = useSelector((state) => state.user.currentUser);
  const [patient, setPatient] = useState({});
  const [patientId, setPatientId] = useState(0);
  const [userId, setUserId] = useState();
  const [socket, setSocket] = useState();
  const [secondPerson, setSecondPerson] = useState();
  const ref = useRef();
  const refInput = useRef();
  const fetchIdRef = useRef(0)
  const { id, email } = useParams();
  const [employee, setEmployee] = useState([]);
  const [supporter, setSupporter] = useState({});
  const [status, setStatus] = useState();

  let chats;

  useEffect(() => {
    getListEmployee(
      { pageSize: 1000 },
      {
        isDoctor: true
      }
    )
      .then((res) => {
        setEmployee(res.data.map(r => {
          return {
            value: r.id,
            label: r.fullname
          }
        }))
      })
      .catch(() => {
      })
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
    await axios.get(`/conversation-queue/getMessages/${id}`, {
    })
      .then((response) => {
        setSecondPerson(response.data.second_person)
        setSupporter({ value: response.data.id, label: response.data.second_person.patient.full_name })
        setStatus({ value: response.data.status, label: response.data.status })
        setUserId(response.data.user.id)
        setPatient(response.data.user);
        setPatientId(response.data.user.patient?.id);
        let message = response.data.data;
        if (!Array.isArray(message)) {
          message = [message];
        }
        setConversations(message);
        chats = response.data.data.attributes.data;
        setTimeout(() => {
          ref.current.parentNode.scrollTop = 999999;
        }, 300);
      })
      .finally(() => {
        // toast.dismiss(toastId);
      });
  }

  useEffect(() => {

    loadConversation();

    var sc = io('https://api.echomedi.com', {
      autoConnect: false,
      transports: ['websocket']
    });
    sc.auth = { 'username': currentUser?.email, "roomId": "room" + id };
    sc.connect();

    sc.on('chatMessage', function (msg) {
      var msgs = msg.split("|");
      var doc = document.createElement("li");
      doc.className = msgs[0] == currentUser?.id ? "flex justify-end" : "flex justify-start";
      doc.innerHTML =
        `<div class="relative max-w-xl px-4 py-2 text-gray-700 bg-gray-100 rounded shadow">
        <span style="white-space: pre-line;">${msgs[2]}</span>
      </div>`;
      ref.current.appendChild(doc);
      ref.current.parentNode.scrollTop = 999999;
    });

    setSocket(sc);

  }, []);

  const sendMesssage = () => {
    var email = currentUser?.email;
    socket.emit("chatMessage", { "user": "user", "message": `${currentUser.id}|room${id}|${message}|${dayjs().add(7, 'hour').toISOString()}` });
    refInput.current.value = "";
  }

  const onSubmit = async () => {
    try {
      const toastId = toast.loading("Đang tải");
      await axios.post("/conversation-queue/updateSecondPerson", {
        "id": id,
        "pid": supporter.value,
      })
        .then((response) => {
          window.location.reload();
        })
        .finally(() => {
          window.location.reload();
        });
    } catch (error) {
    } finally {
    }
  }

  const onSubmitStatus = async () => {
    try {
      const toastId = toast.loading("Đang tải");
      await axios.post("/conversation-queue/updateStatus", {
        "id": id,
        "status": status.value,
      })
        .then((response) => {
          window.location.reload();
        })
        .finally(() => {
          window.location.reload();
        });
    } catch (error) {
    } finally {
    }
  }

  return (
    <Page
      title="Tin nhắn"
    // rightContent={detailData ? <ProductAnalytics data={detailData} /> : <ImportExportHistory />}
    >
      <div className="items-center">
        <div class="relative flex flex-row items-center p-3 border-b border-gray-300">
          <Select
            placeholder="Nhân viên hỗ trợ"
            label="Nhân viên hỗ trợ"
            name="patient_source"
            options={employee}
            value={supporter}
            onChange={(e) => {
              setSupporter(e)
            }}
          />
          <Button onClick={onSubmit} className="fill-primary mr-10" type="button" loading={loading}>
            Lưu
          </Button>
          <Select
            wrapperClassName="w-52"
            placeholder="Trạng thái"
            label="Trạng thái"
            name="status"
            options={[
              { value: "incomplete", label: "incomplete", },
              { value: "complete", label: "complete", }
            ]}
            value={status}
            onChange={(e) => {
              setStatus(e)
            }}
          />

          <Button onClick={onSubmitStatus} className="fill-primary" type="button" loading={loading}>
            Lưu
          </Button>
        </div>

        <div class="container mx-auto">
          <div class="min-w-full border rounded lg:grid lg:grid-cols-3">
            <div class="lg:col-span-2 lg:block">
              <div class="w-full">
                <div class="relative flex items-center p-3 border-b border-gray-300">
                  <img class="object-cover w-10 h-10 rounded-full"
                    src="https://cdn.pixabay.com/photo/2018/01/15/07/51/woman-3083383__340.jpg" alt="username" />
                  <span class="block ml-2 font-bold text-gray-600">{patient?.full_name} - {patient?.email} - {patient?.phone}</span>
                  <a target="_blank" className="ml-4" href={`https://zalo.me/${patient?.phone}`} rel="noreferrer"><svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1249 439">
                    <path fill="blue" class="shp0" d="m649.69 129.68v-23.37h70.02v328.67h-40.06c-16.49 0-29.87-13.32-29.96-29.78-0.01 0.01-0.02 0.01-0.03 0.02-28.2 20.62-63.06 32.87-100.71 32.87-94.3 0-170.76-76.41-170.76-170.65s76.46-170.64 170.76-170.64c37.65 0 72.51 12.24 100.71 32.86 0.01 0.01 0.02 0.01 0.03 0.02zm-289.64-129.06v10.65c0 19.88-2.66 36.1-15.57 55.14l-1.56 1.78c-2.82 3.2-9.44 10.71-12.59 14.78l-224.76 282.11h254.48v39.94c0 16.55-13.43 29.96-29.98 29.96h-329.73v-18.83c0-23.07 5.73-33.35 12.97-44.07l239.61-296.57h-242.59v-74.89h349.72zm444.58 434.36c-13.77 0-24.97-11.19-24.97-24.94v-409.42h74.94v434.36h-49.97zm271.56-340.24c94.95 0 171.91 76.98 171.91 171.79 0 94.9-76.96 171.88-171.91 171.88-94.96 0-171.91-76.98-171.91-171.88 0-94.81 76.95-171.79 171.91-171.79zm-527.24 273.1c55.49 0 100.46-44.94 100.46-100.4 0-55.37-44.97-100.32-100.46-100.32s-100.47 44.95-100.47 100.32c0 55.46 44.98 100.4 100.47 100.4zm527.24-0.17c55.82 0 101.12-45.27 101.12-101.14 0-55.78-45.3-101.05-101.12-101.05-55.91 0-101.13 45.27-101.13 101.05 0 55.87 45.22 101.14 101.13 101.14z" fill-rule="evenodd" />
                  </svg></a>
                  {/* <a target="_blank" className="ml-4" href={`/patient/${patientId}/view`}>Xem thông tin chi tiết</a> */}
                  <Button
                    className={"ml-4"}
                    onClick={() => {
                      window.open(`/patient/${patientId}/view`);
                    }}
                  >
                    Xem thông tin chi tiết
                  </Button>
                </div>
                <div class="relative w-full p-6 overflow-y-auto h-[30rem]">
                  <ul class="space-y-2" ref={ref}>
                    {conversations && conversations.map(c => {
                      let messages = c.split("|");
                      let msg = messages[2];
                      if (msg.startsWith("file:")) {
                        return <li class={userId != messages[0] ? "flex justify-end" : "flex justify-start"}>
                          <div class="relative max-w-xl px-4 py-2 text-gray-700 bg-gray-100 rounded shadow">
                            <span>File {msg.substring(5).split('.').pop()}</span>
                            <a target="_blank" href={"https://api.echomedi.com" + msg.substring(5)} rel="noreferrer">
                              {getFileExt(msg) == "png" && <img style={{ width: "100px" }} src={"https://api.echomedi.com" + msg.substring(5)} />}
                              {getFileExt(msg) == "jpg" && <img style={{ width: "100px" }} src={"https://api.echomedi.com" + msg.substring(5)} />}
                              {getFileExt(msg) == "pdf" && <h1 className="text-blue">PDF</h1>}

                            </a>
                          </div>
                        </li>
                      } else {
                        return <li class={(userId != messages[0]) ? "flex justify-end" : "flex justify-start"}>
                          <div class="relative max-w-xl px-4 py-2 text-gray-700 bg-gray-100 rounded shadow">
                            <span style={{ whiteSpace: "pre-line" }}>{messages[2]}</span>
                          </div>
                        </li>
                      }
                    }
                    )}
                  </ul>
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


const getFileExt = function (fileName) {
  return fileName.substring(5).split('.').pop();
}