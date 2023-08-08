import MedicalRecord from "pages/MedicalRecord"
import React from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import Loading from "components/Loading"
import Boards from "../pages/Boards/Boards"
import Board from "../pages/Board/Board"

const Dashboard = React.lazy(() => import("pages/Dashboard"))
const Customers = React.lazy(() => import("pages/Customers"))
const Bookings = React.lazy(() => import("pages/Bookings"))
const Orders = React.lazy(() => import("pages/Orders"))
const Products = React.lazy(() => import("pages/Products"))
const Treatments = React.lazy(() => import("pages/Treatments"))
const TreatmentHistory = React.lazy(() => import("pages/TreatmentHistory"))
const Blogs = React.lazy(() => import("pages/Blogs"))
const WebsiteContent = React.lazy(() => import("pages/WebsiteContent"))
const Staffs = React.lazy(() => import("pages/Staffs"))
const Checkin = React.lazy(() => import("pages/Checkin"))
const MembershipCard = React.lazy(() => import("pages/MembershipCard"))
const EditMembershipCard = React.lazy(() => import("pages/MembershipCard/EditMembershipCard"))
const CreateMembershipCard = React.lazy(() => import("pages/MembershipCard/CreateMembershipCard"))
const MediaLibrary = React.lazy(() => import("pages/MediaLibrary"))
const Settings = React.lazy(() => import("pages/Settings"))
const ShippingSetting = React.lazy(() => import("pages/Settings/ShippingSetting"))
const AbbreviationSetting = React.lazy(() => import("pages/Settings/AbbreviationSetting"))
const RoleSetting = React.lazy(() => import("pages/Settings/RoleSetting"))
const StaffInterestSetting = React.lazy(() => import("pages/Settings/StaffInterestSetting"))
const DiscountSetting = React.lazy(() => import("pages/Settings/DiscountSetting"))
const ProductSettings = React.lazy(() => import("pages/ProductSettings"))
const TreatmentCategory = React.lazy(() => import("pages/TreatmentCategory"))
const BlogCategories = React.lazy(() => import("pages/BlogCategories"))
const Banner = React.lazy(() => import("pages/Banner"))
const About = React.lazy(() => import("pages/About"))
const Privacy = React.lazy(() => import("pages/Privacy"))
const Terms = React.lazy(() => import("pages/Terms"))
const FAQs = React.lazy(() => import("pages/FAQs"))
const Theme = React.lazy(() => import("pages/Theme"))
const PasswordChange = React.lazy(() => import("pages/PasswordChange"))
const Signature = React.lazy(() => import("pages/Signature"))
const Transactions = React.lazy(() => import("pages/Transactions"))
const ServiceCard = React.lazy(() => import("pages/ServiceCard"))
const EditServiceCard = React.lazy(() => import("pages/ServiceCard/EditServiceCard"))
const CreateServiceCard = React.lazy(() => import("pages/ServiceCard/CreateServiceCard"))
const CreateCustomers = React.lazy(() => import("pages/Customers/CreateCustomers"))
const EditCustomer = React.lazy(() => import("pages/Customers/EditCustomer"))

const CreateBooking = React.lazy(() => import("pages/Bookings/CreateBooking"))
const EditBooking = React.lazy(() => import("pages/Bookings/EditBooking"))
const UpsertTransaction = React.lazy(() => import("pages/Transactions/UpsertTransaction"))
const UpsertProduct = React.lazy(() => import("pages/Products/UpsertProduct"))
const UpsertBlog = React.lazy(() => import("pages/Blogs/UpsertBlog"))
const UpsertTreatmentHistory = React.lazy(() =>
  import("pages/TreatmentHistory/UpsertTreatmentHistory")
)

const EditTreatments = React.lazy(() => import("pages/Treatments/UpsertTreatment"))
const CreateTreatments = React.lazy(() => import("pages/Treatments/UpsertTreatment"))

const CreateStaff = React.lazy(() => import("pages/Staffs/UpsertStaff"))
const EditStaff = React.lazy(() => import("pages/Staffs/UpsertStaff"))

const Reports = React.lazy(() => import("pages/Reports"))
const RevenueReport = React.lazy(() => import("pages/Reports/RevenueReport"))
const GrowthReport = React.lazy(() => import("pages/Reports/GrowthReport"))
const DebtsReport = React.lazy(() => import("pages/Reports/DebtsReport"))
const TreatmentsReport = React.lazy(() => import("pages/Reports/TreatmentsReport"))
const ProductsReport = React.lazy(() => import("pages/Reports/ProductsReport"))
const ServiceCardsReport = React.lazy(() => import("pages/Reports/ServiceCardsReport"))
const BookingsReport = React.lazy(() => import("pages/Reports/BookingsReport"))
const EmployeesReport = React.lazy(() => import("pages/Reports/EmployeesReport"))
const CustomersReport = React.lazy(() => import("pages/Reports/CustomersReport"))
const UpsertMedicalRecord = React.lazy(() => import("pages/MedicalRecord/UpsertMedicalRecord"))
const UpsertMedicalRecordBooking = React.lazy(() => import("pages/Bookings/UpsertMedicalRecord"))
const Patient = React.lazy(() => import("pages/Patient/Patient"))
const CreatePatient = React.lazy(() => import("pages/Patient/CreatePatient"))
const TodayPatient = React.lazy(() => import("pages/Patient/TodayPatient"))
const EditPatient = React.lazy(() => import("pages/Patient/EditPatient"))
const DrugsImport = React.lazy(() => import("pages/Drugs/Import"))
const Invoice = React.lazy(() => import("pages/Invoice"))
const MedicalServices = React.lazy(() => import("pages/MedicalService/MedicalService"));
const EditMedicalServices = React.lazy(() => import("pages/MedicalService/EditMedicalService"));
const CreateMedicalService = React.lazy(() => import("pages/MedicalService/CreateMedicalService"));
const CreateBundleService = React.lazy(() => import("pages/ServiceBundle/CreateBundleService"));
const ServiceBundles = React.lazy(() => import("pages/ServiceBundle/ServiceBundle"));
const News = React.lazy(() => import("pages/News/News"));
const EmailTemplate = React.lazy(() => import("pages/EmailTemplate/EmailTemplate"));
const ChatPage = React.lazy(() => import("pages/Chat/ServiceBundle"));
const ChatRequestPage = React.lazy(() => import("pages/ChatRequest/ServiceBundle"));
const MessagePage = React.lazy(() => import("pages/MessagePage/ServiceBundle"));

const MainRoutes = () => {
  return (
    <React.Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/customers/create" element={<CreateCustomers />} />
        <Route path="/customers/:id/edit" element={<EditCustomer />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/bookings/:id" element={<Bookings />} />
        <Route path="/bookings/create" element={<CreateBooking />} />
        <Route path="/bookings/:id/edit" element={<EditBooking />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/create" element={<UpsertProduct />} />
        <Route path="/products/:id/edit" element={<UpsertProduct />} />
        <Route path="/product-settings" element={<ProductSettings />} />
        <Route path="/treatments" element={<Treatments />} />
        <Route path="/treatments/create" element={<CreateTreatments />} />
        <Route path="/treatments/:id/edit" element={<EditTreatments />} />
        <Route path="/treatment-history" element={<TreatmentHistory />} />
        <Route path="/treatment-history/create" element={<UpsertTreatmentHistory />} />
        <Route path="/treatment-history/:id/edit" element={<UpsertTreatmentHistory />} />
        <Route path="/treatment-category" element={<TreatmentCategory />} />
        <Route path="/medical-records" element={<MedicalRecord />} />
        <Route path="/medical-records/create" element={<UpsertMedicalRecord />} />
        <Route path="/medical-records/:user_id/create/" element={<UpsertMedicalRecord />} />
        <Route
          path="/bookings/medical-records/:id/create/"
          element={<UpsertMedicalRecordBooking />}
        />
        <Route
          path="/bookings/medical-records/:id/view/"
          element={<UpsertMedicalRecordBooking />}
        />
        <Route
          path="/bookings/medical-records/:id/edit/"
          element={<UpsertMedicalRecordBooking />}
        />
        <Route path="/medical-records/:id/edit/" element={<UpsertMedicalRecord />} />
        <Route path="/medical-records/:id/view/" element={<UpsertMedicalRecord />} />
        <Route path="/patient" element={<Patient />} />
        <Route path="/patient/create" element={<CreatePatient />} />
        <Route path="/today-patient" element={<TodayPatient />} />
        <Route path="/today-patient/:status" element={<TodayPatient />} />
        <Route path="/patient/:id/edit" element={<EditPatient />} />
        <Route path="/patient/:id/view" element={<EditPatient />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/blogs/create" element={<UpsertBlog />} />
        <Route path="/blogs/:id/edit" element={<UpsertBlog />} />
        <Route path="/blog-categories" element={<BlogCategories />} />
        <Route path="/website-content" element={<WebsiteContent />} />
        <Route path="/staffs" element={<Staffs />} />
        <Route path="/staffs/create" element={<CreateStaff />} />
        <Route path="/staffs/:id/edit" element={<EditStaff />} />
        <Route path="/check-in" element={<Checkin />} />
        <Route path="/membership-card" element={<MembershipCard />} />
        <Route path="/membership-card/:id/edit" element={<EditMembershipCard />} />
        <Route path="/membership-card/create" element={<CreateMembershipCard />} />
        <Route path="/media-library" element={<MediaLibrary />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/abbreviation" element={<AbbreviationSetting />} />
        <Route path="/settings/shipping" element={<ShippingSetting />} />
        <Route path="/settings/role" element={<RoleSetting />} />
        <Route path="/settings/staff-interest" element={<StaffInterestSetting />} />
        <Route path="/settings/discount-reason" element={<DiscountSetting />} />
        <Route path="/service-card" element={<ServiceCard />} />
        <Route path="/service-card/:id/edit" element={<EditServiceCard />} />
        <Route path="/service-card/create" element={<CreateServiceCard />} />
        <Route path="/banner" element={<Banner />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/theme" element={<Theme />} />
        <Route path="/settings/change-password" element={<PasswordChange />} />
        <Route path="/settings/signature" element={<Signature />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/transactions/create" element={<UpsertTransaction />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/revenue" element={<RevenueReport />} />
        <Route path="/reports/growth" element={<GrowthReport />} />
        <Route path="/reports/debts" element={<DebtsReport />} />
        <Route path="/reports/treatments-services" element={<TreatmentsReport />} />
        <Route path="/reports/products" element={<ProductsReport />} />
        <Route path="/reports/service-cards" element={<ServiceCardsReport />} />
        <Route path="/reports/bookings" element={<BookingsReport />} />
        <Route path="/reports/employees" element={<EmployeesReport />} />
        <Route path="/reports/customers" element={<CustomersReport />} />
        <Route path="/drugs/import" element={<DrugsImport />} />
        <Route path="/invoices" element={<Invoice />} />
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/medical-services" element={<MedicalServices />} />
        <Route path="/medical-services/:id/edit" element={<EditMedicalServices />} />
        <Route path="/service-bundle" element={<ServiceBundles />} />
        <Route path="/news" element={<News />} />
        <Route path="/email-templates" element={<EmailTemplate />} />
        <Route path="/medical-services/create" element={<CreateMedicalService />} />
        <Route path="/service-bundle/create" element={<CreateBundleService />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/request-chat" element={<ChatRequestPage />} />
        <Route path="/chat/:id/:email" element={<MessagePage />} />
        <Route path="/boards" element={<Boards />} />
        <Route path="/board/:id/:taskId" element={<Board />} />
        <Route path="/board/:id" element={<Board />} />
      </Routes>
    </React.Suspense>
  )
}

export default MainRoutes
