export const formatArabicDate = (dateString: string) => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    calendar: 'gregory' // التأكد من استخدام التقويم الميلادي
  };
  return date.toLocaleDateString('ar-EG', options);
};