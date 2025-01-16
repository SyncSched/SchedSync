"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const dest = new Date("Feb 23, 2025 23:59:59").getTime();
    const x = setInterval(function () {
      const now = new Date().getTime();
      let diff = dest - now;

      if (diff <= 0) {
        const nextMonthDate = new Date();
        nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);

        if (nextMonthDate.getMonth() === 0) {
          nextMonthDate.setFullYear(nextMonthDate.getFullYear() + 1);
        }

        diff = nextMonthDate.getTime() - now;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const updateElement = (className: string, value: number) => {
        const element = document.querySelector(`.${className}`);
        if (element) {
          element.textContent = value < 10 ? `0${value}` : value.toString();
        }
      };

      updateElement("days", days);
      updateElement("hours", hours);
      updateElement("minutes", minutes);
      updateElement("seconds", seconds);
    }, 1000);

    return () => clearInterval(x);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-4xl px-4 md:px-5 lg:px-5 mx-auto">
        <div className="w-full md:px-16 px-10 md:pt-16 pt-10 pb-10 bg-white flex-col justify-end items-center lg:gap-28 md:gap-16 gap-10 inline-flex">
          <div className="flex-col justify-end items-center lg:gap-16 gap-10 flex">
            <h1 className="text-center text-black text-4xl font-bold font-manrope leading-snug">
              SchedSync
            </h1>
            <div className="flex-col justify-center items-center gap-10 flex">
              <div className="flex-col justify-start items-center gap-2.5 flex">
                <h2 className="text-center text-green-500 md:text-6xl text-5xl font-bold font-manrope leading-normal">
                  Coming Soon
                </h2>
                <p className="text-center text-gray-600 text-base font-normal leading-relaxed">
                  Just 40 days remaining until the big reveal of SchedSync!
                </p>
              </div>
              <div className="flex items-start justify-center w-full gap-2">
                <div className="timer flex flex-col gap-0.5">
                  <div>
                    <h3 className="countdown-element days text-center text-black text-2xl font-bold font-manrope leading-9"></h3>
                  </div>
                  <p className="text-center text-gray-600 text-xs font-normal leading-normal w-full">
                    DAYS
                  </p>
                </div>
                <h3 className="w-3 text-center text-gray-600 text-2xl font-medium font-manrope leading-9">
                  :
                </h3>
                <div className="timer flex flex-col gap-0.5">
                  <div>
                    <h3 className="countdown-element hours text-center text-black text-2xl font-bold font-manrope leading-9"></h3>
                  </div>
                  <p className="text-center text-gray-600 text-xs font-normal leading-normal w-full">
                    HRS
                  </p>
                </div>
                <h3 className="w-3 text-center text-gray-600 text-2xl font-medium font-manrope leading-9">
                  :
                </h3>
                <div className="timer flex flex-col gap-0.5">
                  <div>
                    <h3 className="countdown-element minutes text-center text-black text-2xl font-bold font-manrope leading-9"></h3>
                  </div>
                  <p className="text-center text-gray-600 text-xs font-normal leading-normal w-full">
                    MINS
                  </p>
                </div>
                <h3 className="w-3 text-center text-gray-600 text-2xl font-medium font-manrope leading-9">
                  :
                </h3>
                <div className="timer flex flex-col gap-0.5">
                  <div>
                    <h3 className="countdown-element seconds text-center text-black text-2xl font-bold font-manrope leading-9"></h3>
                  </div>
                  <p className="text-center text-gray-600 text-xs font-normal leading-normal w-full">
                    SECS
                  </p>
                </div>
              </div>
              <div className="w-full flex-col justify-center items-center gap-5 flex">
                <h6 className="text-center text-green-500 text-base font-semibold leading-relaxed">
                  Launched Date: Feb 23, 2025
                </h6>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}