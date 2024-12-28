'use client'

import React, { useState, useEffect, useRef } from 'react'
import { PlusCircle, Clock, Calendar, Bell, Search, LineChart as LineChartIcon, CheckSquare, Tag, MoreVertical, Timer, AlertCircle, Filter, Trash2, Sun, Moon, BookOpen, Briefcase, Paperclip, Users, Flag, Hash, FileText, Mic, Brain, Download, Upload, Focus, ChevronLeft, ChevronRight, LayoutGrid, List } from 'lucide-react'
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Textarea } from "./components/ui/textarea"
import { Checkbox } from "./components/ui/checkbox"
import { Switch } from "./components/ui/switch"
import { Label } from "./components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select"
import { Calendar as CalendarComponent } from "./components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./components/ui/popover"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu"
import { Progress } from "./components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import { Badge } from "./components/ui/badge"
import { Slider } from "./components/ui/slider"
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { v4 as uuidv4 } from 'uuid'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { cn } from "./lib/utils"
import { supabase } from './lib/supabase'
import { useAuth } from './contexts/AuthContext'

// Simulated AI service
const aiService = {
  getSuggestions: (tasks) => new Promise(resolve => setTimeout(() => resolve([
    "Consider breaking down Task A into smaller subtasks for better management",
    "Task B is due soon. You might want to prioritize it",
    "You've been most productive in the mornings. Try scheduling important tasks then"
  ]), 1000)),
}

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  timeRemaining?: number; // in seconds
  startTime?: string;
  completedAt?: string;
  category?: string;
  color?: string;
  subtasks: Subtask[];
  progress: number;
}

interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

interface Note {
  id: string
  title: string
  content: string
  date: string
  color: string
  category?: string
  priority?: 'low' | 'medium' | 'high'
  tags?: string[]
}

interface AdvancedTaskFlowProps {
  userId: string
}

const AdvancedTaskFlow: React.FC<AdvancedTaskFlowProps> = ({ userId }) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [date, setDate] = useState(new Date())
  const [activeTab, setActiveTab] = useState('all')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [aiSuggestions, setAiSuggestions] = useState([])
  const [isRecording, setIsRecording] = useState(false)
  const [isDescriptionRecording, setIsDescriptionRecording] = useState(false)
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [notesView, setNotesView] = useState<'grid' | 'list'>('grid')
  const [notesSortBy, setNotesSortBy] = useState<'date' | 'priority' | 'category'>('date')
  const [notesFilter, setNotesFilter] = useState<string>('all')
  const [timers, setTimers] = useState<{ [key: string]: NodeJS.Timeout }>({})
  const [showAnalytics, setShowAnalytics] = useState(false)

  const { signOut } = useAuth()

  useEffect(() => {
    loadUserData()
  }, [userId])

  const loadUserData = async () => {
    try {
      // Load tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (tasks) setTasks(tasks)

      // Load notes
      const { data: notes } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (notes) setNotes(notes)
    } catch (error) {
      console.error('Error loading user data:', error)
      toast.error('Failed to load your data')
    }
  }

  const addTask = async (task: Task) => {
    try {
      const taskData = {
        title: task.title,
        description: task.description,
        due_date: task.dueDate,
        completed: task.completed,
        priority: task.priority,
        time_remaining: task.timeRemaining,
        start_time: task.startTime,
        completed_at: task.completedAt,
        category: task.category,
        color: task.color,
        subtasks: task.subtasks || [],
        progress: task.progress,
        user_id: userId
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single()

      if (error) throw error

      // Convert snake_case back to camelCase for the frontend
      const formattedData = {
        ...data,
        dueDate: data.due_date,
        timeRemaining: data.time_remaining,
        startTime: data.start_time,
        completedAt: data.completed_at,
      }

      setTasks(prev => [formattedData, ...prev])
      toast.success('Task added successfully')
    } catch (error) {
      console.error('Error adding task:', error)
      toast.error('Failed to add task')
    }
  }

  const addNote = async (note: Note) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{ ...note, user_id: userId }])
        .select()
        .single()

      if (error) throw error

      setNotes(prev => [data, ...prev])
      toast.success('Note added successfully')
    } catch (error) {
      console.error('Error adding note:', error)
      toast.error('Failed to add note')
    }
  }

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      // Convert camelCase to snake_case for the database
      const taskUpdates = {
        ...updates,
        due_date: updates.dueDate ? new Date(updates.dueDate).toISOString() : null,
        start_time: updates.startTime ? new Date(updates.startTime).toISOString() : null,
        completed_at: updates.completedAt ? new Date(updates.completedAt).toISOString() : null,
      }

      // Remove camelCase properties
      delete taskUpdates.dueDate;
      delete taskUpdates.startTime;
      delete taskUpdates.completedAt;

      const { error } = await supabase
        .from('tasks')
        .update(taskUpdates)
        .eq('id', taskId)
        .eq('user_id', userId)

      if (error) throw error

      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t))
      toast.success('Task updated successfully')
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Failed to update task')
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', userId)

      if (error) throw error

      setTasks(prev => prev.filter(t => t.id !== taskId))
      toast.success('Task deleted successfully')
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Failed to delete task')
    }
  }

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', userId)

      if (error) throw error

      setNotes(prev => prev.filter(n => n.id !== noteId))
      toast.success('Note deleted successfully')
    } catch (error) {
      console.error('Error deleting note:', error)
      toast.error('Failed to delete note')
    }
  }

  const [newTask, setNewTask] = useState({
    id: '',
    title: '',
    description: '',
    priority: 'medium',
    category: '',
    color: 'bg-card',
    dueDate: '',
    timeEstimate: 0,
    subtasks: [],
    completed: false,
    progress: 0,
  })

  const noteColors = [
    { name: 'Default', value: 'bg-card' },
    { name: 'Rose', value: 'bg-rose-50 dark:bg-rose-900/20' },
    { name: 'Blue', value: 'bg-blue-50 dark:bg-blue-900/20' },
    { name: 'Green', value: 'bg-green-50 dark:bg-green-900/20' },
    { name: 'Purple', value: 'bg-purple-50 dark:bg-purple-900/20' },
    { name: 'Yellow', value: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { name: 'Orange', value: 'bg-orange-50 dark:bg-orange-900/20' },
  ]

  const noteCategories = [
    'Personal',
    'Work',
    'Ideas',
    'Tasks',
    'Important',
    'Archive'
  ]

  const taskColors = [
    { name: 'Default', value: 'bg-card' },
    { name: 'Red', value: 'bg-red-100 dark:bg-red-900/20' },
    { name: 'Green', value: 'bg-green-100 dark:bg-green-900/20' },
    { name: 'Blue', value: 'bg-blue-100 dark:bg-blue-900/20' },
    { name: 'Yellow', value: 'bg-yellow-100 dark:bg-yellow-900/20' },
    { name: 'Purple', value: 'bg-purple-100 dark:bg-purple-900/20' },
  ]

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])

  useEffect(() => {
    // Fetch AI suggestions
    aiService.getSuggestions(tasks).then(setAiSuggestions)
  }, [tasks])

  // Function to update time remaining
  const updateTimeRemaining = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId && task.timeRemaining && task.timeRemaining > 0) {
          return { ...task, timeRemaining: task.timeRemaining - 1 }
        }
        return task
      })
    )
  }

  // Start timer for task
  const startTaskTimer = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (task && task.timeRemaining && task.timeRemaining > 0) {
      const timer = setInterval(() => updateTimeRemaining(taskId), 1000)
      setTimers(prev => ({ ...prev, [taskId]: timer }))
    }
  }

  // Clear timer for task
  const clearTaskTimer = (taskId: string) => {
    if (timers[taskId]) {
      clearInterval(timers[taskId])
      setTimers(prev => {
        const newTimers = { ...prev }
        delete newTimers[taskId]
        return newTimers
      })
    }
  }

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    const taskToAdd = {
      id: uuidv4(),
      title: newTask.title,
      description: newTask.description,
      due_date: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : null,
      completed: false,
      priority: newTask.priority || 'medium',
      time_remaining: newTask.timeRemaining || 0,
      start_time: null,
      completed_at: null,
      category: newTask.category || '',
      color: newTask.color || 'bg-card',
      subtasks: [],
      progress: 0,
    }

    addTask(taskToAdd)
    setNewTask({
      id: '',
      title: '',
      description: '',
      dueDate: '',
      completed: false,
      priority: 'medium',
      timeRemaining: 0,
      startTime: null,
      completedAt: null,
      category: '',
      color: 'bg-card',
      subtasks: [],
      progress: 0,
    })
    setIsDialogOpen(false)
    toast.success('Task created successfully!')
  }

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    const taskToAdd = {
      id: uuidv4(),
      title: newTask.title,
      description: newTask.description,
      dueDate: newTask.dueDate,
      completed: false,
      priority: newTask.priority,
      timeRemaining: newTask.timeRemaining,
      startTime: null,
      completedAt: null,
      category: newTask.category,
      color: newTask.color,
      subtasks: [],
      progress: 0
    }

    if (editingTask) {
      handleUpdateTask(taskToAdd.id, taskToAdd)
    } else {
      addTask(taskToAdd)
    }
    setNewTask({
      id: '',
      title: '',
      description: '',
      dueDate: '',
      completed: false,
      priority: 'medium',
      timeRemaining: 0,
      startTime: null,
      completedAt: null,
      category: '',
      color: 'bg-card',
      subtasks: [],
      progress: 0
    })
    setIsDialogOpen(false)
    toast.success(editingTask ? 'Task updated successfully!' : 'Task created successfully!')
  }

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    const updatedTask = {
      ...updates,
      due_date: updates.dueDate ? new Date(updates.dueDate).toISOString() : null,
      start_time: updates.startTime ? new Date(updates.startTime).toISOString() : null,
      completed_at: updates.completedAt ? new Date(updates.completedAt).toISOString() : null,
    }
    updateTask(taskId, updatedTask)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewTask(prev => ({ ...prev, [name]: value }))
  }

  const handleDeleteTask = (id) => {
    deleteTask(id)
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setNewTask(task)
    setIsDialogOpen(true)
  }

  const handleToggleComplete = (id) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed, progress: task.completed ? 0 : 100 } : task
    ))
  }

  const handleAddSubtask = () => {
    setNewTask(prev => ({
      ...prev,
      subtasks: [...prev.subtasks, { id: uuidv4(), text: '', completed: false }]
    }))
  }

  const handleSubtaskChange = (id, field, value) => {
    setNewTask(prev => ({
      ...prev,
      subtasks: prev.subtasks.map(subtask => 
        subtask.id === id ? { ...subtask, [field]: value } : subtask
      )
    }))
  }

  const handleToggleSubtask = (taskId, subtaskId) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? {
        ...task,
        subtasks: task.subtasks.map(subtask => 
          subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
        ),
        progress: calculateTaskProgress(task.subtasks.map(subtask => 
          subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
        ))
      } : task
    ))
  }

  const calculateTaskProgress = (subtasks) => {
    if (subtasks.length === 0) return 0
    const completedSubtasks = subtasks.filter(subtask => subtask.completed).length
    return Math.round((completedSubtasks / subtasks.length) * 100)
  }

  const handleVoiceInput = (field) => {
    if (field === 'title') {
      setIsRecording(true)
    } else if (field === 'description') {
      setIsDescriptionRecording(true)
    }
    
    // Simulated voice recognition
    setTimeout(() => {
      const recognizedText = field === 'title' ? "Voice recorded task title" : "This is a voice recorded task description."
      setNewTask(prev => ({ ...prev, [field]: recognizedText }))
      if (field === 'title') {
        setIsRecording(false)
      } else if (field === 'description') {
        setIsDescriptionRecording(false)
      }
      toast.success(`Voice input recorded for ${field}`)
    }, 2000)
  }

  const handleCreateNote = ({ title, content }: { title: string; content: string }) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title,
      content,
      date: new Date().toLocaleDateString(),
      color: editingNote?.color || 'bg-card',
      category: editingNote?.category || 'Personal',
      priority: editingNote?.priority || 'medium',
      tags: editingNote?.tags || []
    }
    addNote(newNote)
    setEditingNote(null)
    toast.success('Note created successfully!')
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setNoteDialogOpen(true)
  }

  const handleUpdateNote = ({ title, content }: { title: string; content: string }) => {
    if (!editingNote) return
    updateNote(editingNote.id, { title, content })
    setEditingNote(null)
    toast.success('Note updated successfully!')
  }

  const handleDeleteNote = (id: string) => {
    deleteNote(id)
  }

  const updateNote = async (noteId: string, updates: Partial<Note>) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', noteId)
        .eq('user_id', userId)

      if (error) throw error

      setNotes(prev => prev.map(n => n.id === noteId ? { ...n, ...updates } : n))
      toast.success('Note updated successfully')
    } catch (error) {
      console.error('Error updating note:', error)
      toast.error('Failed to update note')
    }
  }

  const TaskItem = ({ task, index, moveTask }) => {
    const formatDate = (dateString: string | null | undefined) => {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? '' : format(date, 'PPP');
      } catch (error) {
        console.error('Error formatting date:', error);
        return '';
      }
    };

    const getTimeRemaining = (dueDate: string | null | undefined) => {
      if (!dueDate) return '';
      try {
        const due = new Date(dueDate);
        if (isNaN(due.getTime())) return '';
        
        const now = new Date();
        const diff = due.getTime() - now.getTime();
        if (diff < 0) return 'Overdue';
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 0) return `${days}d ${hours}h`;
        return `${hours}h`;
      } catch (error) {
        console.error('Error calculating time remaining:', error);
        return '';
      }
    };

    const [{ isDragging }, drag] = useDrag({
      type: 'task',
      item: { id: task.id, index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    })

    const [, drop] = useDrop({
      accept: 'task',
      hover(item: { id: string; index: number }) {
        if (item.index !== index) {
          moveTask(item.index, index)
          item.index = index
        }
      },
    })

    return (
      <div
        ref={(node) => drag(drop(node))}
        className={cn(
          "group relative rounded-xl border p-4 shadow-lg transition-all duration-200 hover:shadow-lg hover:translate-y-[-1px]",
          task.color || "bg-card",
          "backdrop-blur-md bg-opacity-90"
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => handleToggleComplete(task.id)}
            />
            <div>
              <h3 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>{task.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
              
              {/* Subtasks */}
              <div className="mt-4 space-y-2">
                {task.subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={subtask.completed}
                      onCheckedChange={() => handleToggleSubtask(task.id, subtask.id)}
                    />
                    <span className={`text-sm ${
                      subtask.completed ? 'text-muted-foreground line-through' : ''
                    }`}>
                      {subtask.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{task.progress}%</span>
                </div>
                <Progress value={task.progress} className="w-full" />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => handleEditTask(task)}>
              <AlertCircle className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)}>
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="text-muted-foreground">Due {formatDate(task.dueDate)}</span>
            <span className="text-muted-foreground">Est. {task.timeEstimate} min</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className={`
              ${task.priority === 'high' ? 'bg-red-500' : 
                task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'} text-white
            `}>
              {task.priority}
            </Badge>
            <Badge variant="outline">{task.category}</Badge>
          </div>
        </div>
      </div>
    )
  }

  const moveTask = (dragIndex, hoverIndex) => {
    const draggedTask = tasks[dragIndex]
    setTasks(prevTasks => {
      const updatedTasks = [...prevTasks]
      updatedTasks.splice(dragIndex, 1)
      updatedTasks.splice(hoverIndex, 0, draggedTask)
      return updatedTasks
    })
  }

  // Analytics data calculations
  const getTaskAnalytics = () => {
    const now = new Date()
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek)
      date.setDate(date.getDate() + i)
      return date.toISOString().split('T')[0]
    })

    // Tasks by priority
    const tasksByPriority = {
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length,
    }

    // Tasks by completion status
    const tasksByStatus = {
      completed: tasks.filter(t => t.completed).length,
      pending: tasks.filter(t => !t.completed).length,
    }

    // Tasks completed per day
    const tasksPerDay = last7Days.map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      completed: tasks.filter(t => t.completedAt?.split('T')[0] === date).length,
      created: tasks.filter(t => t.startTime?.split('T')[0] === date).length,
    }))

    // Time remaining distribution
    const timeDistribution = tasks
      .filter(t => t.timeRemaining && t.timeRemaining > 0)
      .map(t => ({
        name: t.title,
        value: t.timeRemaining,
      }))

    return {
      tasksByPriority,
      tasksByStatus,
      tasksPerDay,
      timeDistribution,
    }
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
        <div className="bg-background text-foreground">
          <ToastContainer />
          {/* Top Navigation */}
          <nav className="border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <div className="flex items-center">
                  <Button variant="ghost" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="mr-2 lg:hidden">
                    {isSidebarOpen ? <ChevronLeft /> : <ChevronRight />}
                  </Button>
                  <h1 className="text-2xl font-bold">Advanced TaskFlow</h1>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="relative hidden md:block">
                    <Input
                      type="text"
                      placeholder="Search tasks..."
                      className="w-64 pl-10"
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                  
                  <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                  </Button>
                  
                  <Switch
                    checked={isDarkMode}
                    onCheckedChange={setIsDarkMode}
                    className="ml-4"
                  >
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                  </Switch>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={signOut}>
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </nav>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Sidebar */}
              <div className={`w-full lg:w-64 flex-shrink-0 ${isSidebarOpen ? 'block' : 'hidden'} lg:block`}>
                <div className="bg-card text-card-foreground rounded-xl p-4 shadow-sm">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <PlusCircle className="h-5 w-5 mr-2" />
                        New Task
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">
                          {editingTask ? 'Edit Task' : 'Create New Task'}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                              id="title"
                              name="title"
                              value={newTask.title}
                              onChange={handleInputChange}
                              className="w-full"
                              placeholder="Enter task title"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              name="description"
                              value={newTask.description}
                              onChange={handleInputChange}
                              className="w-full min-h-[100px]"
                              placeholder="Enter task description"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="priority">Priority</Label>
                              <Select
                                name="priority"
                                value={newTask.priority}
                                onValueChange={(value) => handleInputChange({ target: { name: 'priority', value } })}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="category">Category</Label>
                              <Select
                                name="category"
                                value={newTask.category}
                                onValueChange={(value) => handleInputChange({ target: { name: 'category', value } })}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="work">Work</SelectItem>
                                  <SelectItem value="personal">Personal</SelectItem>
                                  <SelectItem value="shopping">Shopping</SelectItem>
                                  <SelectItem value="health">Health</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="dueDate">Due Date</Label>
                              <Input
                                id="dueDate"
                                name="dueDate"
                                type="datetime-local"
                                value={newTask.dueDate}
                                onChange={handleInputChange}
                                className="w-full"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="color">Color</Label>
                              <Select
                                name="color"
                                value={newTask.color}
                                onValueChange={(value) => handleInputChange({ target: { name: 'color', value } })}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select color" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="bg-card">Default</SelectItem>
                                  <SelectItem value="bg-blue-50">Blue</SelectItem>
                                  <SelectItem value="bg-green-50">Green</SelectItem>
                                  <SelectItem value="bg-yellow-50">Yellow</SelectItem>
                                  <SelectItem value="bg-red-50">Red</SelectItem>
                                  <SelectItem value="bg-purple-50">Purple</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Subtasks</Label>
                            <div className="space-y-2">
                              {newTask.subtasks.map((subtask, index) => (
                                <div key={subtask.id} className="flex items-center gap-2">
                                  <Input
                                    value={subtask.text}
                                    onChange={(e) => handleSubtaskChange(subtask.id, 'text', e.target.value)}
                                    placeholder={`Subtask ${index + 1}`}
                                    className="flex-1"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setNewTask(prev => ({
                                        ...prev,
                                        subtasks: prev.subtasks.filter(st => st.id !== subtask.id)
                                      }))
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={handleAddSubtask}
                              >
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Add Subtask
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <DialogFooter className="sm:justify-end">
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" form="task-form" onClick={handleAddTask}>
                          {editingTask ? 'Save Changes' : 'Create Task'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <div className="mt-6 space-y-2">
                    <Button 
                      onClick={() => setActiveTab('all')}
                      variant={activeTab === 'all' ? 'secondary' : 'ghost'}
                      className="w-full justify-start"
                    >
                      <CheckSquare className="h-5 w-5 mr-3" />
                      All Tasks
                    </Button>
                    
                    <Button 
                      onClick={() => setActiveTab('today')}
                      variant={activeTab === 'today' ? 'secondary' : 'ghost'}
                      className="w-full justify-start"
                    >
                      <Clock className="h-5 w-5 mr-3" />
                      Today
                    </Button>

                    <Button 
                      onClick={() => setActiveTab('upcoming')}
                      variant={activeTab === 'upcoming' ? 'secondary' : 'ghost'}
                      className="w-full justify-start"
                    >
                      <Calendar className="h-5 w-5 mr-3" />
                      Upcoming
                    </Button>

                    <Button 
                      onClick={() => setActiveTab('analytics')}
                      variant={activeTab === 'analytics' ? 'secondary' : 'ghost'}
                      className="w-full justify-start"
                    >
                      <LineChartIcon className="h-5 w-5 mr-3" />
                      Analytics
                    </Button>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-sm font-medium text-muted-foreground px-3 mb-2">Categories</h3>
                    <div className="space-y-2">
                      <Button variant="ghost" className="w-full justify-between">
                        <div className="flex items-center">
                          <BookOpen className="h-5 w-5 text-blue-500 mr-3" />
                          Study
                        </div>
                        <span className="text-xs bg-muted px-2 py-1 rounded-full">{tasks.filter(task => task.category === 'study').length}</span>
                      </Button>
                      <Button variant="ghost" className="w-full justify-between">
                        <div className="flex items-center">
                          <Briefcase className="h-5 w-5 text-green-500 mr-3" />
                          Work
                        </div>
                        <span className="text-xs bg-muted px-2 py-1 rounded-full">{tasks.filter(task => task.category === 'work').length}</span>
                      </Button>
                      <Button variant="ghost" className="w-full justify-between">
                        <div className="flex items-center">
                          <Tag className="h-5 w-5 text-yellow-500 mr-3" />
                          Personal
                        </div>
                        <span className="text-xs bg-muted px-2 py-1 rounded-full">{tasks.filter(task => task.category === 'personal').length}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1">
                <div className="container mx-auto p-6">
                  {/* Notes Section */}
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex flex-col sm:flex-row items-start gap-4">
                        <h2 className="text-2xl font-semibold">My Notes</h2>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setNotesView('grid')}
                            className={cn(
                              "h-8 w-8",
                              notesView === 'grid' && "bg-primary/10 text-primary"
                            )}
                          >
                            <LayoutGrid className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setNotesView('list')}
                            className={cn(
                              "h-8 w-8",
                              notesView === 'list' && "bg-primary/10 text-primary"
                            )}
                          >
                            <List className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          setEditingNote({
                            id: '',
                            title: '',
                            content: '',
                            date: new Date().toLocaleDateString(),
                            color: 'bg-card',
                            category: 'Personal',
                            priority: 'medium',
                            tags: []
                          })
                          setNoteDialogOpen(true)
                        }}
                        className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        <PlusCircle className="h-4 w-4" />
                        Add Note
                      </Button>
                    </div>

                    <div className={cn(
                      "mt-6",
                      notesView === 'grid'
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4"
                        : "flex flex-col space-y-4"
                    )}>
                      {notes.map((note) => (
                        <div
                          key={note.id}
                          className={cn(
                            "group relative rounded-xl border p-5 shadow-sm transition-all duration-200",
                            "hover:shadow-md hover:border-primary/20",
                            note.color || "bg-card",
                            "bg-opacity-95",
                            notesView === 'list' && "flex items-start gap-6"
                          )}
                        >
                          <div className={cn(
                            "flex-1 h-full",
                            notesView === 'list' ? "flex items-start gap-6" : "flex flex-col"
                          )}>
                            <div className={cn(
                              "flex-1",
                              notesView === 'list' && "max-w-[70%]"
                            )}>
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                {note.priority && (
                                  <span className={cn(
                                    "px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                                    note.priority === 'high' && "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
                                    note.priority === 'medium' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
                                    note.priority === 'low' && "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                  )}>
                                    {note.priority}
                                  </span>
                                )}
                                {note.category && (
                                  <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs font-medium">
                                    {note.category}
                                  </span>
                                )}
                              </div>
                              <h3 className="text-lg font-semibold leading-tight mb-2.5 line-clamp-2">{note.title}</h3>
                              <p className="mb-4 text-sm text-muted-foreground line-clamp-3">{note.content}</p>
                            </div>
                            
                            <div className={cn(
                              "mt-auto",
                              notesView === 'list' && "flex-1"
                            )}>
                              {note.tags && note.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                  {note.tags.map((tag, index) => (
                                    <span
                                      key={index}
                                      className="bg-primary/5 hover:bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full font-medium transition-colors"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <p>{note.date}</p>
                                <div className="flex gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg hover:bg-primary/5 hover:text-primary"
                                    onClick={() => handleEditNote(note)}
                                  >
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => handleDeleteNote(note.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {notes.length === 0 && (
                      <div className="mt-12 text-center">
                        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                          <FileText className="h-10 w-10 text-primary" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">No notes yet</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Start capturing your thoughts and ideas
                        </p>
                        <Button
                          onClick={() => {
                            setEditingNote({
                              id: '',
                              title: '',
                              content: '',
                              date: new Date().toLocaleDateString(),
                              color: 'bg-card',
                              tags: []
                            })
                            setNoteDialogOpen(true)
                          }}
                          className="mt-4"
                          variant="outline"
                        >
                          Create your first note
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Tasks Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-b from-background to-background/50 rounded-xl shadow-lg border border-border/50 backdrop-blur-sm">
                      <div className="p-4 border-b border-border/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                              {activeTab === 'today' ? "Today's Tasks" : 'All Tasks'}
                            </h2>
                            <p className="text-muted-foreground mt-1">Manage your daily tasks and projects</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className={cn(
                                "transition-all duration-300",
                                activeTab === 'all' && "bg-primary text-primary-foreground hover:bg-primary/90"
                              )}
                              onClick={() => setActiveTab('all')}
                            >
                              All
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className={cn(
                                "transition-all duration-300",
                                activeTab === 'today' && "bg-primary text-primary-foreground hover:bg-primary/90"
                              )}
                              onClick={() => setActiveTab('today')}
                            >
                              Today
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                        {tasks.map((task, index) => (
                          <TaskItem key={task.id} task={task} index={index} moveTask={moveTask} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Analytics Toggle Button */}
                  <Button
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    className="mb-6 bg-primary hover:bg-primary/90"
                  >
                    {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
                  </Button>

                  {/* Analytics Dashboard */}
                  {showAnalytics && (
                    <div className="mb-8 bg-gradient-to-b from-background to-background/50 p-6 rounded-xl backdrop-blur-sm shadow-lg border border-border/50">
                      <div className="mb-6">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                          Analytics Dashboard
                        </h2>
                        <p className="text-muted-foreground mt-1">Comprehensive task analysis and insights</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Tasks by Priority */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Tasks by Priority</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="h-[300px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={[
                                      { name: 'High', value: getTaskAnalytics().tasksByPriority.high },
                                      { name: 'Medium', value: getTaskAnalytics().tasksByPriority.medium },
                                      { name: 'Low', value: getTaskAnalytics().tasksByPriority.low },
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                  >
                                    {getTaskAnalytics().tasksByPriority && Object.values(getTaskAnalytics().tasksByPriority).map((_, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                  </Pie>
                                  <Tooltip />
                                  <Legend />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Task Completion Status */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Completion Status</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="h-[300px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={[
                                    { name: 'Completed', value: getTaskAnalytics().tasksByStatus.completed },
                                    { name: 'Pending', value: getTaskAnalytics().tasksByStatus.pending },
                                  ]}
                                >
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="name" />
                                  <YAxis />
                                  <Tooltip />
                                  <Legend />
                                  <Bar dataKey="value" fill="#8884d8">
                                    <Cell fill="#00C49F" />
                                    <Cell fill="#FF8042" />
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Tasks Per Day */}
                        <Card className="md:col-span-2">
                          <CardHeader>
                            <CardTitle>Task Activity (Last 7 Days)</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="h-[300px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={getTaskAnalytics().tasksPerDay}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="date" />
                                  <YAxis />
                                  <Tooltip />
                                  <Legend />
                                  <Area
                                    type="monotone"
                                    dataKey="completed"
                                    stackId="1"
                                    stroke="#00C49F"
                                    fill="#00C49F"
                                    fillOpacity={0.6}
                                  />
                                  <Area
                                    type="monotone"
                                    dataKey="created"
                                    stackId="2"
                                    stroke="#0088FE"
                                    fill="#0088FE"
                                    fillOpacity={0.6}
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Time Distribution */}
                        <Card className="md:col-span-2">
                          <CardHeader>
                            <CardTitle>Time Remaining Distribution</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="h-[300px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={getTaskAnalytics().timeDistribution}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="name" />
                                  <YAxis />
                                  <Tooltip />
                                  <Legend />
                                  <Bar dataKey="value" fill="#8884d8">
                                    {getTaskAnalytics().timeDistribution.map((_, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}

                  {/* Rest of the components */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent className="sm:max-w-[525px] h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingNote ? "Edit Note" : "Create Note"}</DialogTitle>
            <DialogDescription>
              {editingNote ? "Edit your note details below." : "Create a new note with a title and content."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 overflow-y-auto flex-grow pr-2">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Note title"
                value={editingNote?.title || ""}
                onChange={(e) => setEditingNote(prev => prev ? {...prev, title: e.target.value} : {
                  id: crypto.randomUUID(),
                  title: e.target.value,
                  content: '',
                  date: new Date().toLocaleDateString(),
                  color: 'bg-card',
                  tags: []
                })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {noteColors.map((color) => (
                  <Button
                    key={color.value}
                    variant="outline"
                    size="icon"
                    className={cn(
                      "h-8 w-8 rounded-full",
                      color.value,
                      editingNote?.color === color.value && "ring-2 ring-primary"
                    )}
                    onClick={() => setEditingNote(prev => prev ? {...prev, color: color.value} : null)}
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Category</Label>
              <Select
                value={editingNote?.category || ''}
                onValueChange={(value) => setEditingNote(prev => prev ? {...prev, category: value} : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {noteCategories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Priority</Label>
              <Select
                value={editingNote?.priority || ''}
                onValueChange={(value: 'low' | 'medium' | 'high') => 
                  setEditingNote(prev => prev ? {...prev, priority: value} : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Write your note here..."
                value={editingNote?.content || ""}
                onChange={(e) => setEditingNote(prev => prev ? {...prev, content: e.target.value} : null)}
                className="min-h-[150px]"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="Enter tags..."
                value={editingNote?.tags?.join(', ') || ''}
                onChange={(e) => {
                  const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  setEditingNote(prev => prev ? {...prev, tags} : null)
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={() => {
                if (editingNote) {
                  if (editingNote.id) {
                    handleUpdateNote(editingNote)
                  } else {
                    handleCreateNote(editingNote)
                  }
                }
                setNoteDialogOpen(false)
              }}
              className="bg-primary hover:bg-primary/90"
            >
              {editingNote?.id ? "Save Changes" : "Create Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DndProvider>
  )
}

export default AdvancedTaskFlow