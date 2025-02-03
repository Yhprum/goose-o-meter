export function formatTimestamp(timestamp: { seconds: number; nanoseconds: number }) {
  const diff = Number(new Date()) - timestamp.seconds * 1000;
  const minute = 60 * 1000;
  const hour = minute * 60;
  const day = hour * 24;
  const month = day * 30;
  const year = day * 365;
  switch (true) {
    case diff < minute:
      return formatUnit("second", Math.round(diff / 1000));
    case diff < hour:
      return formatUnit("minute", Math.round(diff / minute));
    case diff < day:
      return formatUnit("hour", Math.round(diff / hour));
    case diff < month:
      return formatUnit("day", Math.round(diff / day));
    case diff < year:
      return formatUnit("month", Math.round(diff / month));
    case diff > year:
      return formatUnit("year", Math.round(diff / year));
    default:
      return "";
  }
}

function formatUnit(unit: string, value: number) {
  return `${value} ${value === 1 ? unit : `${unit}s`} ago`;
}

const NO_MODIFIER_MAX = 8;
const SLIGHTLY_MAX = 25;
const VERY_MIN = 75;

export function formatMood(goose: { name: string; mood: { x: number; y: number } }) {
  let mood = `${goose.name} is `;
  if (Math.abs(goose.mood.y) > NO_MODIFIER_MAX) {
    mood += goose.mood.y < -20 && goose.mood.y >= -80 ? "an " : "a ";
    mood += Math.abs(goose.mood.y) > VERY_MIN ? "very " : Math.abs(goose.mood.y) < SLIGHTLY_MAX ? "slightly " : "";
    mood += goose.mood.y < 0 ? "ungripped" : "gripped";
  } else {
    mood += "a";
  }

  if (Math.abs(goose.mood.y) > NO_MODIFIER_MAX && Math.abs(goose.mood.x) > NO_MODIFIER_MAX) {
    mood += ",";
  }

  if (Math.abs(goose.mood.x) > NO_MODIFIER_MAX) {
    mood += Math.abs(goose.mood.x) > VERY_MIN ? " very" : Math.abs(goose.mood.x) < SLIGHTLY_MAX ? " slightly" : "";
    mood += goose.mood.x > 0 ? " silly" : " grumpy";
  }

  mood += " goose";
  return mood;
}
