import { addDays, daysBetween } from './date';
import type { Task } from '@/features/records/schemas';
export function timelineBar(
  task: Pick<Task, 'start_date' | 'due_date'>,
  start: string,
  end: string,
) {
  const taskStart = task.start_date || task.due_date;
  if (task.due_date < start || taskStart > end) return null;
  const days = daysBetween(start, end) + 1;
  const left = Math.max(0, daysBetween(start, taskStart));
  const right = Math.min(days, daysBetween(start, task.due_date) + 1);
  return {
    left: (left / days) * 100,
    width: ((right - left) / days) * 100,
    clipped: taskStart < start || task.due_date > end,
  };
}
export function shiftSchedule(
  task: Pick<Task, 'start_date' | 'due_date'>,
  delta: number,
  resize = false,
) {
  const start = task.start_date || task.due_date;
  return resize
    ? {
        start_date: start,
        due_date: addDays(task.due_date, Math.max(delta, -daysBetween(start, task.due_date))),
      }
    : { start_date: addDays(start, delta), due_date: addDays(task.due_date, delta) };
}
export function scheduleConflicts(
  task: Pick<Task, 'start_date' | 'due_date' | 'dependencies'>,
  tasks: Task[],
) {
  return task.dependencies.filter((id) => {
    const dependency = tasks.find((item) => item.id === id);
    return !dependency || dependency.due_date >= (task.start_date || task.due_date);
  });
}
