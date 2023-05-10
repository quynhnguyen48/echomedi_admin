import { useState } from "react"

import DataItem from "components/DataItem"
import Drawer from "components/Drawer"
import Price from "components/Price"
import SearchInput from "components/SearchInput"
import MembershipTransactionItem from "./MembershipTransactionItem"

const MembershipCardTransaction = ({ openDrawer, onClose, data }) => {
  const [searchKey, setSearchKey] = useState()

  return (
    <Drawer open={openDrawer} onClose={onClose}>
      <DataItem icon="coin" title="Remain Value" value={<Price price={data?.remainValue} />} />
      <SearchInput
        placeholder="Search by Transaction ID"
        className="flex-1 mt-6"
        onSearch={setSearchKey}
      />
      <div className="mt-10 flex flex-col gap-y-4">
        {data?.transactions
          ?.filter((transaction) => transaction?.code?.search(new RegExp(searchKey, "i")) > -1)
          ?.map((transaction, index) => {
            return <MembershipTransactionItem key={index} transaction={transaction} />
          })}
      </div>
    </Drawer>
  )
}

export default MembershipCardTransaction
