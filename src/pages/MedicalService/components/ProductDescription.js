import DataItem from "components/DataItem";
import Drawer from "components/Drawer";
import DataItemDescription from "./DataItemDescription";
import { getStrapiMedia } from "utils/media";

const ProductDescription = ({ openDrawer, onClose, detail }) => {
  return (
    <Drawer open={openDrawer} onClose={onClose}>
      <DataItem
        icon="menu-board"
        title="Product Description"
        value="Short Description, Description, Benefits & Ingredients"
        valueClassName="text-18"
      />
      <div className="flex mt-6 flex-col w-full h-full space-y-4">
        {detail?.shortDescription && (
          <DataItemDescription
            title="Short Description"
            content={detail?.shortDescription}
          />
        )}
        {detail?.benefit && (
          <DataItemDescription title="Benefit" content={detail?.benefit} />
        )}
        {detail?.ingredients && (
          <DataItemDescription
            title="Ingredients"
            content={detail?.ingredients}
          />
        )}
        {detail?.description && (
          <DataItemDescription
            title="Description"
            content={detail?.description}
          />
        )}
        {detail?.images?.[0].url && (
          <img
            alt="images"
            src={getStrapiMedia({ url: detail?.images?.[0].url })}
          />
        )}
      </div>
    </Drawer>
  );
};

export default ProductDescription;
