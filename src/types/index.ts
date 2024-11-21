export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  timeRemaining?: number;
  startTime?: string;
  completedAt?: string;
  category?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  color: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  tags: string[];
}

export interface DragItem {
  type: string;
  id: string;
  index: number;
}

export type TaskPriority = 'low' | 'medium' | 'high';
export type ViewMode = 'grid' | 'list';
export type SortBy = 'date' | 'priority' | 'category';
export type TabType = 'all' | 'today';
