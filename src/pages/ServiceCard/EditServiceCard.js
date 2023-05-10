import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import Page from "components/Page"
import ServiceCardForm from "./components/ServiceCardForm"
import { getCardById } from "services/api/card"
import { formatStrapiArr, formatStrapiObj } from "utils/strapi"

const EditServiceCard = () => {
  const { id } = useParams()
  const [serviceCardData, setServiceCardData] = useState()

  useEffect(() => {
    ;(async () => {
      try {
        const res = await getCardById(id)
        if (res.data) {
          const card = formatStrapiObj(res.data)
          if (card) {
            setServiceCardData({
              ...card,
              user: formatStrapiObj(card.user),
              staff: formatStrapiObj(card.staff),
              service: formatStrapiObj(card.service),
              transactions: formatStrapiArr(card.transactions),
            })
          }
        }
      } catch (error) {
      } finally {
      }
    })()
  }, [id])

  return (
    <Page title="Service Card Management">
      <p className="text-16 font-bold">Edit Service Card</p>
      <div className="bg-form mt-4 rounded-t-2xl p-6">
        {serviceCardData && <ServiceCardForm data={serviceCardData} />}
      </div>
    </Page>
  )
}

export default EditServiceCard
