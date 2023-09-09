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
import { getListConversationQueues } from "services/api/conversationQueue"
import ChatBot from 'react-simple-chatbot';
import { ThemeProvider } from 'styled-components';

const steps = [
	{
		id: '1',
		message: 'What number I am thinking?',
		trigger: '2',
	},
	{
		id: '2',
		options: [
			{ value: 1, label: 'Number 1', trigger: '4' },
			{ value: 2, label: 'Number 2', trigger: '3' },
			{ value: 3, label: 'Number 3', trigger: '3' },
		],
	},
	{
		id: '3',
		message: 'Wrong answer, try again.',
		trigger: '2',
	},
	{
		id: '4',
		message: 'Awesome! You are a telepath!',
		end: true,
	},
];

// all available props
const theme = {
	background: '#f5f8fb',
	fontFamily: 'Helvetica Neue',
	headerBgColor: '#426044',
	headerFontColor: '#fff',
	headerFontSize: '15px',
	botBubbleColor: '#426044',
	botFontColor: '#fff',
	userBubbleColor: '#fff',
	userFontColor: '#4a4a4a',
};

const Dashboard = () => {
	const [dashboardData, setDashboardData] = useState([]);
	const [conversationQueueCnt, setConversationQueueCnt] = useState(0);

	useEffect(() => {
		(async () => {
			try {
				console.log('load')
				const allResponses = await Promise.all([
					countNewBookings(),
					countNewOrders(),
					// getTotalRevenue(),
					// countNewConversationQueues(),
				]);
				setDashboardData(allResponses?.map((response) => response.data));
				console.log('load')
				const res = await getListConversationQueues(
					{
						pageSize: 10,
						page: 0 + 1,
					},
					{},
					"preview"
				)
				console.log('resss', res)
				if (res.data) {
					setConversationQueueCnt(res?.data?.meta?.pagination?.total);
				}

			} catch (error) { }
		})();
	}, []);

	return (
		<Page title="Bảng thông tin" rightContent={<LatestBookings />}>
			<div className="rounded-t-2xl">
				<div className="grid grid-cols-2 sm:block grid-flow-col gap-x-4">
					<div className="rounded-xl shadow-sm p-4">
						<AnalysItem
							iconName="calendar-tick"
							title="Lịch đặt hẹn mới"
							value={dashboardData?.[0] || 0}
						/>
					</div>
					<div className="rounded-xl shadow-sm p-4">
						<AnalysItem
							iconName="calendar-tick"
							title="Yêu cầu hội thoại mới"
							value={conversationQueueCnt || 0}
						/>
					</div>
					{/* <div className="rounded-xl shadow-sm p-4">
						<AnalysItem iconName="box-tick" title="Đơn hàng mới" value={dashboardData?.[1] || 0} />
					</div>
					<div className="rounded-xl shadow-sm p-4">
						<AnalysItem
							iconName="coin"
							title="Doanh thu"
							value={`${abbreviateNumber(dashboardData?.[2]?.[0]?.total || 0)}`}
							valueClassName="text-pink"
						/>
					</div> */}
				</div>
				<CustomerAnalytics />
				<div className="mt-4 flex items-start space-x-4 sm:block">
					<ThemeProvider theme={theme} >
						<ChatBot steps={steps} headerTitle="ECHO MEDI" />
					</ThemeProvider>
					<CheckinAnalytics />
					<TreatementAnalytics className="w-fit" />
				</div>
			</div>
		</Page>
	);
};

export default Dashboard;
