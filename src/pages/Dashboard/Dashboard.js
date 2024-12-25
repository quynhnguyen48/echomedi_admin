import { useEffect, useState, Component, createRef } from "react";
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
import axios from "../../services/axios";
import { getListConversationQueues } from "services/api/conversationQueue"
import ChatBot, { Loading } from 'react-simple-chatbot';
import { ThemeProvider } from 'styled-components';
import Button from "components/Button"
import classNames from "classnames"
import { BRANCH } from "constants/Authentication"
import { ORDER_STATUS } from "constants/Order";
import Tag from "components/Tag";
import Icon from "components/Icon";

const serviceGroups = ['khong_co_benh', 'than_kinh', 'ho_hap', 'tim_mach', 'than_tiet_nieu', 'co_xuong_khop', 'noi_tiet_chuyen_hoa', 'tieu_hoa'];
const translateServiceGroup = (t) => {
	switch (t) {
		case "khong_co_benh":
			return "Không có bệnh"
			break;
		case "than_kinh":
			return "Thần kinh"
			break;
		case "ho_hap":
			return "Hô hấp"
			break;
		case "tim_mach":
			return "Tim mạch"
			break;
		case "than_tiet_nieu":
			return "Thận tiết niệu"
			break;
		case "co_xuong_khop":
			return "Cơ xương khớp"
			break;
		case "noi_tiet_chuyen_hoa":
			return "Nội tiết chuyển hoá"
			break;
		case "tieu_hoa":
			return "Tiêu hoá"
			break;
	}
}

function numberWithCommas(x) {
	return x?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") ?? '0'
}

const Dashboard = () => {
	const [dashboardData, setDashboardData] = useState([]);
	const [conversationQueueCnt, setConversationQueueCnt] = useState(0);
	const [twilioBalance, setTwilioBalance] = useState('');
	const navigate = useNavigate();

	useEffect(() => {
		(async () => {
			try {
				const allResponses = await Promise.all([
					countNewBookings(),
					countNewOrders(),
					// getTotalRevenue(),
					// countNewConversationQueues(),
				]);
				setDashboardData(allResponses?.map((response) => response.data));
				const res = await getListConversationQueues(
					{
						pageSize: 10,
						page: 0 + 1,
					},
					{},
					"preview"
				)
				if (res.data) {
					setConversationQueueCnt(res?.data?.meta?.pagination?.total);
				}

			} catch (error) { }
		})();

		// const id = toast.loading("Đang tải dữ liệu các dịch vụ");
		axios.get("/conversation-queue/twilioBalance")
			.then(response => {
				console.log('response', response)
				setTwilioBalance(response.data);
			}).finally(() => {
				// toast.dismiss(id);
			});

		let config = {
			theme: 'default',
			callbacks: {
				register: (data) => {
					// Sự kiện xảy ra khi trạng thái kết nối tổng đài thay đổi
					console.log('register:', data);
				},
				connecting: (data) => {
					// Sự kiện xảy ra khi bắt đầu thực hiện cuộc gọi ra
					console.log('connecting:', data);
				},
				invite: (data) => {
					navigate( '/patient-search/' + data.phone);
				},
				inviteRejected: (data) => {
					// Sự kiện xảy ra khi có cuộc gọi tới, nhưng bị tự động từ chối
					// trong khi đang diễn ra một cuộc gọi khác
					console.log('inviteRejected:', data);
				},
				ringing: (data) => {
					// Sự kiện xảy ra khi cuộc gọi ra bắt đầu đổ chuông
					console.log('ringing:', data);
				},
				accepted: (data) => {
					// Sự kiện xảy ra khi cuộc gọi vừa được chấp nhận
					console.log('accepted:', data);
				},
				incall: (data) => {
					// Sự kiện xảy ra mỗi 1 giây sau khi cuộc gọi đã được chấp nhận
					console.log('incall:', data);
				},
				acceptedByOther: (data) => {
					// Sự kiện dùng để kiểm tra xem cuộc gọi bị kết thúc
					// đã được chấp nhận ở thiết bị khác hay không
					console.log('acceptedByOther:', data);
				},
				ended: (data) => {
					// Sự kiện xảy ra khi cuộc gọi kết thúc
					console.log('ended:', data);
				},
				holdChanged: (status) => {
					// Sự kiện xảy ra khi trạng thái giữ cuộc gọi thay đổi
					console.log('on hold:', status);
				},
				saveCallInfo: (data) => {
					// let { callId, note, ...formData } = data;
					// Sự kiện xảy ra khi cuộc gọi đã có đổ chuông hoặc cuộc gọi tới, khi user có nhập note input mặc định hoặc form input custom
					console.log('on save call info:', data);
				},
				infoLastCall: (data) => {
					// Sự kiện xảy ra khi có bật options.showInfoLastCall và SDK có get được data cho số điện thoại đang gọi
					console.log('on found info last call:', data);
				},
			}
		};
		if (typeof omiSDK === 'undefined') {} else {
			omiSDK?.init(config, () => {
				omiSDK.register({
					domain: getBranchDomain(),
					username: getBranchUsername(), // tương đương trường "sip_user" trong thông tin số nội bộ
					password: getBranchPassword()
				});
			});
		}
	}, []);

	const getBranchDomain = () => {
		const branch = localStorage.getItem(BRANCH);
		switch (branch) {
		  case "q7":
			return "contact33";
			break;
		  case "q2":
			return "contact33";
			break;
		  case "binhduong":
			return "contact33";
			break;
		}
	}

	const getBranchUsername = () => {
		const branch = localStorage.getItem(BRANCH);
		switch (branch) {
		  case "q7":
			return "101";
			break;
		  case "q2":
			return "201";
			break;
		  case "binhduong":
			return "301";
			break;
		}
	}

	const getBranchPassword = () => {
		const branch = localStorage.getItem(BRANCH);
		switch (branch) {
		  case "q7":
			return "YUJDpbWb6d";
			break;
		  case "q2":
			return "yaGapxveRi";
			break;
		  case "binhduong":
			return "D6pVyi9ODx";
			break;
		}
	}

	const handleEnd = ({ steps, values }) => {
	}

	return (
		<Page title="Bảng thông tin" rightContent={<LatestBookings />}>
			<div className="rounded-t-2xl">

				<div className="grid grid-cols-1 lg:grid-cols-1 sm:block grid-flow-col gap-x-4">
					<div className="grid grid-cols-4 lg:grid-cols-2 sm:grid-cols-1 sm:p-4 gap-y-5">
						<AnalysItem
							iconName="calendar-tick"
							title="Yêu cầu hội thoại mới"
							value={conversationQueueCnt || 0}
						/>
						<AnalysItem
							iconName="calendar-tick"
							title="Lịch đặt hẹn mới"
							value={dashboardData?.[0] || 0}
						/>
						<div className="flex items-center gap-x-2">
							<div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
								<Icon width={28} height={28} name="box-tick" className="fill-primary" />
							</div>
							<div className="flex-2 overflow-x-hidden">
								{dashboardData?.[1] !== 0 ? (
										<Tag name="Đơn hàng mới" className="bg-red !rounded-lg" />
								) : (
										<p className="text-14">Đơn hàng mới</p>
								)}
								<p className={`text-24 font-bold`}>{dashboardData?.[1] || 0}</p>
							</div>
						</div>
						<AnalysItem
							iconName="coin"
							title="Doanh thu"
							value={`${abbreviateNumber(dashboardData?.[2]?.[0]?.total || 0)}`}
							valueClassName="text-pink"
						/>
						<CustomerAnalytics />
					</div>
				</div>
				<p>{twilioBalance}</p>
			</div>
		</Page>
	);
};

export default Dashboard;
