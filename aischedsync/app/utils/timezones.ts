interface Timezone {
  value: string;
  label: string;
}

export const timezones: Timezone[] = [
  { value: 'Asia/Kolkata', label: 'India (GMT+5:30)' },
  { value: 'Europe/London', label: 'United Kingdom (GMT)' },
  { value: 'America/New_York', label: 'New York (GMT-4)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-7)' },
  { value: 'Asia/Tokyo', label: 'Japan (GMT+9)' },
  { value: 'Asia/Dubai', label: 'Dubai (GMT+4)' },
  { value: 'Europe/Paris', label: 'Paris (GMT+2)' },
  { value: 'Asia/Singapore', label: 'Singapore (GMT+8)' },
  { value: 'Australia/Sydney', label: 'Sydney (GMT+10)' },
  { value: 'Pacific/Auckland', label: 'Auckland (GMT+12)' },
  { value: 'Europe/Berlin', label: 'Berlin (GMT+2)' },
  { value: 'Europe/Moscow', label: 'Moscow (GMT+3)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (GMT+8)' },
  { value: 'Asia/Seoul', label: 'Seoul (GMT+9)' },
  { value: 'America/Chicago', label: 'Chicago (GMT-5)' },
  { value: 'America/Toronto', label: 'Toronto (GMT-4)' },
  { value: 'America/Vancouver', label: 'Vancouver (GMT-7)' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam (GMT+2)' },
  { value: 'Europe/Rome', label: 'Rome (GMT+2)' },
  { value: 'Europe/Madrid', label: 'Madrid (GMT+2)' }
]; 