import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

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

const Login = () => {
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [branch, setBranch] = useState("q7");
  const [db, setDb] = useState();

  const validationSchema = yup.object({
    email: yup
      .string()
      .trim()
      .matches(
        /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g,
        "Email is not in correct format"
      )
      .required("Email is required"),
    password: yup.string().required("Customer is required"),
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    var request = window.indexedDB.open("echomedi", 1)
    request.onsuccess = event => {
      setDb(request.result);
    };
    var db = null;
    var collection = "echomedi";
    request.onupgradeneeded = (event) => {
      db = event.target.result
      db.createObjectStore(collection, {
        // Giá trị cột key tự động tăng
        autoIncrement: true
      })
      console.log('asd')
      setDb(db);
      // db.transaction(collection, "readwrite")
      //   .objectStore(collection)
      //   .add({token: loginRes.data?.jwt})
    };
  }, [])

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const loginRes = await login({
        identifier: data?.email,
        password: data?.password,
      });
      if (loginRes.data?.jwt) {
        localStorage.setItem(JWT_TOKEN, loginRes.data?.jwt);
        localStorage.setItem(BRANCH, branch);
        db.transaction("echomedi", "readwrite")
          .objectStore("echomedi")
          .put({
            id: 1, token: loginRes.data?.jwt
          }, 1);


          var request = db.transaction("echomedi").objectStore("echomedi").get(1);
          request.onsuccess = (event) => {
            console.log(`Value is: ${event.target.result.token}` )
        }

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
        } else {
          localStorage.removeItem(JWT_TOKEN);
          throw new Error("You don't have permission to access");
        }
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
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
      <div className="rounded-2xl p-6 space-y-6 flex-1 max-w-[500px] w-full mt-10">
        <Controller
          name="email"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Input
              value={value}
              onChange={onChange}
              label="Email"
              name="email"
              type="email"
              placeholder="Nhập Email"
              inputClassName="bg-primary/10"
              errors={errors?.email?.message}
            />
          )}
        />

        <Controller
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
        />
        <div className="space-y-2">
          <label className="font-16 font-bold">Chọn chi nhánh</label>
          <div className="grid grid-cols-3 gap-x-6">
            <Controller
              name="gender"
              control={control}
              render={({ field: { onChange, value } }) => (
                <>
                  {["q7", "q2", "binhduong"]?.map((gender) => (
                    <Button
                      key={gender}
                      onChange={onchange}
                      type="button"
                      className={classNames("w-full h-14 pl-6 !justify-start capitalize", {
                        "bg-primary text-white font-bold": gender === branch,
                        "bg-primary/10 text-primary font-normal": gender !== branch,
                      })}
                      onClick={() => setBranch(gender)}
                    >
                      {getDisplayLabelBranches(gender)}
                    </Button>
                  ))}
                  {errors?.gender?.message && (
                    <p className="text-12 text-error mt-1">{errors?.gender?.message}</p>
                  )}
                </>
              )}
            />
          </div>
        </div>
        <div className="flex justify-center gap-x-4 mt-10">
          <Button className="fill-primary" type="submit" loading={isLoading}>
            ĐĂNG NHẬP
          </Button>
        </div>
      </div>
    </form>
  );
};

export default Login;