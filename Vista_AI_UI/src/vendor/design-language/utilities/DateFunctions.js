export const FormatNowUTC = () => new Date().toISOString();

export const OffsetDaysUTC = (dateOrDays = 0, daysOffset = 0) => {
  let baseDate = new Date();
  let offset = 0;

  if (typeof dateOrDays === 'number') {
    offset = dateOrDays;
  } else if (typeof dateOrDays === 'string') {
    const parsed = new Date(dateOrDays);
    if (!isNaN(parsed.getTime())) {
      baseDate = parsed;
    }
    offset = typeof daysOffset === 'number' ? daysOffset : 0;
  } else if (dateOrDays instanceof Date && !isNaN(dateOrDays.getTime())) {
    baseDate = new Date(dateOrDays.getTime());
    offset = typeof daysOffset === 'number' ? daysOffset : 0;
  } else {
    offset = typeof daysOffset === 'number' ? daysOffset : 0;
  }

  if (isNaN(baseDate.getTime())) {
    baseDate = new Date();
  }

  baseDate.setDate(baseDate.getDate() + offset);
  return isNaN(baseDate.getTime()) ? new Date().toISOString() : baseDate.toISOString();
};

export default { FormatNowUTC, OffsetDaysUTC };
