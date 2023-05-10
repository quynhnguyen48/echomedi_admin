import { useState } from "react"
import classNames from "classnames";
import { useNavigate } from "react-router-dom";

import DataItem from "components/DataItem";
import Tag from "components/Tag";
import Button from "components/Button";
import Icon from "components/Icon";
import { formatDate } from "utils/dateTime"
import TreatmentProgressDrawer from "./Components/TreatmentProgressDrawer"
import CustomerModal from "../../components/CustomerModal"

const TreatmentHistoryDetail = ({ data, onTogglePublish }) => {
  const navigate = useNavigate();
  const [visibleTreatmentProgressDrawer, setVisibleTreatmentProgressDrawer] = useState(false)
  const [customerIdSelected, setCustomerIdSelected] = useState(null)
  const [visibleCustomerModal, setVisibleCustomerModal] = useState(false)

  return (
    <div className="mt-10 w-full">
      <div className="flex items-center gap-x-2">
        <div className="flex items-center flex-1 gap-x-4">
          <div className="w-30 h-30 bg-primary rounded-full flex items-center justify-center">
            <Icon name="timer" className="fill-white w-14 h-14" />
          </div>
          <div className="flex-1">
            <p className="text-24 font-bold">{data?.code}</p>
            <p className="text-18 break-all">{data?.user?.email}</p>
            <div className="mt-4 flex items-center">
              <Tag
                secondary
                className={classNames('whitespace-nowrap', {
                  "bg-red": !data?.publishedAt,
                  "bg-blue": !!data?.publishedAt && data?.history.length === data?.progressTimes,
                  "bg-green": !!data?.publishedAt && data?.history.length < data?.progressTimes,
                })}
                name={
                  !data?.publishedAt ?
                    "Canceled" :
                    data?.history.length === data?.progressTimes ?
                      'Completed' :
                      'On-Progress'
                }
              />
              {
                !!data?.publishedAt && data?.history.length < data?.progressTimes && (
                  <>
                    <Icon name="arrows/arrow-right" className="mx-2 fill-secondary" />
                    <Tag
                      secondary
                      className="bg-blue opacity-[0.3]"
                      name="Completed"
                    />
                  </>
                )
              }
            </div>
          </div>
        </div>
        <div className="flex gap-x-2">
          <Button
            btnSize="auto"
            className="w-10 h-10"
            shape="circle"
            onClick={() => navigate(`/treatment-history/${data?.id}/edit`)}
          >
            <Icon name="edit" />
          </Button>
          <Button
            btnSize="auto"
            className={`w-10 h-10 ${data?.publishedAt ? 'bg-red' : 'bg-green'}`}
            shape="circle"
            onClick={onTogglePublish}
          >
            <Icon name="slash" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 grid-flow-row gap-y-20 mt-12">
        <DataItem
          icon="key"
          title="History ID"
          value={data?.id}
        />
        <DataItem
          icon="calendar"
          title="Created Date"
          value={formatDate(data?.createdAt)}
        />
        <DataItem
          icon="user-octagon"
          title="Full Name"
          value={`${data?.user?.firstName} ${data?.user?.lastName}`}nm
          footer={
            <Button
              btnSize="small"
              className="mt-2"
              onClick={() => {
                setVisibleCustomerModal(true)
                setCustomerIdSelected(data?.user?.id)
              }}
            >
              View Detail
            </Button>
          }
        />
        <DataItem icon="user" title="Email" value={data?.user?.email} />
        <DataItem
          icon="grammerly"
          title="Treatment"
          value={data?.treatment?.name}
        />
        <DataItem
          icon="3square"
          title="Progress"
          value={`${data?.history?.length} / ${data?.progressTimes}` }
          footer={
            <Button btnSize="small" className="mt-2" onClick={() => setVisibleTreatmentProgressDrawer(true)}>
              View Detail
            </Button>
          }
        />
      </div>

      <TreatmentProgressDrawer
        treatmentHistory={data}
        openDrawer={visibleTreatmentProgressDrawer}
        onClose={() => setVisibleTreatmentProgressDrawer(false)}
      />
      <CustomerModal
        customerId={customerIdSelected}
        visibleModal={visibleCustomerModal}
        onClose={() => setVisibleCustomerModal(false)}
      />
    </div>
  );
};

export default TreatmentHistoryDetail;
