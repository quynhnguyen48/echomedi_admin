import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import some from "lodash/some"
import Button from "components/Button"
import { JWT_TOKEN, BRANCH } from "../../constants/Authentication"
import { SIDEBAR_ITEMS } from "constants/SidebarItems"
import { getRoleById } from "services/api/roles"
import SidebarItem from "./SidebarItem"
import { isMobile } from "react-device-detect"
import Icon from "components/Icon";

const getBranchDisplayLabel = () => {
  const branch = localStorage.getItem(BRANCH);
  switch (branch) {
    case "q7":
      return "Quận 7";
      break;
    case "q2":
      return "Quận 2";
      break;
    case "binhduong":
      return "Bình Dương";
      break;
  }
}

const changeBranch = (b) => {
  localStorage.setItem(BRANCH, b);
  window.location.reload();
}

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
    ; (async () => {
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

  const logout = () => {
    localStorage.removeItem(JWT_TOKEN);
    navigate('/login')
  }

  return (
    <div>
      {isMobile && <button className="fixed top-0 right-0 bg-white w-8 h-8" onClick={e => setDisplayNone(!displayNone)}>
        <img src={"/icons/icons8-menu-rounded-24.png"} />
      </button>
      }
      <div className={`sm:w-[100vw] w-sidebarWidth ${displayNone ? 'hidden' : 'block'}`}>
        <img src="/images/logo_.png" alt="logo" className="m-auto p-2 sm:w-60" />
        {
          currentUser && isMobile &&
          <div className="flex">
            <div className="m-auto">

              <div className="dropdown inline-block relative">
                <button className="bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded inline-flex items-center">
                  <span className="mr-1">{getBranchDisplayLabel()}</span>
                  <svg className="fill-current h-4 w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /> </svg>
                </button>
                <ul className="dropdown-menu absolute hidden text-gray-700 py-2 bg-gray z-50">
                  <li className="" onClick={() => changeBranch("q7")}><button onClick={() => changeBranch("q7")} className="rounded-t bg-gray-200 hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap">Quận 7</button></li>
                  <li className="" onClick={() => changeBranch("q2")}><button className="bg-gray-200 hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap">Quận 2</button></li>
                  <li className="" onClick={() => changeBranch("binhduong")}><button className="rounded-b bg-gray-200 hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap">Bình Dương</button></li>
                </ul>
              </div>

            </div>
            <div className="flex">
            <Button shape="circle" className="m-auto bg-transparent w-[200px] text-[green]" onClick={() => navigate("/settings")}>
              <pre>{" " + currentUser?.patient?.full_name + " (" + currentUser?.role.type + ")  "}</pre>
            </Button>
            <Button shape="circle" className="m-auto bg-transparent" onClick={() => logout()}>
              <Icon name="logout-circle" />
            </Button>
            </div>
          </div>
        }
        <div className="max-h-sidebarHeight overflow-scroll space-y-5">
          {Array.isArray(accessSidebarItems) &&
            accessSidebarItems?.map((item) => <SidebarItem key={item.name} item={item} hideSidebar={hideSidebar} />)}
        </div>
      </div>
    </div>
  )
}

export default Sidebar
