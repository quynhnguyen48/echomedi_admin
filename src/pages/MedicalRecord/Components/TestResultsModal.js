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

  console.log('servicesservicesservices', services)

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
      } catch (error) {}
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
              <p className="font-bold">{originalRow?.id}</p>
              <ul className="list-decimal ml-4">
                {originalRow?.service?.map((item) => (
                  <li>{item.label}</li>
                ))}
              </ul>
            </div>
          )
        },
        collapse: true,
        width: 300,
      },
      {
        Header: "Kết quả",
        accessor: (originalRow) => (
          <div className="flex flex-col gap-y-1">
            {testResults?.[originalRow?.id]?.map((item) => (
              <div className="relative">
                <a href={getStrapiMedia(item)} target="_blank" rel="noreferrer">
                  {item?.mime?.startsWith("image") ? (
                    <img className="rounded-xl w-14 h-14" src={getStrapiMedia(item)} alt="name" />
                  ) : (
                    <div className="inline-flex items-center justify-center rounded-xl bg-primary text-white font-bold p-4 relative border-primary border-1 w-full!">
                      {item?.name}
                    </div>
                  )}
                </a>
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemove(originalRow?.id, item)
                  }}
                  className="absolute cursor-pointer -top-2 -right-2 z-20"
                >
                  <Icon name="close-circle" className="fill-red bg-white rounded-full" />
                </div>
              </div>
            ))}
            <div className="inline-flex items-center justify-center rounded-xl bg-background p-4 relative border-primary border-1">
              <input
                ref={ref}
                type="file"
                className="h-full w-full opacity-0 cursor-pointer absolute z-20"
                onChange={(e) => uploadAssets(originalRow.id, e)}
                multiple
              />
              <p>Tải lên</p>
            </div>
          </div>
        ),
        collapse: true,
        width: 300,
      },
    ]
  }, [testResults, uploadAssets])

  const servicesData = useMemo(() => {
    console.log('dataa', formatStrapiArr({ data: services }))
    const formatServices = groupBy(formatStrapiArr({ data: services }), "group_service")
    // console.log('formatServices', formatStrapiArr({ data: services }))
    return Object.entries(formatServices)
      .map(([serviceName, service]) => {
        // console.log('serviceName', serviceName, service)
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
        className="mt-6"
        columns={columns}
        data={data}
      />
    </Modal>
  )
}

export default TestResultsModal
