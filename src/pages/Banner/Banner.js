import cloneDeep from "lodash/cloneDeep";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

import Button from "components/Button";
import ChooseAssetsFromLibraryDrawer from "components/ChooseAssetsFromLibraryDrawer";
import Icon from "components/Icon";
import Page from "components/Page";
import { getBanner, updateBanner } from "services/api/singleTypes";
import { getErrorMessage } from "utils/error";
import { formatStrapiArr, formatStrapiObj } from "utils/strapi";
import BannerItem from "./components/BannerItem";

const Banner = () => {
  const [
    visibleChooseAssetsFromLibraryDrawer,
    setVisibleChooseAssetsFromLibraryDrawer,
  ] = useState(false);
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getBanner();
        if (res.data) {
          const bannersFormatted = formatStrapiObj(res.data);
          setBanner({
            ...bannersFormatted,
            images: formatStrapiArr(bannersFormatted?.images) || [],
          });
        }
      } catch (error) {
        // toast.error(getErrorMessage(error));
      } finally {
      }
    })();
  }, []);

  const handleRemove = useCallback(
    async (image) => {
      try {
        const newBanner = cloneDeep(banner);
        const imagePos = newBanner?.images?.findIndex(
          (item) => item.id === image.id
        );
        newBanner?.images?.splice(imagePos, 1);
        setBanner(newBanner);
        await updateBanner(newBanner);
        toast.success("Banner item removed successfully!");
      } catch (error) {
        // toast.error(getErrorMessage(error));
      }
    },
    [banner]
  );

  const handleAssetsSelected = useCallback(
    async (assets) => {
      try {
        const newBanner = cloneDeep(banner);
        newBanner.images = [...newBanner?.images, ...assets];
        setBanner(newBanner);
        await updateBanner(newBanner);
        toast.success("Banner item added successfully!");
      } catch (error) {
        // toast.error(getErrorMessage(error));
      }
    },
    [banner]
  );

  return (
    <Page title="Banner Management">
      <p className="font-bold mb-4">Banner Advertising</p>
      <div className="p-6 w-full bg-form rounded-2xl">
        <div className="w-full flex items-center justify-between">
          <span className="text-primary font-bold text-32">
            {banner?.images?.length || 0}
            <span className="text-32 ml-2 text-secondary font-normal">{`Banners`}</span>
          </span>
          <Button
            icon={<Icon name="add-circle" className="fill-white" />}
            onClick={() => setVisibleChooseAssetsFromLibraryDrawer(true)}
          >
            Add New Banner
          </Button>
        </div>
        <div className="flex flex-wrap gap-6 mt-6">
          {!!banner?.images?.length &&
            banner?.images?.map((banner) => {
              return (
                <BannerItem
                  key={banner.id}
                  item={banner}
                  className="cursor-pointer"
                  onDelete={() => handleRemove(banner)}
                />
              );
            })}
        </div>
        <ChooseAssetsFromLibraryDrawer
          multiple
          openDrawer={visibleChooseAssetsFromLibraryDrawer}
          onClose={() => setVisibleChooseAssetsFromLibraryDrawer(false)}
          onFinish={handleAssetsSelected}
        />
      </div>
    </Page>
  );
};

export default Banner;
