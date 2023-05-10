import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

import Button from "components/Button";
import Drawer from "components/Drawer";
import Icon from "components/Icon";
import Input from "components/Input";
import { deleteMediaFile, updateMediaFile } from "services/api/mediaLibrary";
import { getErrorMessage } from "utils/error";
import { getStrapiMedia } from "utils/media";

const AssetDetailDrawer = ({
  openDrawer,
  onClose,
  asset,
  onDeleteSuccess,
  onUpdateSuccess,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [assetName, setAssetName] = useState("");
  const [assetData, setAssetData] = useState("");
  const [fileUploaded, setFileUploaded] = useState(null);

  const handleUpdate = useCallback(async () => {
    const formData = new FormData();
    if (fileUploaded) {
      formData.append("files", fileUploaded);
    }
    formData.append(
      "fileInfo",
      JSON.stringify({
        name: assetName,
      })
    );

    try {
      setIsSaving(true);
      const res = await updateMediaFile(asset?.id, formData);
      if (res) {
        toast.success("Updated successfully");
        onUpdateSuccess(asset?.id, res.data);
        onClose();
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }, [asset?.id, assetName, fileUploaded, onClose, onUpdateSuccess]);

  const handleDelete = useCallback(async () => {
    try {
      setIsDeleting(true);
      const res = await deleteMediaFile(asset?.id);
      if (res) {
        toast.success("Deleted successfully");
        onDeleteSuccess(asset?.id);
        onClose();
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  }, [asset?.id, onClose, onDeleteSuccess]);

  useEffect(() => {
    if (asset) {
      setAssetName(asset.name);
      setAssetData(asset);
    }
  }, [asset]);

  return (
    <Drawer open={openDrawer} onClose={onClose}>
      <h4 className="text-18 font-bold">Update Media</h4>
      <div className="my-6">
        <Input
          inputClassName="bg-gray2 mb-6"
          label="Media Title"
          value={assetName}
          onChange={(e) => setAssetName(e.currentTarget.value)}
        />

        {assetData ? (
          <div className="relative w-fit m-auto rounded-xl">
            <button
              type="button"
              className="bg-white rounded-full absolute right-2 top-2"
              onClick={() => setAssetData(null)}
            >
              <Icon name="close-circle" className="fill-red" />
            </button>
            <img src={getStrapiMedia(assetData)} alt={assetName} />
          </div>
        ) : (
          <div className="inline-flex items-center justify-center rounded-xl bg-background h-40 w-40 relative">
            <input
              type="file"
              className="h-full w-full opacity-0 cursor-pointer absolute z-20"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFileUploaded(file);
                  const { name, size } = file;
                  setAssetData({
                    name,
                    size,
                    url: URL.createObjectURL(file),
                  });
                }
              }}
            />
            <Icon name="gallery" className="fill-gray w-6 h-6" />
          </div>
        )}
      </div>
      <div className="flex items-center justify-between mt-10">
        <div className="flex items-center space-x-4">
          <Button
            loading={isSaving}
            disabled={!assetData}
            onClick={handleUpdate}
          >
            Save
          </Button>
          <Button btnType="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
        <Button
          btnType="outline"
          className="border-red text-red"
          onClick={handleDelete}
          loading={isDeleting}
        >
          Delete
        </Button>
      </div>
    </Drawer>
  );
};

export default AssetDetailDrawer;
