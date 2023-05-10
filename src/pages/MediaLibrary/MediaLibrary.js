import { useEffect, useState } from "react";

import AddNewAssetDrawer from "components/AddNewAssetDrawer";
import AssetItem from "components/AssetItem";
import Button from "components/Button";
import Icon from "components/Icon";
import Loading from "components/Loading";
import Page from "components/Page";
import { getMediaLibrary } from "services/api/mediaLibrary";
import AssetDetailDrawer from "./Components/AssetDetailDrawer";

const MediaLibrary = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [assets, setAssets] = useState([]);
  const [visibleAssetDetailDrawer, setVisibleAssetDetailDrawer] =
    useState(false);
  const [visibleAddNewAssetDrawer, setVisibleAddNewAssetDrawer] =
    useState(false);
  const [assetSelected, setAssetSelected] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        setAssetSelected([]);
        const mediaRes = await getMediaLibrary();
        if (mediaRes) {
          setAssets(mediaRes.data);
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleClickAsset = (asset) => {
    setVisibleAssetDetailDrawer(true);
    setAssetSelected(asset);
  };

  const onDeleteSuccess = (id) => {
    setAssetSelected([]);
    setAssets((assetItems) => assetItems?.filter((item) => item.id !== id));
  };

  const onUpdateSuccess = (id, payload) => {
    setAssetSelected([]);
    const index = assets?.findIndex((asset) => asset.id === id);

    setAssets((assetItems) => {
      assetItems[index] = payload;
      return assetItems;
    });
  };

  const onUploadSuccess = (payload = []) => {
    setAssets((assetItems) => [...payload, ...assetItems]);
    setVisibleAddNewAssetDrawer(false);
  };

  if (isLoading)
    return (
      <Page title="Media Library">
        <p className="text-16 font-bold">Image Library</p>
        <div className="flex justify-center">
          <Loading className="!border-primary border-2 w-10 h-10" />
        </div>
      </Page>
    );

  return (
    <Page title="Media Library">
      <p className="text-16 font-bold">Image Library</p>
      <div className="bg-form mt-4 rounded-t-2xl p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <p className="text-32">
            <b className="text-primary">{assets.length}</b> Assets
          </p>
          <Button
            icon={<Icon name="add-circle" className="fill-white" />}
            onClick={() => setVisibleAddNewAssetDrawer(true)}
          >
            Add New Asset
          </Button>
        </div>
        <div className="grid grid-cols-media gap-4">
          {assets.map((asset) => (
            <AssetItem
              key={asset.id}
              asset={asset}
              onClick={() => handleClickAsset(asset)}
            />
          ))}
        </div>
      </div>

      <AssetDetailDrawer
        openDrawer={visibleAssetDetailDrawer}
        onClose={() => setVisibleAssetDetailDrawer(false)}
        asset={assetSelected}
        onDeleteSuccess={onDeleteSuccess}
        onUpdateSuccess={onUpdateSuccess}
      />

      <AddNewAssetDrawer
        multiple={true}
        openDrawer={visibleAddNewAssetDrawer}
        onClose={() => setVisibleAddNewAssetDrawer(false)}
        onFinish={onUploadSuccess}
      />
    </Page>
  );
};

export default MediaLibrary;
