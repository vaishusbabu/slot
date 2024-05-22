import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import './App.css';
import data from './data.json';
import { format } from "date-fns";

function App() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [workingHours, setWorkingHours] = useState([]);
  const [breakTimes, setBreakTimes] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);

  useEffect(() => {
    setWorkingHours(data.ListWorkingHours);
    setBreakTimes(data.ListBreakTime);
    setBlockedDates(data.ListBlockedDates);
  }, []);

  const isTimeBlocked = (date, time) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return blockedDates.some(blockedDate => {
      if (blockedDate.BlockedStartDate <= formattedDate && formattedDate <= blockedDate.BlockedEndDate) {
        const blockedStartTime = new Date(`2024-05-22T${blockedDate.BlockStartTime}:00`);
        const blockedEndTime = new Date(`2024-05-22T${blockedDate.BlockEndTime}:00`);
        return time >= blockedStartTime && time <= blockedEndTime;
      }
      return false;
    });
  };

  const isTimeDuringBreak = (time) => {
    return breakTimes.some(breakTime => {
      const breakStart = new Date(`2024-05-22T${breakTime.BreakFrom}:00`);
      const breakEnd = new Date(`2024-05-22T${breakTime.BreakTo}:00`);
      return time >= breakStart && time <= breakEnd;
    });
  };

  const generateTimeSlots = (startTime, endTime) => {
    const timeSlots = [];
    let currentTime = new Date(`2024-05-22T${startTime}:00`);
    const endTimeObj = new Date(`2024-05-22T${endTime}:00`);

    while (currentTime < endTimeObj) {
      const isBlocked = isTimeDuringBreak(currentTime) || isTimeBlocked(selectedDate, currentTime);
      if (!isBlocked) {
        const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        timeSlots.push(timeString);
      }
      currentTime = new Date(currentTime.getTime() + 15 * 60000);
    }
    return timeSlots;
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
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

  const chunkArray = (array, chunkSize) => {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize));
    }
    return result;
  };

  const timeSlotRows = chunkArray(timeSlots, 2);

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
            />
            {selectedTime && selectedTime !== 'No slots available' && (
              <div className="selected-time">
                <button className="btn btn-outline-success ">Selected Time: {selectedTime}</button>
              </div>
            )}
          </div>

          <div className="button-container">
            <p style={{ color: "darkgreen" }}>Select time slot</p>
            {timeSlots.length === 0 ? (
              // <h6> No slots available</h6>
              <button type="button" className="btn btn-outline-danger " disabled>
                No slots available
              </button>
            ) : (

              timeSlotRows.map((row, rowIndex) => (
                <div key={rowIndex} className="button-row">

                  {row.map((time, index) => (
                    <button
                      key={time}
                      type="button"
                      className={`btn btn-outline-dark btn-lg ${selectedTime === time ? 'selected' : ''}`}
                      onClick={() => handleTimeSelection(time)}
                    >
                      {time}
                    </button>
                  ))}

                </div>
              ))
            )}

          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
