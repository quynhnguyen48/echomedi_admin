const GraphTooltip = ({ position, visibility, isChart = true, children }) => {
  return (
    <div
      className={`px-4 py-3.5 z-10 rounded-lg shadow-lg bg-white overflow-hidden transition-all duration-300 hover:!visible w-[300px]
        ${visibility ? "visible" : "invisible"} ${isChart ? 'absolute' : 'fixed'}
      `}
      style={{
        top: position?.top,
        left: position?.left,
      }}
    >
      {children}
    </div>
  );
};

export default GraphTooltip
