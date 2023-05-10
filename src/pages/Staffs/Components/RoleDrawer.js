import { useEffect, useMemo, useState } from "react";
import some from "lodash/some";

import Drawer from "components/Drawer";
import DataItem from "components/DataItem";
import { SIDEBAR_ITEMS } from "constants/SidebarItems";
import Icon from "components/Icon";
import { getRoleById } from "services/api/roles";

const RoleDrawer = ({ openDrawer, onClose, role }) => {
  const [roleData, setRoleData] = useState(null);

  const modulesSelected = useMemo(() => {
    return (
      SIDEBAR_ITEMS.filter((item) => {
        if (!item.apiKey) return true;
        const controller =
          roleData?.permissions?.[item.apiKey]?.controllers?.[
            item.controllerKey
          ];

        return (
          controller && !some(Object.values(controller), ["enabled", false])
        );
      }) || []
    );
  }, [roleData?.permissions]);

  useEffect(() => {
    (async () => {
      if (role) {
        const res = await getRoleById(role.id);
        if (res?.data) {
          setRoleData(res?.data?.role);
        }
      }
    })();
  }, [role]);

  return (
    <Drawer open={openDrawer} onClose={onClose}>
      <DataItem icon="briefcase" title="Role" value={role?.name} />
      <h4 className="font-bold mt-6">Module Access Rights</h4>
      <div className="mt-4 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {modulesSelected.map((module) => (
            <div className="bg-gray2 h-[180px] pt-10 flex flex-col items-center justify-start rounded-lg">
              <Icon
                name={`${module.icon}-active`}
                className="fill-primary w-12 h-12 mb-4"
              />
              <b className="text-primary text-center">{module.name}</b>
            </div>
          ))}
        </div>
      </div>
    </Drawer>
  );
};

export default RoleDrawer;
