import { useState } from "react"
import last from "lodash/last"

import DataItem from "components/DataItem"
import Drawer from "components/Drawer"
import SearchInput from "components/SearchInput"
import ServiceCardUsagesItem from "./ServiceCardUsagesItem"
import { formatDate } from "utils/dateTime"

const ServiceCardUsages = ({ openDrawer, handleClose, data }) => {
  const [searchKey, setSearchKey] = useState()

  return (
    <Drawer open={openDrawer} onClose={handleClose}>
      <DataItem
        icon="calendar"
        title="Latest Used"
        value={
          data?.transactions?.length > 0
            ? formatDate(last(data?.transactions).createdAt, "DD MMMM, YYYY [|] HH:mm")
            : "-"
        }
      />
      <SearchInput
        placeholder="Search by Transaction ID"
        className="mt-6"
        onSearch={setSearchKey}
      />
      <div className="mt-8 flex flex-col gap-y-4">
        {Array.isArray(data?.transactions) &&
          data?.transactions
            ?.filter((transaction) => transaction?.code?.search(new RegExp(searchKey, "i")) > -1)
            ?.map((transaction) => {
              return (
                <ServiceCardUsagesItem
                  key={transaction.id}
                  code={transaction.code}
                  createdAt={formatDate(transaction?.createdAt, "DD MMMM, YYYY [|] HH:mm")}
                  serviceCardUsaged={transaction.serviceCardUsaged}
                  serviceCardLimit={transaction.serviceCardLimit}
                  servicePrice={data?.service?.price}
                  transactionType={transaction.type}
                />
              )
            })}
      </div>
    </Drawer>
  )
}

export default ServiceCardUsages
