import { useState, useCallback, useEffect } from "react";

import Page from "components/Page";
import Button from "components/Button";
import Icon from "components/Icon";
import TreatmentCategoryItem from "./components/TreatmentCategoryItem";
import TreatmentCategoryForm from "./components/TreatmentCategoryForm";
import { formatStrapiArr, formatStrapiObj } from "utils/strapi";
import {
  createTreatmentCategory,
  deleteTreatmentCategory,
  getTreatmentCategories,
  updateTreatmentCategory,
} from "services/api/treatmentCagegory";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../utils/error";
import cloneDeep from "lodash/cloneDeep";

const TreatmentCategory = () => {
  const [loading, setLoading] = useState(false);
  const [showTreatmentCategoryForm, setShowTreatmentCategoryForm] =
    useState(false);
  const [treatmentCategoryData, setTreatmentCategoryData] = useState(null);
  const [treatmentCategories, setTreatmentCategories] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const treatmentCategoriesRes = await getTreatmentCategories();
        let treatmentCategoriesFormatted = formatStrapiArr(
          treatmentCategoriesRes.data
        );
        treatmentCategoriesFormatted = treatmentCategoriesFormatted.map(
          (category) => ({
            ...category,
            image: formatStrapiObj(category.image),
          })
        );
        setTreatmentCategories(treatmentCategoriesFormatted);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const upsertTreatmentCategory = useCallback(
    async (formData) => {
      try {
        let res;
        if (!!treatmentCategoryData?.id) {
          res = await updateTreatmentCategory(
            treatmentCategoryData.id,
            formData
          );
          toast.success("Treatment category updated successfully!");
        } else {
          res = await createTreatmentCategory(formData);
          toast.success("Treatment category created successfully!");
        }
        let updatedData = formatStrapiObj(res.data);
        updatedData = {
          ...updatedData,
          image: formatStrapiObj(updatedData.image),
        };

        setTreatmentCategories((oldCategories) => {
          let newCategories = cloneDeep(oldCategories);
          const pos = newCategories.findIndex((c) => c.id === updatedData.id);
          if (pos > -1) {
            newCategories[pos] = updatedData;
          } else {
            newCategories.push(updatedData);
          }
          return newCategories;
        });
        setShowTreatmentCategoryForm(false);
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    },
    [treatmentCategoryData?.id]
  );

  const handleDeleteCategory = useCallback(async (category) => {
    try {
      await deleteTreatmentCategory(category.id);
      setTreatmentCategories((oldCategories) => {
        let newCategories = cloneDeep(oldCategories);
        const pos = newCategories.findIndex((c) => c.id === category.id);
        if (pos > -1) {
          newCategories.splice(pos, 1);
        }
        return newCategories;
      });
      toast.success("Treatment Category removed successfully!");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }, []);

  return (
    <Page title="Treatment Category Management" contentClassName="!pb-0">
      <p className="text-16 font-bold">Treatment Category</p>
      <div
        className="bg-form mt-4 rounded-t-2xl p-6 overflow-y-auto"
        style={{ height: "calc(100vh - 166px)" }}
      >
        <div className="flex items-center justify-between">
          <p className="text-32">
            <span className="text-primary font-bold">
              {treatmentCategories?.length || 0}
            </span>{" "}
            Categories
          </p>
          <Button
            icon={<Icon name="add-circle" className="fill-white" />}
            onClick={() => {
              setTreatmentCategoryData(null);
              setShowTreatmentCategoryForm(true);
            }}
          >
            Add New Category
          </Button>
        </div>
        <div className="mt-6 grid grid-cols-4 grid-flow-row gap-6">
          {treatmentCategories?.map((category) => (
            <TreatmentCategoryItem
              key={category?.id}
              category={category}
              onEdit={() => {
                setTreatmentCategoryData(category);
                setShowTreatmentCategoryForm(true);
              }}
              onDelete={() => handleDeleteCategory(category)}
            />
          ))}
        </div>
        <TreatmentCategoryForm
          category={treatmentCategoryData}
          openDrawer={showTreatmentCategoryForm}
          onClose={() => {
            setTreatmentCategoryData(null);
            setShowTreatmentCategoryForm(false);
          }}
          onFinish={upsertTreatmentCategory}
        />
      </div>
    </Page>
  );
};

export default TreatmentCategory;
