import { yupResolver } from "@hookform/resolvers/yup/dist/yup";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as yup from "yup";

import Button from "components/Button";
import Drawer from "components/Drawer";
import Input from "components/Input";
import { createNewRole } from "services/api/roles";
import { getErrorMessage } from "utils/error";
import { DEFAULT_PERMISSIONS } from "constants/DefaultPermissons";

const AddRoleDrawer = ({ openDrawer, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const validationSchema = yup.object({
    name: yup.string().required("Role name is required"),
  });

  const {
    control,
    reset,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await createNewRole({
        name: data?.name,
        description: data?.name,
        permissions: DEFAULT_PERMISSIONS,
        users: [],
      });
      await onSuccess();
      reset();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer open={openDrawer} onClose={onClose}>
      <h4 className="font-bold text-16">Add new role</h4>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        <Controller
          name="name"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              inputClassName="bg-form"
              name="name"
              placeholder="Input role name"
              value={value}
              onChange={onChange}
              errors={errors?.name?.message}
            />
          )}
        />

        <div className="flex space-x-4 mt-10">
          <Button className="fill-primary" type="submit" loading={loading}>
            Save
          </Button>
          <Button btnType="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Drawer>
  );
};

export default AddRoleDrawer;
