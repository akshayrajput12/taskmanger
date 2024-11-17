'use client'

import React, { useState, useEffect, useRef } from 'react'
import { PlusCircle, Clock, Calendar, Bell, Search, LineChart as LineChartIcon, CheckSquare, Tag, MoreVertical, Timer, AlertCircle, Filter, Trash2, Sun, Moon, BookOpen, Briefcase, Paperclip, Users, Flag, Hash, FileText, Mic, Brain, Download, Upload, Focus, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { v4 as uuidv4 } from 'uuid'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

// Simulated AI service
const aiService = {
  getSuggestions: (tasks) => new Promise(resolve => setTimeout(() => resolve([
    "Consider breaking down Task A into smaller subtasks for better management",
    "Task B is due soon. You might want to prioritize it",
    "You've been most productive in the mornings. Try scheduling important tasks then"
  ]), 1000)),
}

export default function AdvancedTaskFlow() {
  const [tasks, setTasks] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [date, setDate] = useState(new Date())
  const [activeTab, setActiveTab] = useState('all')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [aiSuggestions, setAiSuggestions] = useState([])
  const [isRecording, setIsRecording] = useState(false)
  const [isDescriptionRecording, setIsDescriptionRecording] = useState(false)

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

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])

  useEffect(() => {
    // Fetch AI suggestions
    aiService.getSuggestions(tasks).then(setAiSuggestions)
  }, [tasks])

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
                                  onSelect={(date) => setNewTask(prev => ({ ...prev, dueDate: date?.toISOString() }))}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tasks List */}
                  <div className="bg-card text-card-foreground rounded-xl shadow-sm">
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">{activeTab === 'today' ? "Today's Tasks" : 'All Tasks'}</h2>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="icon">
                            <Filter className="h-5 w-5" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                              <DropdownMenuItem>Due Date</DropdownMenuItem>
                              <DropdownMenuItem>Priority</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Show Completed</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                      {tasks.map((task, index) => (
                        <TaskItem key={task.id} task={task} index={index} moveTask={moveTask} />
                      ))}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Calendar */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Calendar</CardTitle>
                        <CardDescription>View and manage your tasks in a calendar view.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <CalendarComponent
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          className="rounded-md border"
                        />
                      </CardContent>
                    </Card>

                    {/* Analytics */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Task Analytics</CardTitle>
                        <CardDescription>Overview of your task completion and progress.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[200px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                              { name: 'Completed', value: tasks.filter(t => t.completed).length },
                              { name: 'In Progress', value: tasks.filter(t => !t.completed).length },
                            ]}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="value" fill="#8884d8" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">Task Completion Rate</h4>
                          <Progress value={(tasks.filter(t => t.completed).length / tasks.length) * 100} className="w-full" />
                          <p className="text-sm text-muted-foreground mt-2">
                            {((tasks.filter(t => t.completed).length / tasks.length) * 100).toFixed(2)}% of tasks completed
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* AI Suggestions */}
                    <Card>
                      <CardHeader>
                        <CardTitle>AI Suggestions</CardTitle>
                        <CardDescription>Smart recommendations for task management</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-5 space-y-2">
                          {aiSuggestions.map((suggestion, index) => (
                            <li key={index} className="text-sm">{suggestion}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  )
}