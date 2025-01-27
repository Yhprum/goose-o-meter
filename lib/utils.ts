export function formatTimestamp(timestamp: { seconds: number; nanoseconds: number }) {
  const diff = Number(new Date()) - timestamp.seconds * 1000;
  const minute = 60 * 1000;
  const hour = minute * 60;
  const day = hour * 24;
  const month = day * 30;
  const year = day * 365;
  switch (true) {
    case diff < minute:
      const seconds = Math.round(diff / 1000);
      return `${seconds} ${seconds > 1 ? "seconds" : "second"} ago`;
    case diff < hour:
      return Math.round(diff / minute) + " minutes ago";
    case diff < day:
      return Math.round(diff / hour) + " hours ago";
    case diff < month:
      return Math.round(diff / day) + " days ago";
    case diff < year:
      return Math.round(diff / month) + " months ago";
    case diff > year:
      return Math.round(diff / year) + " years ago";
    default:
      return "";
  }
}

export function formatMood(goose: { name: string; mood: { x: number; y: number } }) {
  return `${goose.name} is ${goose.mood.y < 0 && Math.abs(goose.mood.y) <= 80 ? "an " : "a "}${Math.abs(goose.mood.y) > 80 ? "very " : ""}${
    goose.mood.y < 0 ? "ungripped" : "gripped"
  }, ${Math.abs(goose.mood.x) > 80 ? "very " : ""}${goose.mood.x > 0 ? "silly" : "grumpy"} goose`;
}
