import Header from "components/Header";

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
      <div className={`sm:block flex sm:p-0 px-6 flex-1 overflow-y-auto ${className}`} id="pageContent">
        <div className={`flex-1 sm:p-0 pb-6 pr-6 w-[100vw] ${contentClassName}`}>
          {children}
        </div>
        {rightContent && (
          <div className={`w-79 ${rightContentClassName}`}>
            {rightContent}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
