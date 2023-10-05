import { TRANSACTION_CHECKIN_STATUS } from "../constants/Transaction"

export const convertToKebabCase = (str = '') => {
	return str?.toLocaleLowerCase()?.split(' ').join('-');
};

export const generateCode = (prefix) => {
	let now = Date.now().toString();
	now += now + Math.floor(Math.random() * 10);
	return `${prefix ? `#${prefix}.` : ''}` + now.slice(now.length - 6, now.length);
};

export const randomPassword = (
	len = 8,
	minUpper = 1,
	minLower = 1,
	minNumber = 1,
	minSpecial = 0
) => {
	let chars = String.fromCharCode(...Array(127).keys()).slice(33), //chars
		A2Z = String.fromCharCode(...Array(91).keys()).slice(65), //A-Z
		a2z = String.fromCharCode(...Array(123).keys()).slice(97), //a-z
		zero2nine = String.fromCharCode(...Array(58).keys()).slice(48), //0-9
		specials = chars.replace(/\w/g, '');
	if (minSpecial <= 0) chars = zero2nine + A2Z + a2z;
	if (minNumber < 0) chars = chars.replace(zero2nine, '');
	let minRequired = minSpecial + minUpper + minLower + minNumber;
	let rs = [].concat(
		Array.from(
			{ length: minSpecial ? minSpecial : 0 },
			() => specials[Math.floor(Math.random() * specials.length)]
		),
		Array.from(
			{ length: minUpper ? minUpper : 0 },
			() => A2Z[Math.floor(Math.random() * A2Z.length)]
		),
		Array.from(
			{ length: minLower ? minLower : 0 },
			() => a2z[Math.floor(Math.random() * a2z.length)]
		),
		Array.from(
			{ length: minNumber ? minNumber : 0 },
			() => zero2nine[Math.floor(Math.random() * zero2nine.length)]
		),
		Array.from(
			{ length: Math.max(len, minRequired) - (minRequired ? minRequired : 0) },
			() => chars[Math.floor(Math.random() * chars.length)]
		)
	);
	return rs.sort(() => Math.random() > Math.random()).join('');
};

export const toCapitalize = (string) => {
	const words = string?.split(' ')

	for (let i = 0; i < words.length; i++) {
		words[i] = words[i][0].toUpperCase() + words[i].substr(1)
	}

	return words.join(' ')
}

export const renderTransactionCheckinStatusColor = (status) => {
	switch (status) {
		case TRANSACTION_CHECKIN_STATUS.NEW:
		case TRANSACTION_CHECKIN_STATUS.WAITING:
			return "bg-orangeLight"
		case TRANSACTION_CHECKIN_STATUS.PROGRESS:
			return "bg-blue3"
		case TRANSACTION_CHECKIN_STATUS.DONE:
			return "bg-green"
		case TRANSACTION_CHECKIN_STATUS.PAID:
			return "bg-purple"
		case TRANSACTION_CHECKIN_STATUS.CONFIRMED:
			return "bg-blue"
		default:
			return "bg-orangeLight"
	}
}

export function getDisplayBranchLabel(value) {
	switch (value) {
		case "q7":
			return "Quận 7"
		case "q2":
			return "Quận 2"
		case "binhduong":
			return "Bình Dương"
		case "bd":
			return "Bình Dương"
	}
  }
  

export function removeVietnameseTones(str) {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i")
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
  str = str.replace(/đ/g, "d")
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A")
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E")
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I")
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O")
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U")
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y")
  str = str.replace(/Đ/g, "D")
  // Some system encode vietnamese combining accent as individual utf-8 characters
  // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "") // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, "") // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
  // Remove extra spaces
  // Bỏ các khoảng trắng liền nhau
  str = str.replace(/ + /g, " ")
  str = str.trim()
  // Remove punctuations
  // Bỏ dấu câu, kí tự đặc biệt
  str = str.replace(
    /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
    " "
  )
  return str
}