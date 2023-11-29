import Header from "components/Header";
import { isMobile } from "react-device-detect"

const Page = ({
  title,
  parentUrl,
  children,
  rightContent,
  className = "",
  rightContentClassName = "",
  contentClassName = "",
}) => {
  return (
    <div className="flex flex-col h-screen">
      <Header title={title} parentUrl={parentUrl}/>
      <div className={`sm:block flex sm:p-0 flex-1 ml-2 sm:ml-0 ${!isMobile && 'overflow-y-auto'} ${className}`} id="pageContent">
        <div className={`flex-1 pr-1 pl-1 w-[100vw] ${contentClassName}`}>
          {children}
        </div>
        {rightContent && (
          <div className={`px-2 ${isMobile ? 'w-full' : 'w-79'} ${rightContentClassName}`}>
            {rightContent}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
