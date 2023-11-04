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
		var self = this;
		const { steps } = this.props;
		const { name, gender, age } = steps;
		const { terms, searchTerms } = self.state;
		let iAge = parseInt(age.value);
		let searchKey = `${gender.value}_${iAge < 40 ? '18_39' : (iAge < 50 ? '40_49' : (iAge < 65 ? '50_64' : '65'))}`;

		let te = searchTerms.map(t => searchKey + "_" + t);

		var data = [
			{ label: "Không có bệnh", value: searchKey + "_khong_co_benh" },
			{ label: "Thần kinh", value: searchKey +  "_than_kinh" },
			{ label: "Hô hấp", value: searchKey +  "_ho_hap" },
			{ label: "Tim mạch", value: searchKey +  "_tim_mach" },
			{ label: "Thận tiết niệu", value: searchKey +  "_than_tiet_nieu" },
			{ label: "Cơ xương khớp", value: searchKey +  "_co_xuong_khop" },
			{ label: "Nội tiết chuyển hoá", value: searchKey +  "_noi_tiet_chuyen_hoa" },
			{ label: "Tiêu hoá", value: searchKey +  "_tieu_hoa" },
		];
		// var element = document.getElementById("multiselect__container");
		// var element2 = document.getElementById("multiselect__container2");

		var select = function (data) {
			self.setState({ terms: data })
		}

		// this.createMultiselect(this.textInput.current, data, select);
		// createMultiselect(element2, data, select);
	}

	search() {
		const self = this;
		const { steps } = this.props;
		const { name, gender, age } = steps;
		const { terms, searchTerms } = self.state;

		let iAge = parseInt(age.value);


		let searchKey = `${gender.value}_${iAge < 40 ? '18_39' : (iAge < 50 ? '40_49' : (iAge < 65 ? '50_64' : '65'))}`;
		let te = searchTerms.map(t => searchKey + "_" + t);

		const queryUrl = `https://api.echomedi.com/api/medical-service/search/${te.join('|')}`;

		const xhr = new XMLHttpRequest();

		xhr.addEventListener('readystatechange', readyStateChange);

		function readyStateChange() {
			if (this.readyState === 4) {
				const data = JSON.parse(this.responseText);


				// const bindings = data.results.bindings;
				if (data && data.length > 0) {

					let searchData = {};
					data.forEach(s => {
						let found = false;
						s.tags.forEach(t => {
							if (te.indexOf(t.searchBy) > -1 && !found) {
								if (!searchData[t.group]) {
									searchData[t.group] = [];
								}
								searchData[t.group].push(s);
								found = true;
							}
						});

					});


					self.setState({ loading: false, result: data, data: searchData });
				} else {
					self.setState({ loading: false, result: 'Not found.' });
				}
			}
		}

		xhr.open('GET', queryUrl);
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
		const { name, gender, age, height, weight } = steps;

		const fHeight = parseFloat(height.value) / 100;
		const fWeight = parseFloat(weight.value);

		return (
			<div className="dbpedia w-full">
				<p> {name?.value} {age?.value} {gender?.value}, BMI {(fWeight/fHeight/fHeight).toFixed(2)}. Vấn đề sức khoẻ:</p>
				<div className="grid md:grid-cols-2 grid-cols-2 gap-x-6 gap-y-4 py-4">
					{serviceGroups.map((searchTerm) => (
						<Button
							key={searchTerm}
							onChange={onchange}
							type="button"
							className={classNames(
								"text-center w-full h-14 pl-2 !justify-start capitalize",
								{
									"bg-primary text-white font-bold": searchTerms.indexOf(searchTerm) != -1,
									"bg-primary/10 text-primary font-normal": searchTerms.indexOf(searchTerm) == -1,
								}
							)}
							onClick={() => {
								let newSearchTerms = [...searchTerms];
								const index = newSearchTerms.indexOf(searchTerm);
								if (index != -1) {
									newSearchTerms.splice(index, 1);
								} else {
									newSearchTerms.push(searchTerm);
								}
								//   setSearchTerms(newSearchTerms);
								self.setState({
									searchTerms: newSearchTerms
								})
							}}
						>
							{translateServiceGroup(searchTerm)}
						</Button>
					))}
				</div>
				<Button
					className={"w-full"}
					btnType="primary"
					type="reset"
					onClick={e => this.search()}
				>
					Tìm kiếm
				</Button>
				{loading ? <Loading /> :
					<div>
						<p>Kết quả:</p>
						{data && Object.entries(data)
                      .map(([serviceName, service]) => {
                        console.log('serviceName', serviceName, service)
                        return <div><h1 className="font-bold">- {serviceName}</h1>
                          {service.map(s => <p className="flex">
                            {s.label} 
                            <div className="ml-4 font-bold"><span>{numberWithCommas(s?.price)}đ</span></div>
                            </p>)}
                        </div>
                      })
                    }
					</div>
				}
			</div>
		);
	}
}


function numberWithCommas(x) {
	return x?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") ?? '0'
  }

const steps = [
	{
		id: '1',
		message: 'ECHO MEDI xin chào bạn, cho mình hỏi tên của bạn là gì ?',
		trigger: 'name',
	},
	{
		id: 'name',
		user: true,
		trigger: '3',
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
		trigger: '6',
		validator: (value) => {
			if (isNaN(value)) {
				return 'value must be a number';
			} else if (value < 0) {
				return 'value must be positive';
			} else if (value > 120) {
				return `${value}? Come on!`;
			}

			return true;
		},
	},
	{
		id: '6',
		message: 'Bạn nặng bao nhiêu kg ?',
		trigger: 'weight',
	},
	{
		id: 'weight',
		user: true,
		trigger: '100',
		validator: (value) => {
			if (isNaN(value)) {
				return 'value must be a number';
			} else if (value < 0) {
				return 'value must be positive';
			} else if (value > 120) {
				return `${value}? Come on!`;
			}

			return true;
		},
	},
	{
		id: '100',
		message: 'Bạn cao nhiêu cm ?',
		trigger: 'height',
	},
	{
		id: 'height',
		user: true,
		trigger: '7',
		validator: (value) => {
			if (isNaN(value)) {
				return 'value must be a number';
			} else if (value < 0) {
				return 'value must be positive';
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
		<Page title="Bảng thông tin" rightContent={<LatestBookings />}>
			<div className="rounded-t-2xl">

				<div className="grid grid-cols-1 lg:grid-cols-1 sm:block grid-flow-col gap-x-4">
					{/* <div className="flex items-start space-x-2 sm:block">
						<ThemeProvider theme={theme} >
							<ChatBot steps={steps} headerTitle="ECHO MEDI" handleEnd={handleEnd} />
						</ThemeProvider>
					</div> */}
					{/* <div className="rounded-xl shadow-sm p-4">
						<AnalysItem
							iconName="calendar-tick"
							title="Lịch đặt hẹn mới"
							value={dashboardData?.[0] || 0}
						/>
						
					</div> */}
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
						<AnalysItem iconName="box-tick" title="Đơn hàng mới" value={dashboardData?.[1] || 0} />
						<AnalysItem
							iconName="coin"
							title="Doanh thu"
							value={`${abbreviateNumber(dashboardData?.[2]?.[0]?.total || 0)}`}
							valueClassName="text-pink"
						/>
						<CustomerAnalytics />
					</div>
					{/* <div className="flex items-start space-x-2 sm:block">
						<ThemeProvider theme={theme} >
							<ChatBot steps={steps} headerTitle="ECHO MEDI" handleEnd={handleEnd} />
						</ThemeProvider>
					</div> */}
					{/* <CustomerAnalytics /> */}
				</div>

				{/* <CustomerAnalytics /> */}

			</div>
		</Page>
	);
};

export default Dashboard;
