import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import classNames from "classnames";
import Button from "components/Button";
import Icon from "components/Icon";
import Page from "components/Page";
import SearchInput from "components/SearchInput";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

import { CARD_TYPE } from "constants/Card";
import { getListCards, updateCard } from "services/api/card";
import { resetPageIndex } from "slice/tableSlice";
import { getErrorMessage } from "utils/error";
import { formatStrapiArr, formatStrapiObj } from "utils/strapi";
import ServiceCardAnalytics from "./components/ServiceCardAnalytics";
import ServiceCardTable from "./components/ServiceCardTable";
import ServiceCardDetail from "./ServiceCardDetail";

const ServiceCard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [detailData, setDetailData] = useState();
  const [searchKey, setSearchKey] = useState();
  const fetchIdRef = useRef(0);

  const fetchData = useCallback(
    async ({ pageSize, pageIndex }) => {
      const fetchId = ++fetchIdRef.current;
      if (fetchId === fetchIdRef.current) {
        try {
          setLoading(true);
          let filters = {
            type: {
              $eq: CARD_TYPE.SERVICE_CARD,
            },
          };
          if (searchKey?.length) {
            setDetailData(null);
            filters = {
              ...filters,
              $or: [
                {
                  user: {
                    lastName: { $containsi: searchKey },
                  },
                },
                {
                  user: {
                    firstName: { $containsi: searchKey },
                  },
                },
                {
                  user: {
                    email: { $containsi: searchKey },
                  },
                },
                {
                  user: {
                    code: { $containsi: searchKey },
                  },
                },
                {
                  code: { $containsi: searchKey },
                },
              ],
            };
          }
          const res = await getListCards(
            {
              pageSize: 10,
              page: pageIndex + 1,
            },
            filters
          );
          if (res.data) {
            const listCards = formatStrapiArr(res.data);
            setData(
              listCards?.map((card) => ({
                ...card,
                user: formatStrapiObj(card.user),
                staff: formatStrapiObj(card.staff),
                service: formatStrapiObj(card.service),
                transactions: formatStrapiArr(card.transactions),
              }))
            );
            setPageCount(res?.data?.meta?.pagination?.pageCount);
          }
        } catch (error) {
        } finally {
          setLoading(false);
        }
      }
    },
    [searchKey]
  );

  const updateStatus = useCallback(
    async (status) => {
      try {
        await updateCard(detailData?.id, {
          status,
        });
        setDetailData((card) => ({
          ...card,
          status,
        }));
        setData((listCards) => {
          const index = listCards?.findIndex(
            (card) => card.id === detailData?.id
          );
          if (index > -1) {
            listCards[index].status = status;
          }
          return listCards;
        });
        toast.success(`Updated card status successfully!`);
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    },
    [detailData?.id]
  );

  return (
    <Page
      title="Service Card Management"
      rightContent={detailData && <ServiceCardAnalytics data={detailData} />}
    >
      <div className="w-full flex items-center gap-x-9">
        <SearchInput
          placeholder="Search by Card ID / User ID / User email / User name"
          className="flex-1"
          onSearch={(value) => {
            dispatch(resetPageIndex());
            setSearchKey(value);
          }}
        />
        <Button
          icon={<Icon name="add-circle" className="fill-white" />}
          onClick={() => navigate("/service-card/create")}
        >
          Create New Card
        </Button>
      </div>
      <div
        className={classNames({
          "w-full": !detailData,
          "flex gap-x-6": detailData,
        })}
      >
        <ServiceCardTable
          data={data}
          loading={loading}
          pageCount={pageCount}
          activeRow={detailData}
          fetchData={fetchData}
          onClickRow={setDetailData}
        />
        {detailData && (
          <ServiceCardDetail data={detailData} updateStatus={updateStatus} />
        )}
      </div>
    </Page>
  );
};

export default ServiceCard;
