import { useNavigate } from "react-router-dom";

import Avatar from "components/Avatar";
import Icon from "components/Icon";
import { useSelector } from "react-redux";
import { getStrapiMedia } from "utils/media";
import Button from "../Button"
import { JWT_TOKEN, BRANCH } from "../../constants/Authentication"
import { isMobile } from "react-device-detect";

const getBranchDisplayLabel = () => {
  const branch = localStorage.getItem(BRANCH);
  switch (branch) {
    case "q7":
      return "CHI NHÁNH QUẬN 7";
      break;
    case "q2":
      return "CHI NHÁNH QUẬN 2";
      break;
    case "binhduong":
      return "CHI NHÁNH BÌNH DƯƠNG";
      break;
  }
}

const changeBranch = (b) => {
  localStorage.setItem(BRANCH, b);
  window.location.reload();
}

const Header = ({ title, parentUrl }) => {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.currentUser);

  if (!title) return null;

  const logout = () => {
    localStorage.removeItem(JWT_TOKEN);
    navigate('/login')
  }

  return (
    <header className="flex sm:block items-center justify-between p-2 lg:flex-col flex-row shadow-lg mb-2">
      <div className="flex items-center">
        {!!parentUrl && (
          <button
            className="flex justify-center items-center w-10 h-10 bg-gray2 rounded-full mr-6"
            onClick={() => navigate(parentUrl)}
          >
            <Icon name="arrows/circle-left" className="fill-primary" />
          </button>
        )}
        <span className="text-30 sm:text-20 text-primary font-bold">{title}</span>
      </div>
      {
        currentUser && !isMobile && 
        <div className="flex items-center gap-x-2">
          <div className="">

            <div className="dropdown inline-block relative w-[270px]">
              <button className="bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded inline-flex items-center">
                <span className="mr-1">{getBranchDisplayLabel()}</span>
                <svg className="fill-current h-4 w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /> </svg>
              </button>
              <ul className="dropdown-menu absolute hidden text-gray-700 py-2 bg-gray z-50">
                <li className="" onClick={() => changeBranch("q7")}><button onClick={() => changeBranch("q7")} className="rounded-t bg-gray-200 hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap">CHI NHÁNH QUẬN 7</button></li>
                <li className="" onClick={() => changeBranch("q2")}><button className="bg-gray-200 hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap">CHI NHÁNH QUẬN 2</button></li>
                <li className="" onClick={() => changeBranch("binhduong")}><button className="rounded-b bg-gray-200 hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap">CHI NHÁNH BÌNH DƯƠNG</button></li>
              </ul>
            </div>

          </div>
          <a shape="circle" className="bg-transparent  text-[green]" onClick={() => navigate("/settings")}>
          {/* <Avatar
            size={40}
            round
            name={`${currentUser?.firstName} ${currentUser?.lastName}`}
            src={
              currentUser?.avatar && getStrapiMedia({ url: currentUser.avatar })
            }
          /> */}
          <pre>{" " + currentUser?.patient?.full_name + " (" + currentUser?.role.type + ")  "}</pre>
          </a>
          <Button shape="circle" className="bg-transparent" onClick={() => logout()}>
            <Icon name="logout-circle" />
          </Button>
        </div>
      }
    </header>
  );
};

export default Header;
