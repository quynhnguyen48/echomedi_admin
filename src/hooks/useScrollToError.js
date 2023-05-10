import { useEffect } from "react"

export const useScrollToError = (errors) => {
  useEffect(() => {
    let error = Object.values(errors)?.[0]
    if (error && !error.type) {
      error = Object.values(error)?.[0]
    }
    if (error?.ref?.name) {
      const element = document.getElementsByName(error?.ref?.name)?.[0]
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }, [errors])
}
