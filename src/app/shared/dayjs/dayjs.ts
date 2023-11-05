import * as dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import minMax from 'dayjs/plugin/minMax';
import duration from 'dayjs/plugin/duration';

dayjs.extend(isBetween);
dayjs.extend(minMax);
dayjs.extend(duration);

export default dayjs;
