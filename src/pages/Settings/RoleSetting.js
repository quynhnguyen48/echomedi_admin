import { useCallback, useEffect, useState } from "react";
import classNames from "classnames";
import some from "lodash/some";
import { useDispatch, useSelector } from "react-redux";
import cloneDeep from "lodash/cloneDeep";

import Page from "components/Page";
import Button from "components/Button";
import Icon from "components/Icon";
import { SIDEBAR_ITEMS } from "constants/SidebarItems";
import AddRoleDrawer from "./Components/AddRoleDrawer";
import {
  deleteRole,
  getListRoles,
  getRoleById,
  updateRole,
} from "services/api/roles";
import { setStaffRoles } from "slice/userSlice";
import { USER_ROLE } from "constants/Authentication";
import { toast } from "react-toastify";
import { getErrorMessage } from "utils/error";
import { DEFAULT_PERMISSIONS } from "constants/DefaultPermissons";

const RoleSetting = () => {
  const dispatch = useDispatch();

  const roles = useSelector((state) => state.user.staffRoles);
  const [visibleAddRoleDrawer, setVisibleAddRoleDrawer] = useState(false);
  const [roleSelected, setRoleSelected] = useState(roles?.[0]?.id);
  const [roleData, setRoleData] = useState(null);
  const [isSavingRole, setIsSavingRole] = useState(false);

  const moduleList = SIDEBAR_ITEMS?.filter((item) => item.id !== "dashboard");

  const fetchRoles = useCallback(async () => {
    const res = await getListRoles();
    if (res?.data) {
      dispatch(
        setStaffRoles(
          res?.data?.roles?.filter(
            (role) =>
              ![USER_ROLE.AUTHENTICATED, USER_ROLE.PUBLIC]?.includes(role.type)
          )
        )
      );
    }
  }, [dispatch]);

  const toggleModule = useCallback(
    (module) => {
      const { apiKey, controllerKey } = module;
      let selectedRoleData = cloneDeep(roleData);
      const controller =
        selectedRoleData?.permissions?.[apiKey]?.controllers?.[controllerKey];
      const isSelected =
        controller && !some(Object.values(controller), ["enabled", false]);

      if (isSelected) {
        selectedRoleData.permissions[apiKey].controllers[controllerKey] =
          DEFAULT_PERMISSIONS[apiKey].controllers[controllerKey];
      } else {
        Object.keys(controller).forEach((key) => {
          selectedRoleData.permissions[apiKey].controllers[controllerKey][
            key
          ].enabled = true;
        });
      }
      setRoleData(selectedRoleData);
    },
    [roleData]
  );

  const handleUpdateRole = useCallback(async () => {
    try {
      setIsSavingRole(true);
      const { id, ...payload } = roleData;
      await updateRole(id, payload);
      toast.success("Saved successfully");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSavingRole(false);
    }
  }, [roleData]);

  const removeRole = useCallback(
    async (id) => {
      try {
        await deleteRole(id);
        await fetchRoles();
        toast.success("Delete successfully");
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
      }
    },
    [fetchRoles]
  );

  const addRoleSuccess = useCallback(
    async (role) => {
      await fetchRoles();
      setVisibleAddRoleDrawer(false);
    },
    [fetchRoles]
  );

  useEffect(() => {
    (async () => {
      if (roleSelected) {
        const res = await getRoleById(roleSelected);
        if (res?.data) {
          setRoleData(res?.data?.role);
        }
      }
    })();
  }, [roleSelected]);

  useEffect(() => {
    if (roles) {
      setRoleSelected(roles?.[0]?.id);
    }
  }, [roles]);

  return (
    <Page title="Role Management" parentUrl="/settings">
      <div className="flex flex-col h-full">
        <div className="bg-form mt-4 rounded-t-2xl p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-x-6">
            <div>
              <h4 className="font-bold text-16">Role</h4>
              <div className="space-y-4 mt-2">
                {roles?.map((role) => {
                  const isSelected = roleSelected === role.id;
                  return (
                    <div key={role.id} className="relative">
                      <button
                        type="button"
                        className={classNames(
                          "h-14 px-6 w-full rounded-lg text-left",
                          {
                            "bg-primary font-bold text-white": isSelected,
                            "bg-white font-normal text-secondary": !isSelected,
                          }
                        )}
                        onClick={() => setRoleSelected(role.id)}
                      >
                        <span>{role.name}</span>
                      </button>
                      {roles.length > 1 && (
                        <button
                          className="absolute top-1/2 translate-y-[-50%] right-4"
                          onClick={() => removeRole(role.id)}
                        >
                          <Icon
                            name="close-circle"
                            className={`${
                              isSelected ? "fill-white" : "fill-placeholder"
                            } w-5 h-5`}
                          />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="pt-4 mt-6 border-primary border-t-1 flex justify-center">
                <Button
                  btnType="text"
                  icon={<Icon name="add-circle" className="fill-darkPrimary" />}
                  className="font-normal text-darkPrimary"
                  onClick={() => setVisibleAddRoleDrawer(true)}
                >
                  Add new Role
                </Button>
              </div>
            </div>

            {roleData && (
              <div>
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-16">Module Access Rights</h4>
                  <Button
                    className="fill-primary"
                    loading={isSavingRole}
                    onClick={handleUpdateRole}
                  >
                    Save
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {moduleList?.map((item) => {
                    const controller =
                      roleData?.permissions?.[item.apiKey]?.controllers?.[
                        item.controllerKey
                      ];
                    const isSelected =
                      controller &&
                      !some(Object.values(controller), ["enabled", false]);

                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={classNames(
                          "h-14 rounded-lg px-6 text-left",
                          {
                            "bg-primary text-white font-bold": isSelected,
                            "bg-white text-secondary font-normal": !isSelected,
                          }
                        )}
                        onClick={() => toggleModule(item)}
                      >
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddRoleDrawer
        openDrawer={visibleAddRoleDrawer}
        onClose={() => setVisibleAddRoleDrawer(false)}
        onSuccess={addRoleSuccess}
      />
    </Page>
  );
};

export default RoleSetting;
