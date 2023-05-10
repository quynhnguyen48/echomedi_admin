import { useState } from "react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import classNames from "classnames";

import DataItem from "components/DataItem";
import Tag from "components/Tag";
import Button from "components/Button";
import Icon from "components/Icon";
import Avatar from "components/Avatar";
import { getStrapiMedia } from "utils/media";
import RoleDrawer from "./Components/RoleDrawer";

const StaffDetail = ({ data, ontToggleBlockStaff }) => {
  const navigate = useNavigate();
  const [visibleRoleDrawer, setVisibleRoleDrawer] = useState(false);

  return (
    <div className="mt-10 w-full">
      <div className="flex items-center gap-x-2">
        <div className="flex items-center flex-1 gap-x-4">
          <Avatar
            size={110}
            src={getStrapiMedia({ url: data?.avatar })}
            name={`${data?.firstName} ${data?.lastName}`}
          />
          <div className="flex-1">
            <p className="text-24 font-bold">{`${data?.firstName} ${data?.lastName}`}</p>
            <p className="text-18 break-all mb-3 mt-1">{data?.email}</p>
            <Tag
              secondary
              className={classNames({
                "bg-red": data.blocked,
                "bg-green": !data.blocked,
              })}
              name={data.blocked ? "Inactive" : "Active"}
            />
          </div>
        </div>
        <div className="flex gap-x-2">
          <Button
            btnSize="auto"
            className="w-10 h-10"
            shape="circle"
            onClick={() => navigate(`/staffs/${data?.id}/edit`)}
          >
            <Icon name="edit" />
          </Button>
          <Button
            btnSize="auto"
            className={`w-10 h-10 ${data?.blocked ? 'bg-green' : 'bg-red'}`}
            shape="circle"
            onClick={ontToggleBlockStaff}>
            <Icon name="slash" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 grid-flow-row gap-y-20 mt-12">
        <DataItem icon="key" title="Staff ID" value={data?.code} />
        <DataItem
          icon="calendar"
          title="Joined Date"
          value={
            data?.createdAt
              ? dayjs(data?.createdAt).format("DD MMMM, YYYY")
              : "-"
          }
        />
        <DataItem
          icon="user"
          title="Full Name"
          value={`${data?.firstName} ${data?.lastName}`}
        />
        <DataItem icon="message" title="Email" value={data?.email} />
        <DataItem
          icon="man"
          title="Gender"
          value={data?.gender}
          valueClassName="capitalize"
        />
        <DataItem
          icon="cake"
          title="Date of Birth"
          value={
            data?.birthday ? dayjs(data?.birthday).format("DD MMMM, YYYY") : "-"
          }
        />
        <DataItem icon="call" title="Phone Number" value={data?.phone || "-"} />
        <DataItem
          icon="location"
          title="Address"
          value={
            data?.address
              ? `${data?.address?.address || ""}, ${
                  data?.address?.ward?.name || ""
                }, ${data?.address?.district?.name || ""}, ${
                  data?.address?.province?.name || ""
                }`
              : "-"
          }
        />
        <DataItem
          icon="user-octagon"
          title="Identity Number"
          value={data?.identity || "-"}
        />
        <DataItem
          icon="briefcase"
          title="Role"
          value={data?.role?.name}
          footer={
            <Button
              btnSize="small"
              className="mt-2"
              onClick={() => setVisibleRoleDrawer(true)}
            >
              View Detail
            </Button>
          }
        />
      </div>

      <RoleDrawer
        openDrawer={visibleRoleDrawer}
        onClose={() => setVisibleRoleDrawer(false)}
        role={data?.role}
      />
    </div>
  );
};

export default StaffDetail;
