import { default as dayjs } from 'dayjs';

export const formatDate = (date: number) => {
    const formattedDate = dayjs(date).format('MMMM D, YYYY h:mm A');
    return formattedDate;
}
