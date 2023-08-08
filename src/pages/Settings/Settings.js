import Page from "components/Page"
import Icon from "../../components/Icon"
import { useNavigate } from "react-router-dom"

const SETTINGS = [
  {
    icon: "truck",
    title: "Bảng viết tắt",
    url: "/settings/abbreviation",
  },
  // {
  //   icon: "briefcase",
  //   title: "Role",
  //   url: "/settings/role",
  // },
  {
    icon: "coin",
    title: "Lý do giảm giá",
    url: "/settings/discount-reason",
  },
  {
    icon: "coin",
    title: "Đổi mật khẩu",
    url: "/settings/change-password",
  },
  {
    icon: "coin",
    title: "Chữ ký",
    url: "/settings/signature",
  },
]

const Settings = () => {
  const navigate = useNavigate()

  return (
    <Page title="Cài đặt">
      <div className="grid grid-cols-4 gap-6">
        {SETTINGS.map((item, index) => (
          <button
            key={index}
            type="button"
            onClick={() => navigate(item.url)}
            className="flex flex-col items-center bg-gray2 py-8 rounded-xl"
          >
            <Icon name={item.icon} className="fill-primary w-12 h-12" />
            <b className="font-bold text-24 text-primary mt-4">{item.title}</b>
          </button>
        ))}
      </div>
    </Page>
  )
}

export default Settings
