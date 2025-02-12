import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Task {
  id: string;
  text: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: string;
}

export interface Journal {
  id: string;
  text: string;
  createdAt: string;
}

const TASKS_KEY = '@jouta_tasks';
const JOURNALS_KEY = '@jouta_journals';

export const storage = {
  // Task operations
  async saveTasks(tasks: Task[]): Promise<void> {
    try {
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  },

  async getTasks(): Promise<Task[]> {
    try {
      const tasksJson = await AsyncStorage.getItem(TASKS_KEY);
      return tasksJson ? JSON.parse(tasksJson) : [];
    } catch (error) {
      console.error('Error getting tasks:', error);
      return [];
    }
  },

  async addTask(task: Task): Promise<void> {
    try {
      const tasks = await this.getTasks();
      tasks.push(task);
      await this.saveTasks(tasks);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  },

  async updateTask(updatedTask: Task): Promise<void> {
    try {
      const tasks = await this.getTasks();
      const index = tasks.findIndex(task => task.id === updatedTask.id);
      if (index !== -1) {
        tasks[index] = updatedTask;
        await this.saveTasks(tasks);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  },

  async deleteTask(taskId: string): Promise<void> {
    try {
      const tasks = await this.getTasks();
      const filteredTasks = tasks.filter(task => task.id !== taskId);
      await this.saveTasks(filteredTasks);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  },

  // Journal operations
  async saveJournals(journals: Journal[]): Promise<void> {
    try {
      await AsyncStorage.setItem(JOURNALS_KEY, JSON.stringify(journals));
    } catch (error) {
      console.error('Error saving journals:', error);
    }
  },

  async getJournals(): Promise<Journal[]> {
    try {
      const journalsJson = await AsyncStorage.getItem(JOURNALS_KEY);
      return journalsJson ? JSON.parse(journalsJson) : [];
    } catch (error) {
      console.error('Error getting journals:', error);
      return [];
    }
  },

  async addJournal(journal: Journal): Promise<void> {
    try {
      const journals = await this.getJournals();
      journals.push(journal);
      await this.saveJournals(journals);
    } catch (error) {
      console.error('Error adding journal:', error);
    }
  },

  async deleteJournal(journalId: string): Promise<void> {
    try {
      const journals = await this.getJournals();
      const filteredJournals = journals.filter(journal => journal.id !== journalId);
      await this.saveJournals(filteredJournals);
    } catch (error) {
      console.error('Error deleting journal:', error);
    }
  },
}; 