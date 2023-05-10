import { useEffect, useState } from "react";
import { isMobile } from "react-device-detect"
import { useNavigate } from "react-router-dom"

import { countNewBookings } from "services/api/bookings";
import { countNewOrders } from "services/api/orders";
import { getTotalRevenue } from "services/api/transactions";
import { abbreviateNumber } from "utils/number";
import Page from "components/Page";
import AnalysItem from "./AnalysItem";
import CheckinAnalytics from "./CheckinAnalytics";
import CustomerAnalytics from "./CustomerAnalytics";
import LatestBookings from "./LatestBookings";
import TreatementAnalytics from "./TreatementAnalytics";
import axios from "axios";

const Dashboard = () => {
	const [dashboardData, setDashboardData] = useState([]);

	useEffect(() => {
		(async () => {
			try {
				const allResponses = await Promise.all([
					countNewBookings(),
					countNewOrders(),
					getTotalRevenue(),
				]);
				setDashboardData(allResponses?.map((response) => response.data));
			} catch (error) {}
		})();
	}, []);

	return (
		<Page title="Bảng thông tin" rightContent={<LatestBookings />}>
			<div className="mt-4 p-6 bg-form rounded-t-2xl">
				<div className="grid grid-cols-3 grid-flow-col gap-x-4">
					<div className="rounded-xl shadow-sm p-4">
						<AnalysItem
							iconName="calendar-tick"
							title="Lịch đặt hẹn mới"
							value={dashboardData?.[0] || 0}
						/>
					</div>
					<div className="rounded-xl shadow-sm p-4">
						<AnalysItem iconName="box-tick" title="Đơn hàng mới" value={dashboardData?.[1] || 0} />
					</div>
					<div className="rounded-xl shadow-sm p-4">
						<AnalysItem
							iconName="coin"
							title="Doanh thu"
							value={`${abbreviateNumber(dashboardData?.[2]?.[0]?.total || 0)}`}
							valueClassName="text-pink"
						/>
					</div>
				</div>
				<CustomerAnalytics />
				<div className="mt-4 flex items-start space-x-4">
					<CheckinAnalytics className="w-[58%]" />
					<TreatementAnalytics className="w-fit" />
					<button onClick={e => {
						// curl --request POST --url 'https://api.github.com/repos/quynhnguyen48/em_web/dispatches' --header 'authorization: Bearer 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' --data '{"event_type": "hello"}'
						axios.post("https://api.github.com/repos/quynhnguyen48/em_web/dispatches", {event_type: "hello"}, {headers: {
							"Authorization" : "Bearer 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",
						}}).then(response => {
							alert("Đang build vui lòng đợi 3-5 phút")
						})
					}}>Build</button>
				</div>
			</div>
		</Page>
	);
};

export default Dashboard;
