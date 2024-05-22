import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import './App.css';
import data from './data.json';

function App() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [workingHours, setWorkingHours] = useState([]);
  const [breakTimes, setBreakTimes] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  // const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    setWorkingHours(data.ListWorkingHours);
    setBreakTimes(data.ListBreakTime);
    setBlockedDates(data.ListBlockedDates);
  }, []);

  const isTimeBlocked = (date, time) => {
    const formattedDate = date.toISOString().split('T')[0];
    return blockedDates.some(blockedDate => {
      if (blockedDate.BlockedStartDate <= formattedDate && formattedDate <= blockedDate.BlockedEndDate) {
        const blockedStartTime = new Date(`1970-01-01T${blockedDate.BlockStartTime}:00`);
        const blockedEndTime = new Date(`1970-01-01T${blockedDate.BlockEndTime}:00`);
        return time >= blockedStartTime && time <= blockedEndTime;
      }
      return false;
    });
  };

  const isTimeDuringBreak = (time) => {
    return breakTimes.some(breakTime => {
      const breakStart = new Date(`1970-01-01T${breakTime.BreakFrom}:00`);
      const breakEnd = new Date(`1970-01-01T${breakTime.BreakTo}:00`);
      return time >= breakStart && time <= breakEnd;
    });
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const generateTimeSlots = (startTime, endTime) => {
    const timeSlots = [];
    let currentTime = new Date(`1970-01-01T${startTime}:00`);
    const endTimeObj = new Date(`1970-01-01T${endTime}:00`);

    while (currentTime < endTimeObj) {
      const isBlocked = isTimeDuringBreak(currentTime) || isTimeBlocked(selectedDate, currentTime);
      if (!isBlocked) {
        const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        timeSlots.push(timeString);
      }
      currentTime = new Date(currentTime.getTime() + 15 * 60000); // Increment currentTime by 15 minutes
    }

    return timeSlots;
  };

  const handleTimeSelection = (time) => {
    if (time !== 'No slots available') {
      setSelectedTime(time);
    }
  };

  const getWorkingHoursForSelectedDay = () => {
    if (!selectedDate) return [];

    const dayOfWeek = selectedDate.toLocaleString('en-us', { weekday: 'long' });
    const workingDay = workingHours.find(day => day.WorkDay === dayOfWeek);

    if (workingDay && workingDay.Available) {
      const generatedTimeSlots = generateTimeSlots(workingDay.WorkStartTime, workingDay.WorkEndTime);
      return generatedTimeSlots;
    } else {
      return [];
    }
  };

  const timeSlots = getWorkingHoursForSelectedDay();

  return (
    <div>
      <div className="main">
        <div className="container1">
          <div className="date-picker">
            <h5>Date and Time</h5>
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              minDate={new Date()}
              dateFormat="dd/MM/yyyy"
              open={true}
              inline
            // readOnly={true}
            // disabled={isDisabled}
            />
          </div>
          <div className="button-container">
            {timeSlots.length === 0 ? (
              <button type="button" className="btn btn-outline-dark btn-lg" disabled>
                No slots available
              </button>
            ) : (
              timeSlots.map((time, index) => (
                <React.Fragment key={time}>
                  {index % 4 === 0 && <div className="button-row" />}
                  <button
                    type="button"
                    className={`btn btn-outline-dark btn-lg ${selectedTime === time ? 'selected' : ''}`}
                    onClick={() => handleTimeSelection(time)}
                  >
                    {time}
                  </button>
                </React.Fragment>
              ))
            )}
          </div>
          {selectedTime && selectedTime !== 'No slots available' && (
            <div className="selected-time">
              <p>Selected Time: {selectedTime}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
