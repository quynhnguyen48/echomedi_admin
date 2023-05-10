import { useCallback, useEffect, useState } from "react"
import { toast } from "react-toastify"
import sumBy from "lodash/sumBy"
import classNames from "classnames"

import Button from "components/Button"
import Icon from "components/Icon"
import SelectImportExport from "components/SelectImportExport"
import SelectProductsModal from "components/SelectProductsModal"
import { addImportExport, getImportExportHistory } from "services/api/products"
import { getErrorMessage } from "utils/error"
import { formatDate } from "utils/dateTime"
import { formatStrapiArr } from "utils/strapi"

const ImportExportHistory = () => {
  const [data, setData] = useState([])
  const [showImportExportModal, setShowImportExportModal] = useState(false)
  const [showSelectProductsModal, setShowSelectProductsModal] = useState(false)
  const [selectedType, setSelectedType] = useState()

  const fetchData = useCallback(async () => {
    try {
      const res = await getImportExportHistory({}, { page: 1, pageSize: 1000 })
      setData(formatStrapiArr(res.data))
    } catch (error) {}
  }, [])

  const handleAddNewImportExport = async (products) => {
    try {
      if (products?.length) {
        await addImportExport({
          type: selectedType,
          products,
        })
        await fetchData()
        toast.success("Created successfully")
      }
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div>
      <p className="font-bold">Import / Export History</p>
      <Button
        className="mt-6"
        icon={<Icon name="add-circle" className="fill-white" />}
        onClick={() => setShowImportExportModal(true)}
      >
        Create New Import / Export Slip
      </Button>
      <div className="space-y-4 mt-4">
        {Array.isArray(data) &&
          data?.map((item) => (
            <div key={item?.id} className="rounded-xl bg-primary/10 p-4">
              <div className="flex">
                <p
                  className={classNames("font-bold", {
                    "text-primary": item?.type === "export",
                    "text-secondary": item?.type === "import",
                  })}
                >
                  {item?.type === "import" ? "Import" : "Export"}
                </p>
                <p className="text-primary font-bold ml-1">{item?.code}</p>
              </div>
              <p className="text-secondary/[0.56] mt-2">
                {formatDate(item?.createdAt, "DD MMMM, YYYY [|] HH:mm")}
              </p>
              <p className="mt-4 flex gap-x-6 font-bold">{sumBy(item?.products, "amount")}</p>
            </div>
          ))}
      </div>
      <SelectImportExport
        show={showImportExportModal}
        onClose={() => setShowImportExportModal(false)}
        handleNext={(type) => {
          setSelectedType(type)
          setShowImportExportModal(false)
          setShowSelectProductsModal(true)
        }}
      />
      {showSelectProductsModal && (
        <SelectProductsModal
          show={showSelectProductsModal}
          showPrice={false}
          cartTitle={selectedType === "import" ? "Import Cart" : "Export Cart"}
          cartData={[]}
          onClose={() => setShowSelectProductsModal(false)}
          onUpdateCart={handleAddNewImportExport}
        />
      )}
    </div>
  )
}

export default ImportExportHistory
