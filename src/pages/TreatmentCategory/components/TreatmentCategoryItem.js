import classNames from "classnames";

import Button from "components/Button";
import Icon from "components/Icon";
import Tag from "components/Tag";
import { CATEGORY_STATUS } from "constants/Category";
import { getStrapiMedia } from "utils/media";
import Avatar from "../../../components/Avatar"

const TreatmentCategoryItem = ({ category, onEdit, onDelete }) => {
  return (
    <div className="relative flex flex-col items-center justify-between bg-white rounded-xl px-4 py-6">
      <div className="absolute right-4 top-4 space-y-2">
        <Button
          type="button"
          btnSize="auto"
          className="bg-red w-10 h-10"
          shape="circle"
          onClick={onDelete}
        >
          <Icon name="trash" className="fill-white"/>
        </Button>
        <Button
          type="button"
          btnSize="auto"
          className="bg-primary w-10 h-10"
          shape="circle"
          onClick={onEdit}
        >
          <Icon name="edit" className="fill-white"/>
        </Button>
      </div>
      <div>
        <Avatar
          size={80}
          src={category?.image?.id && getStrapiMedia(category?.image)}
          name={category?.title?.en}
        />
        <p className="font-bold mt-4 text-center">{category?.name?.en}</p>
        <p className="mt-2 text-12 text-center">{category?.code}</p>
      </div>
      <div className="text-center">
        <p className="text-12 text-center">{category?.slug}</p>
        <Tag
          name={
            category?.publishedAt
              ? CATEGORY_STATUS.PUBLISHED
              : CATEGORY_STATUS.UNPUBLISHED
          }
          className={classNames("rounded-lg mt-4", {
            "bg-green": category?.publishedAt,
            "bg-red": !category?.publishedAt,
          })}
        />
      </div>
    </div>
  );
};

export default TreatmentCategoryItem;
