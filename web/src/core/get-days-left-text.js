export default function getDaysLeftText(trip) {
  if (trip.daysLeft === 0) return 'Today';
  if (!trip.daysLeft) return '-';

  let { daysLeft } = trip;
  daysLeft += trip.daysLeft === 1 ? ' day' : ' days';
  return daysLeft;
}
