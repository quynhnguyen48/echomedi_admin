export const SIDEBAR_ITEMS = [
  {
    id: "dashboard",
    name: "Bảng thông tin",
    icon: "sidebar/dashboard",
    url: "/",
  },
  
  {
    id: "patient",
    name: "Danh sách khách hàng",
    icon: "sidebar/patient",
    url: "/patient",
    apiKey: "api::patient",
    controllerKey: "patient",
  },
  {
    id: "today-patient",
    name: "Danh sách tiếp đón",
    icon: "sidebar/customer",
    url: "/today-patient",
    apiKey: "api::patient",
    controllerKey: "patient",
  },
  {
    id: "orders",
    name: "Quản lý đơn hàng",
    icon: "sidebar/orders",
    url: "/orders",
    apiKey: "api::patient",
    controllerKey: "patient",
  },
  {
    id: "medical-record",
    name: "Hồ sơ bệnh án",
    icon: "sidebar/medical-records",
    url: "/medical-records",
    apiKey: "api::medical-record",
    controllerKey: "medical-record",
  },
  {
    id: "bookings",
    name: "Đặt lịch hẹn",
    icon: "sidebar/bookings",
    url: "/bookings",
    apiKey: "api::booking",
    controllerKey: "booking",
  },
  {
    id: "list-bookings",
    name: "Danh sách lịch hẹn",
    icon: "sidebar/bookings",
    url: "/list-bookings",
    apiKey: "api::booking",
    controllerKey: "booking",
  },
  {
    id: "conversation",
    name: "Hội thoại",
    icon: "sidebar/conversation",
    url: "/conversation-queues",
  },
  {
    id: "chat",
    name: "Nhắn tin",
    icon: "sidebar/conversation",
    url: "/chat",
    // apiKey: "api::conversation",
    // controllerKey: "conversation",
  },
  {
    id: "chat-request",
    name: "Yêu cầu hỗ trợ",
    icon: "sidebar/conversation",
    url: "/request-chat",
    // apiKey: "api::conversation-queue",
    // controllerKey: "conversation-queue",
  },
  {
    id: "invoices",
    name: "Hoá đơn",
    icon: "sidebar/coin",
    url: "/invoices",
    apiKey: "api::invoice",
    controllerKey: "invoice",
  },
  {
    id: "drugs",
    name: "Thuốc",
    icon: "sidebar/drug",
    url: "/drugs/import",
    apiKey: "api::drug",
    controllerKey: "drug",
  },
  {
    id: "boards",
    name: "Boards",
    icon: "sidebar/kanban",
    url: "/boards",
  },
  {
    id: "tasks",
    name: "Tasks",
    icon: "sidebar/kanban",
    url: "/tasks",
  },
  {
    id: "customers",
    name: "Khách hàng",
    icon: "sidebar/customer",
    url: "/customers",
    apiKey: "plugin::users-permissions",
    controllerKey: "user",
  },
  {
    id: "orders",
    name: "Đơn hàng",
    icon: "sidebar/orders",
    url: "/orders",
    apiKey: "api::order",
    controllerKey: "order",
  },
  {
    id: "medical-service",
    name: "Dịch vụ",
    icon: "sidebar/service-card",
    url: "/medical-services",
    apiKey: "api::medical-service",
    controllerKey: "medical-service",
  },
  {
    id: "service-bundle",
    name: "Gói dịch vụ",
    icon: "sidebar/treatments",
    url: "/service-bundle",
    apiKey: "api::service-bundle",
    controllerKey: "service-bundle",
  },
  {
    id: "chronic-service",
    name: "Dịch vụ mạn tính",
    icon: "sidebar/treatments",
    url: "/chronic-service",
    apiKey: "api::chronic-service",
    controllerKey: "chronic-service",
  },
  {
    id: "report",
    name: "Tin tức",
    icon: "sidebar/news",
    url: "/news",
    apiKey: "api::news",
    // controllerKey: "term",
  },
  {
    id: "email-template",
    name: "Email Templates",
    icon: "sidebar/email",
    url: "/email-templates",
    apiKey: "api::email-template",
    controllerKey: "email-template",
  },
  {
    id: "report",
    name: "Báo cáo",
    icon: "sidebar/report",
    url: "/reports",
    apiKey: "api::report",
    controllerKey: "report",
  },
  {
    id: "products",
    name: "Sản phẩm",
    icon: "sidebar/products",
    url: "/products",
    // subItems: [{ name: "Product Settings", url: "/product-settings" }],
    apiKey: "api::product",
    controllerKey: "product",
  },
  {
    id: "treatments",
    name: "Treatments",
    icon: "sidebar/treatments",
    url: "/treatments",
    subItems: [{ name: "Treatment Category", url: "/treatment-category" }],
    apiKey: "api::treatment",
    controllerKey: "treatment",
  },
  {
    id: "treatment-history",
    name: "Treatment History",
    icon: "sidebar/treatment-history",
    url: "/treatment-history",
    apiKey: "api::treatment-history",
    controllerKey: "treatment-history",
  },
  {
    id: "blogs",
    name: "Blogs",
    icon: "sidebar/blogs",
    url: "/blogs",
    subItems: [{ name: "Blog Categories", url: "/blog-categories" }],
    apiKey: "api::blog",
    controllerKey: "blog",
  },
  {
    id: "website-content",
    name: "Website Content",
    icon: "sidebar/website-content",
    url: "/website-content",
    subItems: [
      { name: "Banner", url: "/banner" },
      { name: "About", url: "/about" },
      { name: "Privacy", url: "/privacy" },
      { name: "Terms", url: "/terms" },
      { name: "FAQs", url: "/faqs" },
    ],
    apiKey: "api::privacy",
    controllerKey: "privacy",
  },
  {
    id: "staffs",
    name: "Nhân viên",
    icon: "sidebar/staffs",
    url: "/staffs",
    apiKey: "plugin::users-permissions",
    controllerKey: "user",
  },
  {
    id: "check-in",
    name: "Check-in",
    icon: "sidebar/check-in",
    url: "/check-in",
    apiKey: "api::check-in",
    controllerKey: "check-in",
  },
  // {
  //   id: "membership-card",
  //   name: "Membership Card",
  //   icon: "sidebar/membership-card",
  //   url: "/membership-card",
  //   apiKey: "api::membership-card",
  //   controllerKey: "membership-card",
  // },
  // {
  //   id: "service-card",
  //   name: "Service Card",
  //   icon: "sidebar/membership-card",
  //   url: "/service-card",
  //   apiKey: "api::membership-card",
  //   controllerKey: "membership-card",
  // },
  // {
  //   id: "media-library",
  //   name: "Media Library",
  //   icon: "sidebar/media-library",
  //   url: "/media-library",
  //   apiKey: "plugin::upload",
  //   controllerKey: "content-api",
  // },
  // {
  //   id: "transaction",
  //   name: "Transaction",
  //   icon: "sidebar/coin",
  //   url: "/transactions",
  //   apiKey: "api::transaction",
  //   controllerKey: "transaction",
  // },
  {
    id: "settings",
    name: "Cài đặt",
    icon: "sidebar/settings",
    url: "/settings",
    // apiKey: "api::setting",
    // controllerKey: "setting",
  },
]
