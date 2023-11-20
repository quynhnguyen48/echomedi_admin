import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useParams } from "react-router-dom";

import Input from "components/Input";
import Button from "components/Button";
import { getMe, login, updateUser } from "services/api/users"
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { JWT_TOKEN, USER_ROLE, BRANCH } from "constants/Authentication";
import { setCurrentUser } from "slice/userSlice";
import { useDispatch } from "react-redux";
import { getErrorMessage } from "utils/error";
import classNames from "classnames";
import axios from "../../services/axios"

const Login = () => {
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [branch, setBranch] = useState("q7");
  const [db, setDb] = useState();
  const { t, redirectUrl } = useParams();
  const [step, setStep] = useState(0);

  const validationSchema = yup.object({
    id: yup
      .string(),
    otp: yup
      .string(),
      password: yup.string(),
      confirmPassword: yup.string(),
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      ID: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (t) {
        localStorage.setItem(JWT_TOKEN, t);
        const userRes = await getMe();
        if (
          ![USER_ROLE.PUBLIC, USER_ROLE.AUTHENTICATED].includes(
            userRes?.data?.role?.type
          )
        ) {
          dispatch(setCurrentUser(userRes.data));
          await updateUser(userRes?.data?.id, {
            lastLogin: new Date()
          })
          if (redirectUrl) {
            window.location.href = redirectUrl;
          }
        } else {
          localStorage.removeItem(JWT_TOKEN);
          throw new Error("You don't have permission to access");
        }
      }
    }
    if (t) {
      fetchData()
        // bắt lỗi
        .catch(console.error);
    }
  }, [])

  const onSubmit = async (data) => {
    console.log('data', data)
    if (step == 0) {
      axios.post('/auth/forgotPasswordEM', {
        id: data.id,
      }).then(() => {
        setStep(1);
      })
      return;
    } else if (step == 1) {
      axios.post('/user/resetPassword', {
        code: data.otp,
        password: data.password,
        passwordConfirmation: data.confirmPassword,
      }).then(() => {
        // setStep(1);
        toast.success("Cập nhật thành công!");
        window.location.href = "/login";
      }).catch(() => {
        toast.error("Lỗi xảy ra, xin kiểm tra lại!")
      })
      return;
    }
  };



  const getDisplayLabelBranches = (value) => {
    switch (value) {
      case "q7":
        return "Quận 7";
      case "q2":
        return "Quận 2";
      case "binhduong":
        return "Bình Dương"
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-center w-full"
    >
      <div>
        <img width={400} src="/images/logo_.png" alt="Logo" />
      </div>
      <div className="rounded-2xl p-6 space-y-6 flex-1 max-w-[500px] w-full">

        {step == 0 && <Controller
          name="id"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Input
              value={value}
              onChange={onChange}
              label="ID"
              inputClassName="bg-primary/10"
              errors={errors?.email?.message}
            />
          )}
        />}

        {step == 1 && <Controller
          name="otp"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Input
              value={value}
              onChange={onChange}
              label="OTP"
              inputClassName="bg-primary/10"
              errors={errors?.email?.message}
            />
          )}
        />}

        {step == 1 && <Controller
          name="password"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Input
              value={value}
              onChange={onChange}
              label="Password"
              type="password"
              inputClassName="bg-primary/10"
              errors={errors?.email?.message}
            />
          )}
        />}

        {step == 1 && <Controller
          name="confirmPassword"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Input
              value={value}
              onChange={onChange}
              label="Confirm password"
              type="password"
              inputClassName="bg-primary/10"
              errors={errors?.email?.message}
            />
          )}
        />}

        {/* <Controller
          name="password"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Input
              value={value}
              onChange={onChange}
              label="Mật khẩu"
              name="password"
              type="password"
              placeholder="Nhâp mật khẩu"
              inputClassName="bg-primary/10"
              errors={errors?.password?.message}
            />
          )}
        /> */}

        <div className="flex flex-col justify-center gap-x-4 mt-10">
          {/* <a href="/forgot-password" className="fill-primary m-auto mb-4" type="submit" loading={isLoading}>
            QUÊN MẬT KHẨU
          </a> */}
          <Button className="fill-primary" type="submit" loading={isLoading}>
            TIẾP TỤC
          </Button>
        </div>
      </div>
    </form>
  );
};

export default Login;