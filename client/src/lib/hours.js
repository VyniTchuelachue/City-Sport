// Opening hours are always evaluated in Cameroon time (WAT, UTC+1),
// wherever the visitor's device happens to be.
const TIME_ZONE = 'Africa/Douala';
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CLOSING_SOON_MINUTES = 45;

const clock = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE,
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

export function nowInCameroon(date = new Date()) {
  const parts = Object.fromEntries(clock.formatToParts(date).map((p) => [p.type, p.value]));
  return {
    day: WEEKDAYS.indexOf(parts.weekday),
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

// hours: seven entries, Sunday first, each ['09:00', '19:00'] or null when closed.
export function storeStatus(hours, now = nowInCameroon()) {
  const today = hours[now.day];
  if (today) {
    const opens = toMinutes(today[0]);
    const closes = toMinutes(today[1]);
    if (now.minutes >= opens && now.minutes < closes) {
      return {
        open: true,
        closingSoon: closes - now.minutes <= CLOSING_SOON_MINUTES,
        time: today[1],
      };
    }
    if (now.minutes < opens) {
      return { open: false, time: today[0], daysAhead: 0, day: now.day };
    }
  }
  for (let ahead = 1; ahead <= 7; ahead += 1) {
    const day = (now.day + ahead) % 7;
    if (hours[day]) return { open: false, time: hours[day][0], daysAhead: ahead, day };
  }
  return { open: false, time: null };
}

// '19:00' → '19 h' / '7 pm';  '09:30' → '9 h 30' / '9:30 am'
export function formatTime(hhmm, lang) {
  const [h, m] = hhmm.split(':').map(Number);
  if (lang === 'en') {
    const suffix = h >= 12 ? 'pm' : 'am';
    const hour = h % 12 || 12;
    return m ? `${hour}:${String(m).padStart(2, '0')} ${suffix}` : `${hour} ${suffix}`;
  }
  return m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`;
}
