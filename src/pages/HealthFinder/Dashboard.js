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
import axios from "axios";
import { getListConversationQueues } from "services/api/conversationQueue"
import ChatBot, { Loading } from 'react-simple-chatbot';
import { ThemeProvider } from 'styled-components';
import Button from "components/Button"
import classNames from "classnames"

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

class Review extends Component {
	constructor(props) {
		super(props);

		this.state = {
			name: '',
			gender: '',
			age: '',
			data: {}
		};
	}

	componentWillMount() {
		const { steps } = this.props;
		const { name, gender, age } = steps;

		this.setState({ name, gender, age });
		this.search();
	}


	render() {
		const { name, gender, age } = this.state;
		return (
			<div style={{ width: '100%' }}>
				<h3>Summary</h3>
				<table>
					<tbody>
						<tr>
							<td>Name</td>
							<td>{name.value}</td>
						</tr>
						<tr>
							<td>Gender</td>
							<td>{gender.value}</td>
						</tr>
						<tr>
							<td>Age</td>
							<td>{age.value}</td>
						</tr>
					</tbody>
				</table>
			</div>
		);
	}
}

class DBPedia extends Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: true,
			result: '',
			trigger: false,
			terms: [],
			data: '',
			searchTerms: [],
		};

		this.triggetNext = this.triggetNext.bind(this);
		this.search = this.search.bind(this);
		this.textInput = createRef();
	}

	createMultiselect = function (element, data, selectCb, options) {

		var labels = {};

		labels.emptyText = (options && options.emptyText) ? options.emptyText : 'Chọn';
		labels.selectedText = (options && options.selectedText) ? options.selectedText : 'Selected';
		labels.selectedAllText = (options && options.selectedAllText) ? options.selectedAllText : 'Chọn tất cả';
		labels.title = (options && options.title) ? options.title : 'Chọn vấn đề sức khoẻ:';

		//define the elements
		var container = document.createElement("div");
		var multiselectLabel = document.createElement("div");
		var dataContainer = document.createElement("div");
		var button = document.createElement("button");
		var searchField = document.createElement("input");
		var clearSelection = document.createElement('span');
		var carret = document.createElement("b");
		var list = document.createElement("ul");

		//set the ids
		var timestamp = Math.round(new Date().getTime() * Math.random());
		container.setAttribute('id', 'multiselect_container_' + timestamp);
		dataContainer.setAttribute('id', 'multiselect_datacontainer_' + timestamp);
		multiselectLabel.setAttribute('id', 'multiselect_label_' + timestamp);
		button.setAttribute('id', 'multiselect_button_' + timestamp);
		list.setAttribute('id', 'multiselect_list_' + timestamp);

		var _fnIsChild = function (element, parent) {
			var node = element.parentNode;
			while (node) {
				if (node === parent) {
					return true;
				}
				node = node.parentNode;
			}
			return false;
		}

		var _selectionText = function (element) {
			var text = "";
			var selection = element.querySelectorAll("input:checked");
			if (selection.length === 0) {
				text = labels.emptyText;
			} else if (selection.length > 3) {
				text = selection.length + " " + labels.selectedText;
			} else {
				var arr = [];
				for (var i = 0; i < selection.length; i++) {
					arr.push(selection[i].parentNode.textContent);
				}
				text = arr.join(",");
			}
			return text;
		};

		var _openList = function (e) {
			list.style.display = "block";
			e.srcElement.children[0].focus();
		};

		var _selectItem = function (e) {
			var text = _selectionText(container);
			container
				.getElementsByTagName("button")[0]
				.children[0].setAttribute("placeholder", text);

			if (selectCb) {
				var selectionElements = container.querySelectorAll("input:checked");
				var selection = [];
				for (var i = 0; i < selectionElements.length; i++) {
					selection.push(selectionElements[i].value);
				}
				selectCb(selection);
			}

		};

		var _clearSearch = function () {
			var elements = container.getElementsByTagName("li");
			for (var i = 0; i < elements.length; i++) {
				elements[i].style.display = "";
			}
		};

		var _performSearch = function (e) {
			if (e.which != 13 && e.which != 38 && e.which != 40) {
				var active = list.getElementsByClassName("multiselect-label--active");
				if (active.length > 0) {
					active[0].classList.remove("multiselect-label--active");
				}
				var first = true;
				var filter = e.srcElement.value.toUpperCase();
				var elements = container.getElementsByTagName("li");
				for (var i = 0; i < elements.length; i++) {
					var cb = elements[i].getElementsByTagName("label")[0].textContent;
					if (cb.toUpperCase().indexOf(filter) !== -1) {
						if (first) {
							first = false;
							elements[i].children[0].children[0].classList.add("multiselect-label--active");
						}
						elements[i].style.display = "";
					} else {
						elements[i].style.display = "none";
					}
				}
			}
		};

		var _fnClearSelection = function (e) {
			var inputs = list.getElementsByTagName('input');
			for (var i = 0; i < inputs.length; i++) {
				if (inputs[i].checked) {
					inputs[i].parentNode.click();
				}
			}
			e.stopPropagation();
		};

		var _fnSelectAll = function (e) {
			var inputs = list.getElementsByTagName('input');
			for (var i = 0; i < inputs.length; i++) {
				if (!inputs[i].checked) {
					inputs[i].parentNode.click();
				}
			}
			e.stopPropagation();
		};

		container.classList.add("multiselect-container");
		multiselectLabel.classList.add("multiselect-label");
		multiselectLabel.innerHTML = labels.title;
		dataContainer.classList.add("multiselect-data-container");
		button.classList.add("multiselect-button");

		searchField.setAttribute("type", "text");
		searchField.setAttribute("placeholder", labels.emptyText);
		searchField.classList.add("multiselect-text");
		searchField.addEventListener("keyup", _performSearch);

		clearSelection.classList.add('multiselect-clear');
		clearSelection.innerHTML = 'X';
		clearSelection.addEventListener("click", _fnClearSelection);

		carret.classList.add("carret");

		button.appendChild(searchField);
		button.appendChild(clearSelection);
		button.appendChild(carret);

		button.addEventListener("click", _openList);

		list.classList.add("multiselect-list");

		for (var i = -1; i < data.length; i++) {
			var item = document.createElement("li");
			var a = document.createElement("a");
			var label = document.createElement("label");
			var input = document.createElement("input");

			a.setAttribute("tabindex", "0");

			label.classList.add("multiselect-item-label");

			if (i == -1) {
				a.addEventListener("click", _fnSelectAll);
				label.appendChild(document.createTextNode("Chọn tất cả"));
				label.classList.add('multiselect-item-label--select-all');
			}
			else {
				if (i == 0) {
					label.classList.add("multiselect-item-label--active");
				}
				input.setAttribute("type", "checkbox");
				input.setAttribute("class", "multiselect-checkbox");
				label.appendChild(input);
				input.setAttribute("value", data[i].value);
				input.addEventListener("change", _selectItem);
				label.appendChild(document.createTextNode(data[i].label));
			}
			a.appendChild(label);
			item.appendChild(a);
			list.appendChild(item);
		}

		dataContainer.appendChild(button);
		dataContainer.appendChild(list);
		container.appendChild(multiselectLabel);
		container.appendChild(dataContainer);
		element.appendChild(container);

		//Change to the specific window
		document.addEventListener("click", function (e) {
			if (!_fnIsChild(e.target, container)) {
				list.style.display = "none";
				searchField.value = "";
				_clearSearch();
			}
		});

		document.addEventListener("keyup", function (e) {
			if (list.style.display == 'block') {
				//mouse down
				if (e.which === 40) {
					var active = list.getElementsByClassName(
						"multiselect-label--active"
					)[0];
					var next = active.parentNode.parentNode.nextSibling;
					//Find the next visible element
					while (next && next.style && next.style.display == 'none') {
						next = next.nextSibling;
					}
					if (next) {
						active.classList.remove("multiselect-label--active");
						next
							.getElementsByClassName("multiselect-label")[0]
							.classList.add("multiselect-label--active");
						next.children[0].focus();
						searchField.focus();
						e.preventDefault();
					}
				} else if (e.which === 38) {
					//mouse up
					var active = list.getElementsByClassName(
						"multiselect-label--active"
					)[0];
					var prev = active.parentNode.parentNode.previousSibling;
					//Find the previous visible element
					while (prev && prev.style && prev.style.display === 'none') {
						prev = prev.previousSibling;
					}
					if (prev) {
						active.classList.remove("multiselect-label--active");
						prev
							.getElementsByClassName("multiselect-label")[0]
							.classList.add("multiselect-label--active");
						prev.children[0].focus();
						searchField.focus();
						e.preventDefault();
					}
				} else if (e.which === 13) {
					// enter
					list.getElementsByClassName("multiselect-label--active")[0].click();
					e.preventDefault();
				}
			}
		});
	};

	componentDidMount() {
		// var self = this;
		// const { steps } = this.props;
		this.search();
		const { name } = steps;
		
	}

	search() {
		const self = this;
		const { steps } = this.props;
		const { name } = steps;
		const { terms, searchTerms } = self.state;

		const queryUrl = `https://1e70-13-229-51-67.ngrok-free.app/query?q=${name.value}`;
		axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
		axios.get(queryUrl)
			.then(response => {
				this.setState({
					data: response.data,
				})
				// setTwilioBalance(response.data);
			})
			.catch((e) =>  {
				console.log('error', e)
				this.setState({
					data: 'Có lỗi xảy ra. Xin thử lại sau!',
				})
			})
			.finally(() => {
				// toast.dismiss(id);
				this.props.triggerNextStep();
			});
		return;
		const xhr = new XMLHttpRequest();

		xhr.addEventListener('readystatechange', readyStateChange);
		xhr.timeout = 100000;
		

		function readyStateChange() {
			if (this.readyState === 4) {
				const data = JSON.parse(this.responseText);
				console.log('dataaaa a', data)

				// // const bindings = data.results.bindings;
				// if (data && data.length > 0) {

				// 	let searchData = {};
				// 	data.forEach(s => {
				// 		let found = false;
				// 		s.tags.forEach(t => {
				// 			if (te.indexOf(t.searchBy) > -1 && !found) {
				// 				if (!searchData[t.group]) {
				// 					searchData[t.group] = [];
				// 				}
				// 				searchData[t.group].push(s);
				// 				found = true;
				// 			}
				// 		});

				// 	});

					self.setState({ loading: false, result: data, data: searchData });
				} else {
					self.setState({ loading: false, result: 'Not found.' });
				}
		}

		xhr.open('GET', queryUrl, true);
		xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest'); 
		xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
		xhr.send();
	}

	triggetNext() {
		this.setState({ trigger: true }, () => {
			this.props.triggerNextStep();
		});
	}

	render() {
		const self = this;
		const { trigger, loading, result, data, searchTerms } = this.state;
		const { steps } = this.props;
		const { name, gender, age } = steps;

		return (
			<div class="sc-papXJ fkizOu rsc-ts rsc-ts-bot"><div class="sc-ftvSup hAEwKD rsc-ts-image-container">
				<img class="sc-iBkjds cftzIa rsc-ts-image" src="data:image/svg+xml,%3csvg version='1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3e%3cpath d='M303 70a47 47 0 1 0-70 40v84h46v-84c14-8 24-23 24-40z' fill='%2393c7ef'/%3e%3cpath d='M256 23v171h23v-84a47 47 0 0 0-23-87z' fill='%235a8bb0'/%3e%3cpath fill='%2393c7ef' d='M0 240h248v124H0z'/%3e%3cpath fill='%235a8bb0' d='M264 240h248v124H264z'/%3e%3cpath fill='%2393c7ef' d='M186 365h140v124H186z'/%3e%3cpath fill='%235a8bb0' d='M256 365h70v124h-70z'/%3e%3cpath fill='%23cce9f9' d='M47 163h419v279H47z'/%3e%3cpath fill='%2393c7ef' d='M256 163h209v279H256z'/%3e%3cpath d='M194 272a31 31 0 0 1-62 0c0-18 14-32 31-32s31 14 31 32z' fill='%233c5d76'/%3e%3cpath d='M380 272a31 31 0 0 1-62 0c0-18 14-32 31-32s31 14 31 32z' fill='%231e2e3b'/%3e%3cpath d='M186 349a70 70 0 1 0 140 0H186z' fill='%233c5d76'/%3e%3cpath d='M256 349v70c39 0 70-31 70-70h-70z' fill='%231e2e3b'/%3e%3c/svg%3e" alt="avatar"/></div>
				<div class="sc-gKXOVf iiGzCW rsc-ts-bubble">{data}</div></div>
		);
	}
}


function numberWithCommas(x) {
	return x?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") ?? '0'
}

const steps = [
	{
		id: '1',
		message: 'Bạn có câu hỏi gì về ECHO MEDI hoặc vấn đề liên quan đến sức khoẻ ?',
		trigger: 'name',
	},
	{
		id: 'name',
		user: true,
		trigger: '7',
	},
	{
		id: '3',
		message: 'Xin chào {previousValue}! Giới tính của bạn ?',
		trigger: 'gender',
	},
	{
		id: 'gender',
		options: [
			{ value: 'nam', label: 'Nam', trigger: '5' },
			{ value: 'nu', label: 'Nữ', trigger: '5' },
		],
	},
	{
		id: '5',
		message: 'Bạn bao nhiêu tuổi ?',
		trigger: 'age',
	},
	{
		id: 'age',
		user: true,
		trigger: '7',
		validator: (value) => {
			if (isNaN(value)) {
				return 'Không hợp lệ';
			} else if (value < 0) {
				return 'Không hợp lệ';
			} else if (value > 120) {
				return `Không hợp lệ`;
			}

			return true;
		},
	},
	{
		id: 'search',
		user: true,
		trigger: '7',
	},
	{
		id: '7',
		component: <DBPedia />,
		waitAction: true,
		trigger: 'name',
	},
	{
		id: 'review',
		component: <Review />,
		asMessage: true,
		trigger: 'update',
	},
	{
		id: 'update',
		message: 'Would you like to update some field?',
		trigger: 'update-question',
	},
	{
		id: 'update-question',
		options: [
			{ value: 'yes', label: 'Yes', trigger: 'update-yes' },
			{ value: 'no', label: 'No', trigger: 'end-message' },
		],
	},
	{
		id: 'update-yes',
		message: 'What field would you like to update?',
		trigger: 'update-fields',
	},
	{
		id: 'update-fields',
		options: [
			{ value: 'name', label: 'Name', trigger: 'update-name' },
			{ value: 'gender', label: 'Gender', trigger: 'update-gender' },
			{ value: 'age', label: 'Age', trigger: 'update-age' },
		],
	},
	{
		id: 'update-name',
		update: 'name',
		trigger: '7',
	},
	{
		id: 'update-gender',
		update: 'gender',
		trigger: '7',
	},
	{
		id: 'update-age',
		update: 'age',
		trigger: '7',
	},
	{
		id: 'end-message',
		message: 'Thanks! Your data was submitted successfully!',
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
	width: 500
};

var Motus = {};



const Dashboard = () => {
	const [dashboardData, setDashboardData] = useState([]);
	const [conversationQueueCnt, setConversationQueueCnt] = useState(0);

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
	}, []);

	const handleEnd = ({ steps, values }) => {
	}

	return (
			<div className="rounded-t-2xl w-full">

				<div className="grid grid-cols-1 sm:block grid-flow-col gap-x-4">
					<div className="flex items-start space-x-4 sm:block">
						<ThemeProvider theme={theme} >
							<ChatBot placeholder="Viết lời nhắn" steps={steps} headerTitle="ECHO MEDI" handleEnd={handleEnd} />
						</ThemeProvider>
						{/* <CheckinAnalytics />
					<TreatementAnalytics className="w-fit" /> */}
					</div>
					{/* <div className="rounded-xl shadow-sm p-4">
						<AnalysItem
							iconName="calendar-tick"
							title="Lịch đặt hẹn mới"
							value={dashboardData?.[0] || 0}
						/>
						
					</div> */}
					{/* <div className="grid grid-cols-2">
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
						<AnalysItem iconName="box-tick" title="Đơn hàng mới" value={dashboardData?.[1] || 0} />
						<AnalysItem
							iconName="coin"
							title="Doanh thu"
							value={`${abbreviateNumber(dashboardData?.[2]?.[0]?.total || 0)}`}
							valueClassName="text-pink"
						/>
						<CustomerAnalytics />
					</div> */}
					{/* <CustomerAnalytics /> */}
				</div>

				{/* <CustomerAnalytics /> */}

			</div>
	);
};

export default Dashboard;
