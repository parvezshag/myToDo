import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';

export class NotificationService {
  private static instance: NotificationService;
  private permissionGranted = false;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async init(): Promise<void> {
    let granted = await isPermissionGranted();
    if (!granted) {
      const permission = await requestPermission();
      granted = permission === 'granted';
    }
    this.permissionGranted = granted;
  }

  async notify(title: string, body?: string): Promise<void> {
    if (!this.permissionGranted) return;
    sendNotification({ title, body });
  }

  async notifyTaskOverdue(taskTitle: string): Promise<void> {
    await this.notify('Task Overdue', `"${taskTitle}" is overdue!`);
  }

  async notifyDueSoon(taskTitle: string, minutes: number): Promise<void> {
    await this.notify('Due Soon', `"${taskTitle}" is due in ${minutes} minutes`);
  }

  async notifyDailyReminder(taskCount: number): Promise<void> {
    await this.notify('Daily Reminder', `You have ${taskCount} tasks for today`);
  }

  async notifyMorningSummary(todoCount: number, inProgressCount: number): Promise<void> {
    await this.notify(
      'Good Morning!',
      `Todo: ${todoCount} | In Progress: ${inProgressCount}`
    );
  }

  async notifyEveningSummary(completedToday: number): Promise<void> {
    await this.notify(
      'Evening Summary',
      `You completed ${completedToday} tasks today!`
    );
  }

  async notifyTaskCompleted(taskTitle: string): Promise<void> {
    await this.notify('Congratulations!', `"${taskTitle}" completed!`);
  }
}
