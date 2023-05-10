import Price from "components/Price"

const CalendarGrowth = ({ calendarData, onShowTooltip }) => {
  const renderMonthOfYear = (monthOfYearData) => {
    const mouseEnterCalendarItem = (e) => {
      const currentEl = e.currentTarget
      const pos = {
        top: currentEl.getBoundingClientRect().top - 160,
        left: currentEl.getBoundingClientRect().left > 300 ?
          currentEl.getBoundingClientRect().left :
          currentEl.getBoundingClientRect().left - currentEl.clientWidth/2
      }
      onShowTooltip(pos, monthOfYearData)
    }
    return (
      <div
        className="bg-primary/10 flex-1 border-1 border-white px-6 py-4 calendar-item transition-background duration-300 cursor-pointer"
        onMouseEnter={mouseEnterCalendarItem}
        onMouseLeave={() => {
          onShowTooltip(null, null)
        }}
      >
        {
          monthOfYearData?.totalRevenue ? <Price price={monthOfYearData?.totalRevenue} /> : <b>0đ</b>
        }
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center">
        <span className="flex-1 w-[200px] max-w-[200px]" />
        {
          calendarData[0]?.years.map(year => (
            <b className="flex-1 pb-4 pl-4" key={year.year}>{year.year}</b>
          ))
        }
      </div>
      <div>
        {
          calendarData.map(month => {
            return (
              <div className="flex items-center">
                <b className="flex-1 w-[200px] max-w-[200px] uppercase">{month.month}</b>
                {
                  month.years.map(item => (
                    renderMonthOfYear(item)
                  ))
                }
              </div>
            )
          })
        }
      </div>
    </div>
  )
}

export default CalendarGrowth
