import Page from "components/Page";
import { useNavigate } from "react-router-dom";

import Button from "components/Button";
import Icon from "components/Icon";

const WebsiteContent = () => {
  const navigate = useNavigate();
  return (
    <Page title="Content Management">
      <div className="grid grid-cols-4 gap-6">
        <Button
          btnSize="auto"
          className="w-full py-8 bg-gray2 flex flex-col rounded-xl"
          onClick={() => navigate(`/banner`)}
        >
          <div className="flex flex-col items-center">
            <Icon name="website-content/banner" className="fill-primary" />
            <span className=" text-primary text-24 font-bold mt-3">Banner</span>
          </div>{" "}
        </Button>
        <Button
          btnSize="auto"
          className="w-full py-6 bg-gray2 flex flex-col rounded-xl"
          onClick={() => navigate(`/about`)}
        >
          <div className="flex flex-col items-center">
            <Icon name="website-content/about" className="fill-primary" />
            <span className=" text-primary text-24 font-bold mt-3">About</span>
          </div>
        </Button>
        <Button
          btnSize="auto"
          className="w-full py-6 bg-gray2 flex flex-col rounded-xl"
          onClick={() => navigate(`/privacy`)}
        >
          <div className="flex flex-col items-center">
            <Icon name="website-content/privacy" className="fill-primary" />
            <span className=" text-primary text-24 font-bold mt-3">
              Privacy
            </span>
          </div>
        </Button>
        <Button
          btnSize="auto"
          className="w-full py-6 bg-gray2 flex flex-col rounded-xl"
          onClick={() => navigate(`/terms`)}
        >
          <div className="flex flex-col items-center">
            <Icon name="website-content/terms" className="fill-primary" />
            <span className=" text-primary text-24 font-bold mt-3">Terms</span>
          </div>
        </Button>
        <Button
          btnSize="auto"
          className="w-full py-6 bg-gray2 flex flex-col rounded-xl"
          onClick={() => navigate(`/faqs`)}
        >
          <div className="flex flex-col items-center">
            <Icon name="website-content/faq" className="fill-primary" />
            <span className=" text-primary text-24 font-bold mt-3">FAQ</span>
          </div>
        </Button>
      </div>
    </Page>
  );
};

export default WebsiteContent;
