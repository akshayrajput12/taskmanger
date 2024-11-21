'use client'

import React, { useState, useEffect, useRef } from 'react'
import { PlusCircle, Clock, Calendar, Bell, Search, LineChart as LineChartIcon, CheckSquare, Tag, MoreVertical, Timer, AlertCircle, Filter, Trash2, Sun, Moon, BookOpen, Briefcase, Paperclip, Users, Flag, Hash, FileText, Mic, Brain, Download, Upload, Focus, ChevronLeft, ChevronRight } from 'lucide-react'
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

export default function AdvancedTaskFlow() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [notes, setNotes] = useState<Note[]>(() => {
    const savedNotes = localStorage.getItem("notes")
    return savedNotes ? JSON.parse(savedNotes) : []
  })
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

  const [newTask, setNewTask] = useState({
    id: '',
    title: '',
    description: '',
    priority: 'medium',
    category: '',
    tags: [],
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

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])

  useEffect(() => {
    // Fetch AI suggestions
    aiService.getSuggestions(tasks).then(setAiSuggestions)
  }, [tasks])

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes))
  }, [notes])

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

  // Handle task creation with timer
  const handleCreateTask = (task: Partial<Task>) => {
    const timeInSeconds = task.dueDate ? 
      Math.floor((new Date(task.dueDate).getTime() - new Date().getTime()) / 1000) : 
      0

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: task.title || '',
      description: task.description || '',
      dueDate: task.dueDate || new Date().toISOString(),
      completed: false,
      priority: task.priority || 'medium',
      timeRemaining: timeInSeconds,
      startTime: new Date().toISOString()
    }

    setTasks(prev => [newTask, ...prev])
    startTaskTimer(newTask.id)
    toast.success('Task created successfully!')
  }

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      Object.values(timers).forEach(timer => clearInterval(timer))
    }
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewTask(prev => ({ ...prev, [name]: value }))
  }

  const handleAddTask = () => {
    if (newTask.title.trim() === '') return
    const taskToAdd = {
      ...newTask,
      id: editingTask ? editingTask.id : uuidv4(),
      progress: 0,
    }
    if (editingTask) {
      setTasks(prev => prev.map(task => task.id === editingTask.id ? taskToAdd : task))
    } else {
      setTasks(prev => [...prev, taskToAdd])
    }
    setNewTask({
      id: '',
      title: '',
      description: '',
      priority: 'medium',
      category: '',
      tags: [],
      dueDate: '',
      timeEstimate: 0,
      subtasks: [],
      completed: false,
      progress: 0,
    })
    setEditingTask(null)
    setIsDialogOpen(false)
  }

  const handleDeleteTask = (id) => {
    setTasks(prev => prev.filter(task => task.id !== id))
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
    setNotes(prev => [newNote, ...prev])
    setEditingNote(null)
    toast.success('Note created successfully!')
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setNoteDialogOpen(true)
  }

  const handleUpdateNote = ({ title, content }: { title: string; content: string }) => {
    if (!editingNote) return
    setNotes(prev =>
      prev.map((note) =>
        note.id === editingNote.id
          ? {
              ...editingNote,
              title,
              content,
              date: new Date().toLocaleDateString()
            }
          : note
      )
    )
    setEditingNote(null)
    toast.success('Note updated successfully!')
  }

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id))
  }

  const TaskItem = ({ task, index, moveTask }) => {
    const ref = useRef(null)
    const [, drop] = useDrop({
      accept: 'task',
      hover(item, monitor) {
        if (!ref.current) {
          return
        }
        const dragIndex = item.index
        const hoverIndex = index
        if (dragIndex === hoverIndex) {
          return
        }
        moveTask(dragIndex, hoverIndex)
        item.index = hoverIndex
      },
    })

    const [{ isDragging }, drag] = useDrag({
      type: 'task',
      item: { id: task.id, index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    })

    drag(drop(ref))

    return (
      <div ref={ref} className={`border rounded-xl p-4 hover:shadow-md transition-shadow ${isDragging ? 'opacity-50' : ''}`}>
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
            <span className="text-muted-foreground">Due {format(new Date(task.dueDate), 'PP')}</span>
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
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
                        <DialogDescription>
                          Fill in the details for your task.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-6">
                        <div className="flex items-center space-x-2">
                          <Input
                            name="title"
                            placeholder="Task title"
                            value={newTask.title}
                            onChange={handleInputChange}
                          />
                          <Button onClick={() => handleVoiceInput('title')} disabled={isRecording}>
                            <Mic className="h-5 w-5" />
                          </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Textarea
                            name="description"
                            placeholder="Task description"
                            value={newTask.description}
                            onChange={handleInputChange}
                          />
                          <Button onClick={() => handleVoiceInput('description')} disabled={isDescriptionRecording}>
                            <Mic className="h-5 w-5" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="dueDate">Due Date</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className={`w-full justify-start text-left font-normal ${!newTask.dueDate && "text-muted-foreground"}`}
                                >
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {newTask.dueDate ? format(new Date(newTask.dueDate), "PPP") : <span>Pick a date</span>}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <CalendarComponent
                                  mode="single"
                                  selected={newTask.dueDate ? new Date(newTask.dueDate) : undefined}
                                  onSelect={(date: Date | undefined) => setNewTask(prev => ({ 
                                    ...prev, 
                                    dueDate: date?.toISOString() 
                                  }))}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="timeEstimate">Time Estimate (minutes)</Label>
                            <Input
                              id="timeEstimate"
                              name="timeEstimate"
                              type="number"
                              value={newTask.timeEstimate}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="flex flex-col space-y-1.5">
                          <Label htmlFor="priority">Priority</Label>
                          <Select
                            value={newTask.priority}
                            onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value }))}
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
                        <div className="flex flex-col space-y-1.5">
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={newTask.category}
                            onValueChange={(value) => setNewTask(prev => ({ ...prev, category: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="work">Work</SelectItem>
                              <SelectItem value="personal">Personal</SelectItem>
                              <SelectItem value="study">Study</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="subtasks">Subtasks</Label>
                          {newTask.subtasks.map((subtask, index) => (
                            <div key={subtask.id} className="flex items-center mt-2 space-x-2">
                              <Input
                                value={subtask.text}
                                onChange={(e) => handleSubtaskChange(subtask.id, 'text', e.target.value)}
                                placeholder={`Subtask ${index + 1}`}
                              />
                            </div>
                          ))}
                          <Button type="button" onClick={handleAddSubtask} variant="outline" className="mt-2">
                            Add Subtask
                          </Button>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleAddTask}>{editingTask ? 'Update Task' : 'Add Task'}</Button>
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
                  <div className="mb-8 bg-gradient-to-b from-background to-background/50 p-6 rounded-xl backdrop-blur-sm shadow-lg border border-border/50">
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                            My Notes
                          </h2>
                          <p className="text-muted-foreground mt-1">Capture your thoughts and ideas</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Select
                            value={notesView}
                            onValueChange={(value: 'grid' | 'list') => setNotesView(value)}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue placeholder="View" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="grid">Grid View</SelectItem>
                              <SelectItem value="list">List View</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Select
                            value={notesSortBy}
                            onValueChange={(value: 'date' | 'priority' | 'category') => setNotesSortBy(value)}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="date">Date</SelectItem>
                              <SelectItem value="priority">Priority</SelectItem>
                              <SelectItem value="category">Category</SelectItem>
                            </SelectContent>
                          </Select>

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
                            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <PlusCircle className="h-5 w-5" />
                            Add Note
                          </Button>
                        </div>
                      </div>

                      <div className={cn(
                        "mt-6 gap-4",
                        notesView === 'grid' 
                          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                          : "flex flex-col"
                      )}>
                        {notes.map((note) => (
                          <div
                            key={note.id}
                            className={cn(
                              "group relative rounded-xl border p-4 shadow-lg transition-all duration-300",
                              note.color || "bg-card",
                              "hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1",
                              "backdrop-blur-md bg-opacity-90",
                              notesView === 'list' && "flex items-start gap-4"
                            )}
                          >
                            <div className={cn(
                              "flex-1",
                              notesView === 'list' && "flex items-center gap-4"
                            )}>
                              <div className="mb-2">
                                <div className="flex items-center gap-2 mb-3">
                                  {note.priority && (
                                    <span className={cn(
                                      "px-2 py-1 rounded-full text-xs font-medium",
                                      note.priority === 'high' && "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
                                      note.priority === 'medium' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
                                      note.priority === 'low' && "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                    )}>
                                      {note.priority}
                                    </span>
                                  )}
                                  {note.category && (
                                    <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                                      {note.category}
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-lg font-semibold leading-tight mb-2">{note.title}</h3>
                                <p className="mb-3 text-sm text-muted-foreground line-clamp-3">{note.content}</p>
                              </div>
                              {note.tags && note.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                  {note.tags.map((tag, index) => (
                                    <span
                                      key={index}
                                      className="bg-primary/5 text-primary text-xs px-2 py-0.5 rounded-full font-medium"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <p>{note.date}</p>
                                <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-background/80"
                                    onClick={() => handleEditNote(note)}
                                  >
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => handleDeleteNote(note.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
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
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{editingNote ? "Edit Note" : "Create Note"}</DialogTitle>
            <DialogDescription>
              {editingNote ? "Edit your note details below." : "Create a new note with a title and content."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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