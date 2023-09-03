import { useState } from "react";

import Button from "components/Button";
import Datepicker from "components/Datepicker";
import Drawer from "components/Drawer";
import Icon from "components/Icon";
import Input from "components/Input";
import Select from "components/Select";
import Textarea from "components/Textarea";
import PieChart from "components/PieChart";

const Theme = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openDrawer, setOpenDrawer] = useState(false);

  return (
    <div className="space-y-2 px-6 mt-4">
      <div className="flex items-center gap-x-2">
        <Button onClick={() => setOpenDrawer(true)}>OPEN DRAWER</Button>
        <Button btnType="outline">Cancel</Button>
        <Button icon={<Icon name="add-circle" className="fill-white" />}>
          Create New Customer
        </Button>
        <Button btnSize="small">View Detail</Button>
        <Button
          btnSize="auto"
          shape="circle"
          icon={<Icon name="add-circle" className="fill-white" />}
        />
        <Button
          btnSize="auto"
          shape="circle"
          icon={<Icon name="slash" />}
          className="bg-orange"
        />
        <Button
          btnType="text"
          btnSize="auto"
          icon={<Icon name="add-circle" className="fill-primary w-6 h-6" />}
        >
          <span className="text-16 text-primary">Add new step</span>
        </Button>
      </div>
      <div className="bg-form p-6 space-y-2">
        <Input label="Username" placeholder="Enter Username" />
        <Input
          placeholder="Search by Blog ID / Title"
          suffix={<Icon name="search" />}
          inputClassName="rounded-3xl"
          className="w-full max-w-[824px]"
        />
        <Textarea
          label="Blog Content"
          placeholder="Input English Content"
          className="w-full"
          textareaClassName="h-55"
        />
        <Select
          placeholder="Select Role"
          label="Role"
          options={[
            { value: "chocolate", label: "Chocolate" },
            { value: "strawberry", label: "Strawberry" },
            { value: "vanilla", label: "Vanilla" },
          ]}
        />
        <Datepicker
          value={selectedDate}
          label="Date of Birth"
          onChange={setSelectedDate}
        />

        <PieChart
          width={188}
          height={188}
          title="Customer Gender Segments"
          data={[
            { name: "Male", value: 17 },
            { name: "Female", value: 56 },
            { name: "Unknown", value: 27 },
          ]}
          colors={["#27AE60", "#F2C94C", "#EB5757"]}
          hideInfo={false}
        />
      </div>
      <Drawer open={openDrawer} onClose={() => setOpenDrawer(false)}>
        Drawer 1 Drawer 1 Drawer 1 Drawer 1 Drawer 1 Drawer 1 Drawer 1 Drawer 1
        Drawer 1 Drawer 1 Drawer 1 Drawer 1 Drawer 1 Drawer 1 Drawer 1 Drawer 1
      </Drawer>
    </div>
  );
};

export default Theme;
