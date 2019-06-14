import { Event, Task, ScheduledTask } from 'klasa';

export default class extends Event {
    public run(scheduledTask: ScheduledTask, task: Task, error: any): void {
        this.client.emit('wtf', `[TASK] ${task.path}\n${error ?
            error.stack ? error.stack : error : 'Unknown error'}`);
    }
}