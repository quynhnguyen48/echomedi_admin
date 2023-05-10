import DataItem from "components/DataItem";
import Drawer from "components/Drawer";
import { getStrapiMedia } from "utils/media";

const ProductImages = ({ openDrawer, onClose, images }) => {
  return (
    <Drawer open={openDrawer} onClose={onClose}>
      <DataItem
        icon="gallery"
        title="Product Images"
        value={`${images?.length} image(s)`}
      />
      {/* <div className="grid grid-cols-2 w-full h-full">
        {images?.map((item, index) => {
          return (
            <div key={index} className="h-70 w-70">
              <img alt="images" src={getStrapiMedia({ url: item.url })} />
            </div>
          );
        })}
      </div> */}
    </Drawer>
  );
};

export default ProductImages;
