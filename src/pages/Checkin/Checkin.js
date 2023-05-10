import dayjs from "dayjs"
import { useCallback, useEffect, useState } from "react"
import cloneDeep from "lodash/cloneDeep"
import { isMobile } from "react-device-detect"

import Button from "components/Button"
import Icon from "components/Icon"
import Page from "components/Page"
import Tag from "components/Tag"
import Modal from "components/Modal"
import CustomerModal from "components/CustomerModal"
import { getListCheckinToday, getListCheckoutToday, updateCheckin } from "services/api/checkin"
import { formatStrapiArr, formatStrapiObj } from "utils/strapi"
import { renderTransactionCheckinStatusColor, toCapitalize } from "utils/string"
import { TRANSACTION_CHECKIN_STATUS } from "constants/Transaction"
import { getListTransactions } from "services/api/transactions"
import CheckInDrawer from "./components/CheckInDrawer"
import CheckInItem from "./components/CheckInItem"
import CheckOut from "./components/CheckOut"
import CheckOutDrawer from "./components/CheckOutDrawer"
import TransactionCreation from "./components/TransactionCreation"
import CheckoutConfirmation from "./components/CheckoutConfirmation"
import CreateNewCustomerModal from "./components/CreateNewCustomerModal"
import { toast } from "react-toastify"

const Checkin = () => {
  const [isOpenCheckInDrawer, setIsOpenCheckInDrawer] = useState(false)
  const [isOpenCheckOutDrawer, setIsOpenCheckOutDrawer] = useState(false)
  const [checkInList, setCheckInList] = useState([])
  const [checkoutList, setCheckoutList] = useState([])
  const [selectedCheckIn, setSelectedCheckIn] = useState({})
  const [transactionSelected, setTransactionSelected] = useState(null)
  const [visibleTransactionCreationModal, setVisibleTransactionCreationModal] = useState(false)
  const [visibleConfirmationModal, setVisibleConfirmationModal] = useState(false)
  const [statusSelected, setStatusSelected] = useState(null)
  const [customerIdSelected, setCustomerIdSelected] = useState(null)
  const [visibleCustomerModal, setVisibleCustomerModal] = useState(false)
  const [visibleCreateNewCustomerModal, setVisibleCreateNewCustomerModal] = useState(false)
  const [checkinSelected, setCheckinSelected] = useState(null)
  const [isGuestUser, setIsGuestUser] = useState(false)

  const handleCheckOut = useCallback((checkin) => {
    setSelectedCheckIn(checkin)
    setIsOpenCheckOutDrawer(true)
  }, [])

  const fetchCheckInToday = useCallback(async () => {
    try {
      const res = await getListCheckinToday(
        statusSelected ? { status: { $eq: statusSelected } } : {}
      )
      const listCheckin = formatStrapiArr(res.data)
      setCheckInList(() =>
        listCheckin.map((checkin) => ({
          ...checkin,
          user: formatStrapiObj(checkin.user),
          // transactions: formatStrapiArr(checkin.transactions).map((transaction) => ({
          //   ...transaction,
          //   staff: formatStrapiObj(transaction.staff),
          //   extraStaff: formatStrapiObj(transaction.extraStaff),
          //   user: formatStrapiObj(transaction.user),
          //   order: formatStrapiObj(transaction.order),
          //   treatment: formatStrapiObj(transaction.treatment),
          //   card: formatStrapiObj(transaction.card),
          // })),
        }))
      )
    } catch (error) {}
  }, [statusSelected])

  useEffect(() => {
    ;(async () => {
      try {
        const res = await getListCheckoutToday()
        const listCheckout = formatStrapiArr(res.data)
        setCheckoutList(
          listCheckout.map((checkin) => ({
            ...checkin,
            user: formatStrapiObj(checkin.user),
            // transactions: formatStrapiArr(checkin.transactions).map((transaction) => ({
            //   ...transaction,
            //   staff: formatStrapiObj(transaction.staff),
            //   extraStaff: formatStrapiObj(transaction.extraStaff),
            // })),
          }))
        )
      } catch (error) {}
    })()
  }, [])

  useEffect(() => {
    fetchCheckInToday()
  }, [fetchCheckInToday])

  const selectStatus = (status) => {
    setStatusSelected(status === statusSelected ? null : status)
  }

  const closeTransactionCreationModal = () => {
    setVisibleTransactionCreationModal(false)
    setIsOpenCheckOutDrawer(true)
    setTransactionSelected(null)
  }

  const updateCheckinStatus = async (checkin, newTransaction) => {
    let newTransactionFormatted = formatStrapiObj(newTransaction)
    newTransactionFormatted = {
      ...newTransactionFormatted,
      staff: formatStrapiObj(newTransactionFormatted.staff),
      extraStaff: formatStrapiObj(newTransactionFormatted.extraStaff),
      user: formatStrapiObj(newTransactionFormatted.user),
      order: formatStrapiObj(newTransactionFormatted.order),
      treatment: formatStrapiObj(newTransactionFormatted.treatment),
      card: formatStrapiObj(newTransactionFormatted.card),
    }
    try {
      const res = await getListTransactions(
        { pageSize: 1000 },
        {
          user: {
            id: checkin?.user?.id,
          },
          createdAt: {
            $gte: dayjs().startOf("day").toISOString(),
          },
        }
      )
      const transactionList = formatStrapiArr(res.data)
      let checkinStatus = checkin?.status
      if (
        transactionList.some(
          (transaction) => transaction?.status === TRANSACTION_CHECKIN_STATUS.NEW
        )
      ) {
        checkinStatus = TRANSACTION_CHECKIN_STATUS.WAITING
      } else {
        if (
          transactionList.some(
            (transaction) => transaction?.status === TRANSACTION_CHECKIN_STATUS.PROGRESS
          )
        ) {
          checkinStatus = TRANSACTION_CHECKIN_STATUS.PROGRESS
        } else {
          if (
            transactionList.some(
              (transaction) => transaction?.status === TRANSACTION_CHECKIN_STATUS.DONE
            )
          ) {
            checkinStatus = TRANSACTION_CHECKIN_STATUS.DONE
          } else {
            if (
              transactionList.some(
                (transaction) => transaction?.status === TRANSACTION_CHECKIN_STATUS.PAID
              )
            ) {
              checkinStatus = TRANSACTION_CHECKIN_STATUS.PAID
            }
          }
        }
      }

      const checkinRes = await updateCheckin(checkin?.id, {
        status: checkinStatus,
      })

      if (checkinRes) {
        await fetchCheckInToday()
        let newTransactions = cloneDeep(checkin.transactions)
        const pos = checkin.transactions.findIndex((t) => t.id === newTransactionFormatted.id)
        if (pos > -1) {
          newTransactions[pos] = newTransactionFormatted
        } else {
          newTransactions = [newTransactionFormatted, ...newTransactions]
        }
        setSelectedCheckIn({
          ...checkin,
          status: checkinStatus,
          transactions: newTransactions,
        })
      }
    } catch (error) {}
  }

  const handleUpdateGuestUserCheckin = useCallback(
    async (user) => {
      try {
        const payload = {
          user: user.id,
        }
        const res = await updateCheckin(checkinSelected?.id, payload)
        if (res.data) {
          const newCheckin = {
            ...formatStrapiObj(res.data),
            transactions: formatStrapiArr(formatStrapiObj(res.data).transactions),
            user: formatStrapiObj(formatStrapiObj(res.data).user),
          }
          setCheckInList((oldData) => {
            const index = checkInList.findIndex((checkIn) => checkIn.id === newCheckin.id)
            if (index > -1) {
              oldData[index] = newCheckin
            }
            return oldData
          })
          toast.success("Saved successfully")
          setVisibleCreateNewCustomerModal(false)
        }
      } catch (error) {}
    },
    [checkInList, checkinSelected]
  )

  return (
    <Page
      title="Check-in"
      rightContent={
        !isMobile && <CheckOut checkoutList={checkoutList} selectCheckout={handleCheckOut} />
      }
      className="md:bg-form md:px-5"
      contentClassName="md:pr-0"
    >
      <p className="font-bold">Check-in {dayjs(new Date()).format("DD/MM/YYYY")}</p>
      <div className="p-6 md:p-0 w-full h-full mt-4 bg-form md:bg-transparent rounded-t-2xl md:rounded-none max-h-mainContent overflow-y-auto">
        <div className="w-full flex items-center justify-between">
          <h1 className="text-primary font-bold text-32 md:hidden">
            {checkInList?.length || 0}
            <span className="text-32 ml-2 text-secondary font-normal">{`Checked in`}</span>
          </h1>
          <div className="flex space-x-2 flex-wrap items-center justify-center">
            {Object.values(TRANSACTION_CHECKIN_STATUS)
              .filter((status) =>
                isMobile
                  ? [
                      TRANSACTION_CHECKIN_STATUS.WAITING,
                      TRANSACTION_CHECKIN_STATUS.PROGRESS,
                      TRANSACTION_CHECKIN_STATUS.DONE,
                    ].includes(status)
                  : status !== TRANSACTION_CHECKIN_STATUS.NEW
              )
              .map((status) => (
                <button
                  key={status}
                  className={`h-7 rounded-lg flex items-center text-14 md:mt-2 ${
                    status !== statusSelected && statusSelected && "opacity-50"
                  }`}
                  onClick={() => selectStatus(status)}
                >
                  <Tag
                    secondary
                    name={toCapitalize(status)}
                    className={`${renderTransactionCheckinStatusColor(status)}`}
                  />
                </button>
              ))}
          </div>
          {!isMobile && (
            <Button
              icon={<Icon name="add-circle" className="fill-white" />}
              onClick={() => {
                setSelectedCheckIn(null)
                setIsOpenCheckInDrawer(true)
              }}
            >
              <span className="flex-1">Create New Check-in</span>
            </Button>
          )}
        </div>
        <div className="mt-6 flex flex-wrap gap-6">
          {Array.isArray(checkInList) &&
            checkInList?.map((checkin) => (
              <CheckInItem
                key={checkin.id}
                checkin={checkin}
                className="cursor-pointer"
                onEdit={() => {
                  setSelectedCheckIn(checkin)
                  setIsOpenCheckInDrawer(true)
                  if (!checkin.user && !checkin?.metadata?.aliasID) {
                    setIsGuestUser(true)
                  }
                }}
                onCheckout={() => {
                  setSelectedCheckIn(checkin)
                  setIsOpenCheckOutDrawer(true)
                }}
                onShowCustomerModal={() => {
                  setVisibleCustomerModal(true)
                  setCustomerIdSelected(checkin?.user?.id)
                }}
                onShowCreateNewCustomerModal={() => {
                  setVisibleCreateNewCustomerModal(true)
                  setCheckinSelected(checkin)
                }}
              />
            ))}
        </div>
        <CheckInDrawer
          data={selectedCheckIn}
          openDrawer={isOpenCheckInDrawer}
          isGuestUser={isGuestUser}
          onClose={() => {
            setIsOpenCheckInDrawer(false)
            setSelectedCheckIn(null)
            setIsGuestUser(false)
          }}
          onUpdateSuccess={(value) => {
            setCheckInList((oldData) => {
              const index = checkInList.findIndex((checkIn) => checkIn.id === value.id)
              if (index > -1) {
                oldData[index] = value
              }
              return oldData
            })
            setIsOpenCheckInDrawer(false)
            setIsGuestUser(false)
          }}
          onCreateSuccess={async () => {
            setSelectedCheckIn(null)
            setIsOpenCheckInDrawer(false)
            setIsGuestUser(false)
            await fetchCheckInToday()
          }}
        />
        <CheckOutDrawer
          data={selectedCheckIn}
          openDrawer={isOpenCheckOutDrawer}
          onClose={() => {
            setIsOpenCheckOutDrawer(false)
            setSelectedCheckIn(null)
          }}
          onCreateTransactionSuccess={(newTransaction) =>
            updateCheckinStatus(selectedCheckIn, newTransaction)
          }
          onCheckoutSuccess={(value) => {
            if (value) {
              setCheckInList((items) => items.filter((item) => item.id !== value.id))
              setCheckoutList((items) => [value, ...items])
              setIsOpenCheckOutDrawer(false)
              setSelectedCheckIn(null)
            }
          }}
          onOpenTransactionCreationModal={() => {
            setVisibleTransactionCreationModal(true)
            setIsOpenCheckOutDrawer(false)
          }}
          onSelectTransaction={(transaction) => {
            setTransactionSelected(transaction)
            setVisibleTransactionCreationModal(true)
            setIsOpenCheckOutDrawer(false)
          }}
          onConfirmTransactions={async () => {
            setVisibleConfirmationModal(true)
            const checkinRes = await updateCheckin(selectedCheckIn?.id, {
              status: TRANSACTION_CHECKIN_STATUS.CONFIRMED,
            })

            if (checkinRes) {
              await fetchCheckInToday()
              setSelectedCheckIn({
                ...selectedCheckIn,
                status: TRANSACTION_CHECKIN_STATUS.CONFIRMED,
              })
            }
          }}
        />
      </div>
      {visibleTransactionCreationModal && (
        <Modal
          visibleModal={visibleTransactionCreationModal}
          onClose={closeTransactionCreationModal}
          wrapperClassName="w-[1200px] md:w-full"
          contentClassName="md:bg-white"
        >
          <TransactionCreation
            checkin={selectedCheckIn}
            transaction={transactionSelected}
            onClose={closeTransactionCreationModal}
            onConfirm={async (newTransaction) => {
              closeTransactionCreationModal()
              await updateCheckinStatus(selectedCheckIn, newTransaction)
            }}
          />
        </Modal>
      )}
      <Modal
        visibleModal={visibleConfirmationModal}
        onClose={() => {
          setVisibleConfirmationModal(false)
          setIsOpenCheckOutDrawer(true)
        }}
        wrapperClassName="w-[428px]"
      >
        <CheckoutConfirmation
          checkin={selectedCheckIn}
          onClose={() => {
            setVisibleConfirmationModal(false)
            setIsOpenCheckOutDrawer(true)
          }}
        />
      </Modal>
      <CustomerModal
        customerId={customerIdSelected}
        visibleModal={visibleCustomerModal}
        onClose={() => setVisibleCustomerModal(false)}
      />
      <CreateNewCustomerModal
        visibleModal={visibleCreateNewCustomerModal}
        onClose={() => setVisibleCreateNewCustomerModal(false)}
        onUpdateGuestUserCheckin={(user) => handleUpdateGuestUserCheckin(user)}
      />
    </Page>
  )
}

export default Checkin
