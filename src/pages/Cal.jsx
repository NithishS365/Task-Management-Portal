import React from 'react';
import { Datepicker, Eventcalendar,getJson, setOptions, } from '@mobiscroll/react';
import "@mobiscroll/react/dist/css/mobiscroll.min.css";

setOptions({
  theme: 'ios',
  themeVariant: 'light'
});

export const Cal = () => {
  return (
    <div className="m-10 w-full md:w-[500px] h-[350px] mx-auto">
      <Eventcalendar
        data={[
          {
            start: new Date(),
            title: "Today's event"
          },
          {
            start: new Date(2020, 11, 18, 9, 0),
            end: new Date(2020, 11, 20, 13, 0),
            title: 'Multi day event'
          }
        ]}
        height={200} // Reduce height of calendar
      />
    </div>
  );
};
