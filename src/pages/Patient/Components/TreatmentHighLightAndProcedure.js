import ReactMarkdown from "react-markdown"

import DataItem from "components/DataItem"
import Drawer from "components/Drawer"
import MultiLanguagesItem from "components/MultiLanguage/MultiLanguagesItem"

const TreatmentHighLightAndProcedure = ({ openDrawer, onClose, data = {} }) => {
  return (
    <Drawer open={openDrawer} onClose={onClose}>
      <DataItem
        icon="save"
        title="Treatment Detail"
        valueClassName="text-18"
        value="Highlight & Procedure"
      />
      <div className="mt-6 space-y-4">
        <p className="font-bold">Highlight</p>
        <div className="flex gap-x-4">
          <span className="text-primary font-bold w-22">EN</span>
          <ReactMarkdown className="markdown">{data?.highlight?.en}</ReactMarkdown>
        </div>
        <div className="flex gap-x-4">
          <span className="text-primary font-bold w-22">VI</span>
          <ReactMarkdown className="markdown">{data?.highlight?.vi}</ReactMarkdown>
        </div>
      </div>
      <div className="mt-6">
        <p className="font-bold">Procedure</p>
        {data?.procedure?.map((item, index) => {
          return (
            <MultiLanguagesItem
              key={index}
              titleClassName="w-22"
              languagePack={[
                { title: `Step ${index + 1} / EN`, detail: item?.en },
                { title: `Step ${index + 1} / VN`, detail: item?.vi },
              ]}
            />
          )
        })}
      </div>
    </Drawer>
  )
}

export default TreatmentHighLightAndProcedure
