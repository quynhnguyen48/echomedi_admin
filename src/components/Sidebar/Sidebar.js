import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import some from "lodash/some"
import Button from "components/Button"

import { SIDEBAR_ITEMS } from "constants/SidebarItems"
import { getRoleById } from "services/api/roles"
import SidebarItem from "./SidebarItem"
import { isMobile } from "react-device-detect"

const Sidebar = () => {
  let location = useLocation()
  let navigate = useNavigate()

  const currentUser = useSelector((state) => state.user.currentUser)
  const [roleData, setRoleData] = useState(null)
  const [displayNone, setDisplayNone] = useState(isMobile ? true : false)

  const accessSidebarItems = useMemo(() => {
    if (!roleData) return

    return (
      SIDEBAR_ITEMS.filter((item) => {
        if (!item.apiKey) return true
        const controller = roleData?.permissions?.[item.apiKey]?.controllers?.[item.controllerKey]

        return controller && !some(Object.values(controller), ["enabled", false])
      }) || []
    )
  }, [roleData])

  useEffect(() => {
    ;(async () => {
      if (currentUser?.role) {
        const res = await getRoleById(currentUser?.role.id)
        if (res?.data) {
          setRoleData(res?.data?.role)
        }
      }
    })()
  }, [currentUser?.role])

  useEffect(() => {
    if (accessSidebarItems && location?.pathname) {
      const activeItem = SIDEBAR_ITEMS.find((item) =>
        item.url === "/" ? location?.pathname === "/" : location?.pathname?.startsWith(item.url)
      )
      if (activeItem && !accessSidebarItems?.find((item) => item.id === activeItem.id)) {
        // navigate("/")
      }
    }
  }, [accessSidebarItems, location?.pathname, navigate])

  const hideSidebar = () => {
    if (isMobile)
    setDisplayNone(true);
  }

  return (
    <div>
      {isMobile && <button className="fixed top-0 right-0 bg-white w-8 h-8" onClick={e => setDisplayNone(!displayNone)}>
        <img src={"/icons/icons8-menu-rounded-24.png"} />
      </button>
}
    <div className={`sm:w-full w-sidebarWidth ${displayNone ? 'hidden' : 'block'}`}>
      <img src="/images/logo_.png" alt="logo" className="m-auto p-5" />
      <div className="max-h-sidebarHeight overflow-scroll space-y-6">
        {/* <Button 
        className={"m-auto"}
        onClick={(e) => {
          window.open("https://internal.echomedi.com");
        }}
        target="_blank" href="https://internal.echomedi.com">
          Trang tài liệu
          </Button> */}
        {Array.isArray(accessSidebarItems) &&
          accessSidebarItems?.map((item) => <SidebarItem key={item.name} item={item} hideSidebar={hideSidebar}/>)}
        
      </div>
    </div>
    </div>
  )
}

export default Sidebar
