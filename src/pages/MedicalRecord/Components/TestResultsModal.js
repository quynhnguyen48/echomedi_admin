import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "react-toastify"
import { cloneDeep, flatten, groupBy } from "lodash"

import Modal from "components/Modal"
import Table from "components/Table"
import { formatStrapiArr, formatStrapiObj } from "utils/strapi"
import { uploadMedia } from "services/api/mediaLibrary"
import { getMedicalRecordById, updateMedicalRecord } from "services/api/medicalRecord"
import { getStrapiMedia } from "utils/media"
import Icon from "components/Icon"
import { useDispatch, useSelector } from "react-redux";

const AVAILABLE_TEST_RESULT = [
  "Xét nghiệm máu",
  "Xét nghiệm dịch tiết",
  "Xét nghiệm nước tiểu",
  "Xét nghiệm phân",
  "Thăm dò chức năng",
  "Nội soi",
  "Siêu âm",
  "Xquang",
  "CT scan",
  "MRI",
]

const TestResultsModal = ({ onClose, visibleModal, services, medicalRecordId }) => {
  const [testResults, setTestResults] = useState({})
  const ref = useRef()
  const currentUser = useSelector((state) => state.user.currentUser);


  const fetchData = useCallback(async () => {
    const toastId = toast.loading("Đang tải dữ liệu")
    try {
      const res = await getMedicalRecordById(medicalRecordId)
      const data = formatStrapiObj(res.data)
      setTestResults(data?.testResults || {})
    } catch (error) {
    } finally {
      toast.dismiss(toastId)
    }
  }, [medicalRecordId])

  const onFinish = useCallback(
    async (id, files) => {
      let payload = cloneDeep(testResults)
      if (payload?.[id]) {
        payload[id] = [...payload[id], ...files]
      } else {
        payload = {
          ...payload,
          [id]: files,
        }
      }
      await updateMedicalRecord(medicalRecordId, {
        testResults: payload,
      })
      await fetchData()
    },
    [fetchData, medicalRecordId, testResults]
  )

  const onRemove = useCallback(
    async (id, value) => {
      try {
        let payload = cloneDeep(testResults)
        payload[id] = payload[id]?.filter((item) => item.id !== value.id)
        await updateMedicalRecord(medicalRecordId, {
          testResults: payload,
        })
        await fetchData()
      } catch (error) { }
    },
    [fetchData, medicalRecordId, testResults]
  )

  const uploadAssets = useCallback(
    async (id, e) => {
      const toastId = toast.loading("Đang tải lên")
      try {
        const uploadedFiles = [...e.target.files]
        const promises = uploadedFiles?.map((file) => {
          const formData = new FormData()
          formData.append("files", file)
          return uploadMedia(formData)
        })
        const response = await Promise.all(promises)
        const files = flatten(response?.map((item) => item.data))
        if (files) {
          onFinish(id, files)
        }
      } catch (error) {
        // toast.error(getErrorMessage(error));
      } finally {
        toast.dismiss(toastId)
      }
    },
    [onFinish]
  )

  useEffect(() => {
    if (medicalRecordId) {
      fetchData()
    }
  }, [fetchData, medicalRecordId])

  const columns = useMemo(() => {
    return [
      {
        Header: "Tên xét nghiệm",
        accessor: (originalRow) => {
          return (
            <div className="text-secondary">
              <div className="inline-flex items-center justify-center rounded-xl bg-background p-1 relative border-primary border-1 w-20 hover:bg-primary">
                  <input
                    ref={ref}
                    type="file"
                    className="h-full w-full opacity-0 cursor-pointer absolute z-20 "
                    onChange={(e) => uploadAssets(originalRow.id, e)}
                    multiple
                  />
                  <p>Tải lên</p>
                </div>
                <p className="font-bold mb-4">{originalRow?.id}</p>
                
              <div className="flex flex-col gap-y-5">
                {testResults?.[originalRow?.id]?.map((item) => (
                  <div className="relative flex">
                    <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18px" height="18px"><path d="M19,20c0,0.6-0.4,1-1,1H6c-0.6,0-1-0.4-1-1V4c0-0.6,0.4-1,1-1h7.6L19,8.4V20z" opacity=".3" /><path d="M18,22H6c-1.1,0-2-0.9-2-2V4c0-1.1,0.9-2,2-2h8l6,6v12C20,21.1,19.1,22,18,22z M6,4v16h12V8.8L13.2,4H6z" /><path d="M18.5 9L13 9 13 3.5z" /></svg>

                    <a href={getStrapiMedia(item)} target="_blank" rel="noreferrer">
                      {item?.mime?.startsWith("image") ? (
                        <img className="rounded-xl w-14 h-14" src={getStrapiMedia(item)} alt="name" />
                      ) : (
                        <div className="hover:underline">
                          {item?.name}
                        </div>
                      )}
                    </a>
                    {currentUser.role.type == "admin" && <div
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemove(originalRow?.id, item)
                      }}
                      className="absolute -top-2 -right-10 z-20"
                    >
                      <Icon name="close-circle" className="fill-red bg-white rounded-full" />
                    </div>}
                  </div>
                ))}

              </div>
              <ul className="list-decimal ml-4 mt-4">
                {originalRow?.service?.map((item) => (
                  <li>{item.label}</li>
                ))}
              </ul>
            </div>
          )
        },
        collapse: true,
        // width: 300,
      },
      // {
      //   Header: "Kết quả",
      //   accessor: (originalRow) => (
      //     <div className="flex flex-col gap-y-5">
      //       {testResults?.[originalRow?.id]?.map((item) => (
      //         <div className="relative flex">
      //                           <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18px" height="18px"><path d="M19,20c0,0.6-0.4,1-1,1H6c-0.6,0-1-0.4-1-1V4c0-0.6,0.4-1,1-1h7.6L19,8.4V20z" opacity=".3"/><path d="M18,22H6c-1.1,0-2-0.9-2-2V4c0-1.1,0.9-2,2-2h8l6,6v12C20,21.1,19.1,22,18,22z M6,4v16h12V8.8L13.2,4H6z"/><path d="M18.5 9L13 9 13 3.5z"/></svg>

      //           <a href={getStrapiMedia(item)} target="_blank" rel="noreferrer">
      //             {item?.mime?.startsWith("image") ? (
      //               <img className="rounded-xl w-14 h-14" src={getStrapiMedia(item)} alt="name" />
      //             ) : (
      //               <div className="hover:underline">
      //                 {item?.name}
      //               </div>
      //             )}
      //           </a>
      //           {currentUser.role.type == "admin" && <div
      //             onClick={(e) => {
      //               e.stopPropagation()
      //               onRemove(originalRow?.id, item)
      //             }}
      //             className="absolute cursor-pointer -top-2 -right-10 z-20"
      //           >
      //             <Icon name="close-circle" className="fill-red bg-white rounded-full" />
      //           </div>}
      //         </div>
      //       ))}
      //       <div className="inline-flex items-center justify-center rounded-xl bg-background p-4 relative border-primary border-1">
      //         <input
      //           ref={ref}
      //           type="file"
      //           className="h-full w-full opacity-0 cursor-pointer absolute z-20"
      //           onChange={(e) => uploadAssets(originalRow.id, e)}
      //           multiple
      //         />
      //         <p>Tải lên</p>
      //       </div>
      //     </div>
      //   ),
      //   collapse: true,
      //   width: 300,
      // },
    ]
  }, [testResults, uploadAssets])

  const servicesData = useMemo(() => {
    const formatServices = groupBy(formatStrapiArr({ data: services }), "group_service")
    return Object.entries(formatServices)
      .map(([serviceName, service]) => {
        if (!AVAILABLE_TEST_RESULT.includes(serviceName)) return null
        return service
      })
      ?.filter((service) => !!service)
  }, [services])

  const data = useMemo(
    () => servicesData?.map((service) => ({ id: service?.[0]?.group_service, service })),
    [servicesData]
  )

  return (
    <Modal
      //   wrapperClassName="w-[1340px]"
      showCloseButton
      visibleModal={visibleModal}
      onClose={onClose}
    >
      <p className="text-24 font-bold">Kết quả xét nghiệm</p>
      <Table
        hidePagination
        disableLineClamp
        isModal
        rowClassName="!h-auto py-4"
        className="mt-2"
        columns={columns}
        data={data}
      />
    </Modal>
  )
}

export default TestResultsModal
