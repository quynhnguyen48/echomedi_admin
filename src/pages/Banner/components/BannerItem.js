import Button from "components/Button";
import Icon from "components/Icon";

import { getStrapiMedia } from "utils/media";

const BannerItem = ({ item, onDelete }) => {
  return (
    <div className="relative w-81 h-55 rounded-xl overflow-hidden">
      <div className="flex flex-1 justify-end gap-x-2 absolute top-4 right-4">
        <Button onClick={onDelete} className="bg-orange" shape="circle">
          <Icon name="trash" className="fill-white object-cover" />
        </Button>
      </div>
      <img className="h-full" alt="banner" src={getStrapiMedia(item)} />
      <div className="absolute bottom-0 left-0 px-4 py-2 rounded-tr-xl text-center font-bold bg-primary text-white text-14">
        {item?.name}
      </div>
    </div>
  );
};

export default BannerItem;
