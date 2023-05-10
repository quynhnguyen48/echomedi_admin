import dayjs from "dayjs"

import Price from "components/Price"
import CalendarMonthView from "components/CalendarMonthView"
import { formatDate } from "utils/dateTime"

const CalendarRevenue = ({ calendarData, onShowTooltip }) => {
  const renderDay = (day) => {
    const dayData = calendarData?.find(item => dayjs(item?.day).isSame(day))
    const { innerWidth: width } = window;

    const mouseEnterCalendarItem = (e) => {
      const currentEl = e.currentTarget
      const pos = {
        top: currentEl.getBoundingClientRect().top - 160,
        left: currentEl.getBoundingClientRect().left < width/2 ?
          currentEl.getBoundingClientRect().left :
          currentEl.getBoundingClientRect().left - currentEl.clientWidth/2
      }
      onShowTooltip(pos, day)
    }
    return (
      <div
        className="bg-primary/10 border-1 border-white p-6 space-y-2 calendar-item transition-background duration-300 cursor-pointer"
        onMouseEnter={mouseEnterCalendarItem}
        onMouseLeave={() => {
          onShowTooltip(null, null)
        }}
      >
        <h4 className="font-bold text-primary" >{formatDate(new Date(dayData?.day), 'DD MMMM')}</h4>
        <p>
          {
            dayData?.totalRevenue ? <Price price={dayData?.totalRevenue} /> : <b>0đ</b>
          }
        </p>
      </div>
    )
  }

  return (
    calendarData[0]?.day &&
    <CalendarMonthView
      currentDate={calendarData[0]?.day}
      renderDay={renderDay}
      width={'100%'}
    />
  )
}

export default CalendarRevenue
