import Drawer from "components/Drawer"
import Button from "components/Button"
import UploadImage from "components/UploadImage"

const AddNewAssetDrawer = ({ openDrawer, multiple = false, onClose, onFinish }) => {
  return (
    <Drawer open={openDrawer} onClose={onClose}>
      <h4 className="text-18 font-bold">Add New Media</h4>
      <div className="my-6">
        <UploadImage multiple={multiple} clearUpload={openDrawer} onFinish={onFinish} />
      </div>
      <div className="flex items-center space-x-4 mt-10">
        <Button btnType="outline" onClick={onClose}>Cancel</Button>
      </div>
    </Drawer>
  )
}

export default AddNewAssetDrawer
