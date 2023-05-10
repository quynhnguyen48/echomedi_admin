import Page from "components/Page"
import Icon from "../../components/Icon"
import { useNavigate } from "react-router-dom"

const REPORTS_MENU = [
  {
    icon: "chart-square",
    title: "Doanh thu",
    url: "/reports/revenue",
  },
  // {
  //   icon: "status-up",
  //   title: "Tăng trưởng",
  //   url: "/reports/growth",
  // },
  // {
  //   icon: "dollar-circle",
  //   title: "Nợ",
  //   url: "/reports/debts",
  // },
  // {
  //   icon: "grammerly",
  //   title: "Treatments / Services",
  //   url: "/reports/treatments-services",
  // },
  // {
  //   icon: "milk",
  //   title: "Sản phẩm",
  //   url: "/reports/products",
  // },
  // {
  //   icon: "money",
  //   title: "Gói thành viên",
  //   url: "/reports/service-cards",
  // },
  // {
  //   icon: "calendar-tick",
  //   title: "Lịch hẹn",
  //   url: "/reports/bookings",
  // },
  // {
  //   icon: "users",
  //   title: "Nhân viên",
  //   url: "/reports/employees",
  // },
  // {
  //   icon: "user",
  //   title: "Khách hàng",
  //   url: "/reports/customers",
  // },
]

const Reports = () => {
  const navigate = useNavigate()

  return (
    <Page title="Báo cáo">
      <div className="grid grid-cols-4 gap-6">
        {REPORTS_MENU.map((item, index) => (
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

export default Reports
