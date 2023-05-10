import { useState } from "react"
import classNames from "classnames";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

import { getStrapiMedia } from "utils/media";
import DataItem from "components/DataItem";
import Tag from "components/Tag";
import Button from "components/Button";
import Icon from "components/Icon";
import Avatar from "components/Avatar";
import { CATEGORY_STATUS } from "constants/Category";
import Price from "components/Price";
import TreatmentTitle from "./Components/TreatmentTitle";
import TreatmentSession from "./Components/TreatmentSession";
import TreatmentHighLightAndProcedure from "./Components/TreatmentHighLightAndProcedure";

const TreatmentDetail = ({ data, onTogglePublish }) => {
  const navigate = useNavigate();
  const [openTreatmentTitle, setOpenTreatmentTitle] = useState(false);
  const [openTreatmentDetail, setOpenTreatmentDetail] = useState(false);
  const [openTreatmentSession, setOpenTreatmentSession] = useState(false);

  const formatInterval = (interval) => {
    const intervalSplit = interval?.split(":")
    return intervalSplit[0]*60 + intervalSplit[1]*1 + ' minutes'
  }

  return (
    <div className="mt-10 w-full">
      <div className="flex items-center gap-x-2">
        <div className="flex items-center flex-1 gap-x-4">
          <Avatar
            size={110}
            src={getStrapiMedia({ url: data?.thumbnail?.url })}
            name={`${data?.firstName} ${data?.lastName}`}
          />
          <div className="flex-1">
            <p className="text-24 font-bold">{data?.code}</p>
            <p className="text-18 break-all">{data?.name}</p>
            <Tag
              className={classNames("mt-4 rounded-lg", {
                "bg-red": !data?.publishedAt,
                "bg-green": data?.publishedAt,
              })}
              name={
                data?.publishedAt
                  ? CATEGORY_STATUS.PUBLISHED
                  : CATEGORY_STATUS.UNPUBLISHED
              }
            />
          </div>
        </div>
        <div className="flex gap-x-2">
          <Button
            btnSize="auto"
            className="w-10 h-10"
            shape="circle"
            onClick={() => navigate(`/treatments/${data?.id}/edit`, { data })}
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
          title="Treatment Code"
          value={data?.code}
        />
        <DataItem
          icon="calendar"
          title="Created Date"
          value={dayjs(data?.createdAt).format("DD MMMM, YYYY")}
        />
        <DataItem
          icon="key-square"
          title="Treatment Code & Name"
          value={
            <>
              <span className="block">{data?.slug}</span>
              <span className="block">{data?.name}</span>
            </>
          }
        />
        <DataItem
          icon="save"
          title="Treatment Title"
          value={data?.title?.en}
          valueClassName="truncate overflow-hidden"
          footer={
            <Button
              btnSize="small"
              className="mt-2"
              onClick={() => setOpenTreatmentTitle(true)}
            >
              View Detail
            </Button>
          }
        />

        <DataItem
          icon="bubble"
          title="Treatment Category"
          value={data?.name}
          valueClassName="capitalize"
        />
        <DataItem
          icon="tick-circle"
          className="fill-primary"
          title="is Special & High Tech & Areas"
          value={
            <>
              {data?.isSpecial ? <span className="block">Is Special</span> : <span className="block">No Special</span>}
              {data?.isHighTechnology ? (
                <span className="block">Is High Technology</span>
              ) : (
                <span className="block">Not High Technology</span>
              )}
              {data?.haveAreasTreatment ? (
                <span className="block">Have Areas Treatment</span>
              ) : (
                <span className="block">No Areas Treatment</span>
              )}
            </>
          }
        />
        <DataItem
          icon="menu-board"
          title="Treatment detail"
          value={<span>Highlights & Procedure</span>}
          footer={
            <Button
              btnSize="small"
              className="mt-2"
              onClick={() => setOpenTreatmentDetail(true)}
            >
              View Detail
            </Button>
          }
        />

        <DataItem
          icon="clock"
          title="Booking Time Session"
          value={`${data?.timeSession?.date?.length} days available`}
          footer={
            <Button
              btnSize="small"
              className="mt-2"
              onClick={() => setOpenTreatmentSession(true)}
            >
              View Detail
            </Button>
          }
        />
        <DataItem
          icon="coin"
          title="Treatment Price"
          value={
            <span>
              <Price price={data?.price} /> / {data?.unit} / {formatInterval(data?.interval)}
            </span>
          }
        />
      </div>
      <TreatmentTitle
        onClose={() => setOpenTreatmentTitle(false)}
        openDrawer={openTreatmentTitle}
        title={data?.title}
      />
      <TreatmentHighLightAndProcedure
        onClose={() => setOpenTreatmentDetail(false)}
        openDrawer={openTreatmentDetail}
        data={data}
      />
      <TreatmentSession
        onClose={() => setOpenTreatmentSession(false)}
        openDrawer={openTreatmentSession}
        data={data?.timeSession}
      />
    </div>
  );
};

export default TreatmentDetail;
