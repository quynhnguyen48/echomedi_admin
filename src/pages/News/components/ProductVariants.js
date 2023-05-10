import DataItem from "components/DataItem";
import Drawer from "components/Drawer";
import VariantItem from "./VariantItem";

const ProductVariants = ({ openDrawer, onClose, variants }) => {
  return (
    <Drawer open={openDrawer} onClose={onClose}>
      <DataItem
        icon="gallery"
        title="Variants"
        value={`${variants?.length} variants`}
      />
      <div className="mt-6">
        {variants?.map((variant, index) => {
          return <VariantItem key={index} variant={variant} />;
        })}
      </div>
    </Drawer>
  );
};

export default ProductVariants;
