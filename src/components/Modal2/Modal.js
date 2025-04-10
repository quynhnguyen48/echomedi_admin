import Icon from "components/Icon"

const Modal = ({
  visibleModal,
  wrapperClassName = "",
  contentClassName = "",
  bodyClassName = "",
  children,
  onClose,
  showCloseButton = false,
}) => {
  return (
    <>
      <div
        className={`m-auto px-6 justify-center items-center flex overflow-hidden fixed inset-0 outline-none focus:outline-none transition-all duration-300 w-[940px] sm:w-[100vw] ${wrapperClassName} ${
          visibleModal ? "visible opacity-1 z-[101]" : "invisible opacity-0 z-0"
        }`}
      >
        <div
          className={`relative p-6 md:p-4 rounded-lg shadow-lg overflow-y-auto max-h-[90vh] min-h-[460px] w-full ${contentClassName}`}
        >
          {showCloseButton && (
            <button onClick={onClose} className="absolute top-6 right-6">
              <Icon name="close-circle" className="fill-red" />
            </button>
          )}
          <div className={bodyClassName}>{children}</div>
        </div>
      </div>
      <button
        onClick={onClose}
        className={`fixed inset-0 z-[100] bg-primary/70 transition-all duration-300 ${
          visibleModal ? "visible opacity-1" : "invisible opacity-0"
        }`}
      />
    </>
  )
}

export default Modal
