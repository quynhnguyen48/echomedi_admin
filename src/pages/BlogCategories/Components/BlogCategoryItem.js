import classNames from "classnames";

import Button from "components/Button";
import Icon from "components/Icon";
import Tag from "components/Tag";
import { CATEGORY_STATUS } from "constants/Category";

const BlogCategoryItem = ({ category, onEdit, onDelete }) => {
  return (
    <div className="relative flex flex-col items-center justify-between bg-white rounded-xl px-4 py-6">
      <div className="absolute right-4 top-4 space-y-2">
        <Button
          type="button"
          btnSize="auto"
          className="w-10 h-10 bg-red"
          shape="circle"
          onClick={onDelete}
        >
          <Icon name="trash" className="fill-white w-6"/>
        </Button>
        <Button
          type="button"
          btnSize="auto"
          className="w-10 h-10 bg-primary"
          shape="circle"
          onClick={() => onEdit(category)}
        >
          <Icon name="edit" className="fill-white w-6"/>
        </Button>
      </div>
      <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
        <Icon name="bubble" className="fill-white w-12 h-12" />
      </div>
      <p className="font-bold mt-4 text-center">{category?.name}</p>
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

export default BlogCategoryItem;
