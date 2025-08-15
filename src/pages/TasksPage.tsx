// import { useState, useEffect } from 'react';
// import { useApp } from '../context/AppContext';
// import { tasks } from '../services/api';
// import TaskCard from '../components/TaskCard';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog';
// import { Card, CardContent } from '@/components/ui/card';
// import { Skeleton } from '@/components/ui/skeleton';
// import { Plus, Loader2 } from 'lucide-react';

// interface Task {
//   id: string;
//   title: string;
//   description?: string;
//   priority: 'high' | 'medium' | 'low';
//   status: 'pending' | 'in-progress' | 'completed';
//   createdAt?: string;
// }

// interface NewTask {
//   title: string;
//   description: string;
//   priority: 'high' | 'medium' | 'low';
//   status: 'pending' | 'in-progress' | 'completed';
// }

// export default function TasksPage() {
//   const { state, actions } = useApp();
//   const [allTasks, setAllTasks] = useState<Task[]>([]);
//   const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isCreating, setIsCreating] = useState(false);
//   const [selectedPriority, setSelectedPriority] = useState('all');
//   const [selectedStatus, setSelectedStatus] = useState('all');
//   const [sortBy, setSortBy] = useState('priority');
//   const [showCreateForm, setShowCreateForm] = useState(false);
//   const [newTask, setNewTask] = useState<NewTask>({
//     title: '',
//     description: '',
//     priority: 'medium',
//     status: 'pending'
//   });

//   useEffect(() => {
//     loadTasks();
//   }, []);

//   useEffect(() => {
//     filterAndSortTasks();
//   }, [allTasks, selectedPriority, selectedStatus, sortBy]);

//   const loadTasks = async (): Promise<void> => {
//     try {
//       if (!state.user?.id) {
//         setAllTasks([]);
//         return;
//       }
//       const response = await tasks.getTasks(state.user.id);
//       setAllTasks(response.tasks || []);
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : 'Unknown error';
//       actions.setError(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const filterAndSortTasks = (): void => {
//     let filtered = [...allTasks];

//     // Filter by priority
//     if (selectedPriority !== 'all') {
//       filtered = filtered.filter(task => task.priority === selectedPriority);
//     }

//     // Filter by status
//     if (selectedStatus !== 'all') {
//       filtered = filtered.filter(task => task.status === selectedStatus);
//     }

//     // Sort tasks
//     filtered.sort((a, b) => {
//       if (sortBy === 'priority') {
//         const priorityOrder = { high: 3, medium: 2, low: 1 };
//         return priorityOrder[b.priority] - priorityOrder[a.priority];
//       } else if (sortBy === 'created') {
//         return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
//       } else if (sortBy === 'title') {
//         return a.title.localeCompare(b.title);
//       }
//       return 0;
//     });

//     setFilteredTasks(filtered);
//   };

//   const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
//     e.preventDefault();
//     if (!newTask.title.trim() || isCreating) return;

//     setIsCreating(true);
//     try {
//       if (!state.user?.id) {
//         throw new Error('User not found');
//       }
//       const createdTask = await tasks.createTask(
//         state.user.id,
//         {
//           ...newTask,
//           createdAt: new Date().toISOString(),
//         }
//       );
//       setAllTasks(prev => [createdTask, ...prev]);
//       setNewTask({ title: '', description: '', priority: 'medium', status: 'pending' });
//       setShowCreateForm(false);
//       actions.setError(null);
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : 'Unknown error';
//       actions.setError(errorMessage);
//     } finally {
//       setIsCreating(false);
//     }
//   };

//   const handleUpdateTask = async (taskId: string, updates: Partial<Task>): Promise<void> => {
//     try {
//       if (!state.user?.id) {
//         throw new Error('User not found');
//       }

//       const updatedTask = await tasks.updateTask(state.user.id, taskId, updates);
//       setAllTasks(prev => prev.map(task => 
//         task.id === taskId ? updatedTask : task
//       ));
//       actions.setError(null);
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : 'Unknown error';
//       actions.setError(errorMessage);
//     }
//   };

//   const handleDeleteTask = async (taskId: string): Promise<void> => {
//     try {
//       if (!state.user?.id) {
//         throw new Error('User not found');
//       }
      
//       await tasks.deleteTask(state.user.id, taskId);
//       setAllTasks(prev => prev.filter(task => task.id !== taskId));
//       actions.setError(null);
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : 'Unknown error';
//       actions.setError(errorMessage);
//     }
//   };

//   const getTaskCounts = (): Record<string, number> => {
//     const counts = {
//       all: allTasks.length,
//       high: allTasks.filter(t => t.priority === 'high').length,
//       medium: allTasks.filter(t => t.priority === 'medium').length,
//       low: allTasks.filter(t => t.priority === 'low').length,
//       pending: allTasks.filter(t => t.status === 'pending').length,
//       'in-progress': allTasks.filter(t => t.status === 'in-progress').length,
//       completed: allTasks.filter(t => t.status === 'completed').length
//     };
//     return counts;
//   };

//   const taskCounts = getTaskCounts();

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//       </div>
//     );
//   }

//   return (
//     <div className="py-4 sm:py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header */}
//         <div className="mb-6 sm:mb-8">
//           <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
//             <div>
//               <h1 className="text-2xl sm:text-3xl font-bold">Task Bucket</h1>
//               <p className="mt-1 sm:mt-2 text-sm sm:text-base text-muted-foreground">
//                 Organize and manage your tasks by priority
//               </p>
//             </div>
//             <Button
//               onClick={() => setShowCreateForm(true)}
//               className="w-full sm:w-auto"
//             >
//               <Plus className="mr-2 h-4 w-4" />
//               Create Task
//             </Button>
//           </div>
//         </div>

//         {/* Stats - Scrollable on mobile */}
//         <div className="mb-6 sm:mb-8 overflow-x-auto">
//           <div className="grid grid-cols-7 gap-2 sm:gap-4 min-w-[600px] sm:min-w-0">
//             <Card>
//               <CardContent className="p-3 sm:p-4">
//                 <div className="text-xl sm:text-2xl font-bold">{taskCounts.all}</div>
//                 <div className="text-xs sm:text-sm text-muted-foreground">Total</div>
//               </CardContent>
//             </Card>
//             <Card className="border-red-200 bg-red-50">
//               <CardContent className="p-3 sm:p-4">
//                 <div className="text-xl sm:text-2xl font-bold text-red-700">{taskCounts.high}</div>
//                 <div className="text-xs sm:text-sm text-red-600">High</div>
//               </CardContent>
//             </Card>
//             <Card className="border-yellow-200 bg-yellow-50">
//               <CardContent className="p-3 sm:p-4">
//                 <div className="text-xl sm:text-2xl font-bold text-yellow-700">{taskCounts.medium}</div>
//                 <div className="text-xs sm:text-sm text-yellow-600">Medium</div>
//               </CardContent>
//             </Card>
//             <Card className="border-green-200 bg-green-50">
//               <CardContent className="p-3 sm:p-4">
//                 <div className="text-xl sm:text-2xl font-bold text-green-700">{taskCounts.low}</div>
//                 <div className="text-xs sm:text-sm text-green-600">Low</div>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardContent className="p-3 sm:p-4">
//                 <div className="text-xl sm:text-2xl font-bold">{taskCounts.pending}</div>
//                 <div className="text-xs sm:text-sm text-muted-foreground">Pending</div>
//               </CardContent>
//             </Card>
//             <Card className="border-blue-200 bg-blue-50">
//               <CardContent className="p-3 sm:p-4">
//                 <div className="text-xl sm:text-2xl font-bold text-blue-700">{taskCounts['in-progress']}</div>
//                 <div className="text-xs sm:text-sm text-blue-600">Progress</div>
//               </CardContent>
//             </Card>
//             <Card className="border-green-200 bg-green-50">
//               <CardContent className="p-3 sm:p-4">
//                 <div className="text-xl sm:text-2xl font-bold text-green-700">{taskCounts.completed}</div>
//                 <div className="text-xs sm:text-sm text-green-600">Done</div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>

//         {/* Filters */}
//         <Card className="mb-6 sm:mb-8">
//           <CardContent className="p-4 sm:p-6">
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="priority-filter">Filter by Priority</Label>
//                 <Select value={selectedPriority} onValueChange={setSelectedPriority}>
//                   <SelectTrigger id="priority-filter">
//                     <SelectValue placeholder="Select priority" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Priorities</SelectItem>
//                     <SelectItem value="high">High Priority</SelectItem>
//                     <SelectItem value="medium">Medium Priority</SelectItem>
//                     <SelectItem value="low">Low Priority</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="status-filter">Filter by Status</Label>
//                 <Select value={selectedStatus} onValueChange={setSelectedStatus}>
//                   <SelectTrigger id="status-filter">
//                     <SelectValue placeholder="Select status" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Statuses</SelectItem>
//                     <SelectItem value="pending">Pending</SelectItem>
//                     <SelectItem value="in-progress">In Progress</SelectItem>
//                     <SelectItem value="completed">Completed</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="sort-by">Sort by</Label>
//                 <Select value={sortBy} onValueChange={setSortBy}>
//                   <SelectTrigger id="sort-by">
//                     <SelectValue placeholder="Sort by" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="priority">Priority (High to Low)</SelectItem>
//                     <SelectItem value="created">Date Created (Newest)</SelectItem>
//                     <SelectItem value="title">Title (A-Z)</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Create Task Dialog */}
//         <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
//           <DialogContent className="sm:max-w-[425px]">
//             <DialogHeader>
//               <DialogTitle>Create New Task</DialogTitle>
//               <DialogDescription>
//                 Add a new task to your bucket. Fill in the details below.
//               </DialogDescription>
//             </DialogHeader>
//             <form onSubmit={handleCreateTask} className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="title">Title</Label>
//                 <Input
//                   id="title"
//                   value={newTask.title}
//                   onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
//                   placeholder="Enter task title"
//                   required
//                   disabled={isCreating}
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="description">Description</Label>
//                 <Textarea
//                   id="description"
//                   value={newTask.description}
//                   onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
//                   placeholder="Enter task description (optional)"
//                   rows={3}
//                   disabled={isCreating}
//                 />
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="priority">Priority</Label>
//                   <Select
//                     value={newTask.priority}
//                     onValueChange={(value) => setNewTask({ ...newTask, priority: value as 'high' | 'medium' | 'low' })}
//                     disabled={isCreating}
//                   >
//                     <SelectTrigger id="priority">
//                       <SelectValue placeholder="Select priority" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="high">High</SelectItem>
//                       <SelectItem value="medium">Medium</SelectItem>
//                       <SelectItem value="low">Low</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="status">Status</Label>
//                   <Select
//                     value={newTask.status}
//                     onValueChange={(value) => setNewTask({ ...newTask, status: value as 'pending' | 'in-progress' | 'completed' })}
//                     disabled={isCreating}
//                   >
//                     <SelectTrigger id="status">
//                       <SelectValue placeholder="Select status" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="pending">Pending</SelectItem>
//                       <SelectItem value="in-progress">In Progress</SelectItem>
//                       <SelectItem value="completed">Completed</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>
//               <div className="flex justify-end gap-3 pt-4">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => setShowCreateForm(false)}
//                   disabled={isCreating}
//                 >
//                   Cancel
//                 </Button>
//                 <Button type="submit" disabled={isCreating || !newTask.title.trim()}>
//                   {isCreating ? (
//                     <>
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                       Creating...
//                     </>
//                   ) : (
//                     'Create Task'
//                   )}
//                 </Button>
//               </div>
//             </form>
//           </DialogContent>
//         </Dialog>

//         {/* Tasks Grid */}
//         {isLoading ? (
//           <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
//             {[...Array(6)].map((_, i) => (
//               <Card key={i}>
//                 <CardContent className="p-4">
//                   <Skeleton className="h-6 w-3/4 mb-2" />
//                   <Skeleton className="h-4 w-full mb-2" />
//                   <Skeleton className="h-4 w-5/6" />
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         ) : filteredTasks.length === 0 ? (
//           <div className="text-center py-12">
//             <div className="mx-auto h-12 w-12 text-muted-foreground">
//               <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//               </svg>
//             </div>
//             <h3 className="mt-2 text-sm font-medium">No tasks found</h3>
//             <p className="mt-1 text-sm text-muted-foreground">
//               {allTasks.length === 0 
//                 ? "Get started by creating your first task." 
//                 : "Try adjusting your filters to see more tasks."
//               }
//             </p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
//             {filteredTasks.map((task) => (
//               <TaskCard
//                 key={task.id}
//                 task={task}
//                 onUpdate={handleUpdateTask}
//                 onDelete={handleDeleteTask}
//               />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { tasks } from '../services/api'
import TaskCard from '../components/TaskCard'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import {
  Plus,
  Loader2,
  CheckCircle,
  Clock,
  Zap,
  Calendar,
  Trash2,
  Edit2,
  AlertCircle,
  Flag,
} from 'lucide-react'

import { motion } from 'framer-motion'

// -----------------------------
// Types
// -----------------------------

interface Task {
  id: string
  title: string
  description?: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in-progress' | 'completed'
  createdAt?: string
}

// Raw API task (based on your sample payload)
interface ApiTask {
  id: number
  user_id: number
  title: string
  description?: string
  status: string | number // 0,1,2 or string
  priority: 'high' | 'medium' | 'low' | string
  due_date?: string | null
  created_at?: string | null
  updated_at?: string | null
  type?: 'todo' | 'meeting' | 'reminder' | 'deadline' | 'followup' | string
  sourceEmailId?: string
  metadata?: string | Record<string, unknown>
}

// Enriched internal task used in UI
interface NormalizedTask extends Task {
  dueDate?: string
  type?: 'todo' | 'meeting' | 'reminder' | 'deadline' | 'followup'
  metadata?: Record<string, unknown>
}

// -----------------------------
// Normalizers & helpers
// -----------------------------

const STATUS_MAP: Record<string, Task['status']> = {
  '0': 'pending',
  '1': 'in-progress',
  '2': 'completed',
  pending: 'pending',
  'in-progress': 'in-progress',
  completed: 'completed',
}

const safeParse = (v: unknown) => {
  if (typeof v === 'string') {
    try {
      return JSON.parse(v)
    } catch {
      return {}
    }
  }
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : {}
}

const normalizeTask = (t: ApiTask): NormalizedTask => ({
  id: String(t.id),
  title: t.title,
  description: t.description || '',
  priority: (['high', 'medium', 'low'].includes(String(t.priority))
    ? (t.priority as 'high' | 'medium' | 'low')
    : 'medium'),
  status: STATUS_MAP[String(t.status)] ?? 'pending',
  createdAt: t.created_at ?? undefined,
  dueDate: t.due_date ?? undefined,
  type:
    t.type && ['todo', 'meeting', 'reminder', 'deadline', 'followup'].includes(t.type)
      ? (t.type as any)
      : undefined,
  metadata: safeParse(t.metadata),
})

const startOfDay = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const addDays = (d: Date, days: number) => new Date(d.getTime() + days * 86400000)

const getBucketLabel = (iso?: string) => {
  if (!iso) return 'No date'
  const due = new Date(iso)
  const today = startOfDay()
  const tomorrow = addDays(today, 1)
  const dayAfter = addDays(today, 2)
  const endOfWeek = addDays(today, 7)

  if (due < today) return 'Overdue'
  if (due >= today && due < tomorrow) return 'Today'
  if (due >= tomorrow && due < dayAfter) return 'Tomorrow'
  if (due < endOfWeek) return 'This Week'
  return 'Later'
}

const groupByAgenda = (items: NormalizedTask[]) => {
  const groups: Record<string, NormalizedTask[]> = {}
  for (const t of items) {
    const key = getBucketLabel(t.dueDate)
    groups[key] = groups[key] || []
    groups[key].push(t)
  }
  const order = ['Overdue', 'Today', 'Tomorrow', 'This Week', 'Later', 'No date']
  return order
    .filter((k) => groups[k]?.length)
    .map((k) => ({ label: k, items: groups[k] }))
}

const dueChipClass = (iso?: string) => {
  if (!iso) return 'bg-gray-100 text-gray-700'
  const due = new Date(iso)
  const today = startOfDay()
  if (due < today) return 'bg-red-100 text-red-700'
  if (due.toDateString() === today.toDateString()) return 'bg-amber-100 text-amber-800'
  return 'bg-slate-100 text-slate-700'
}

// -----------------------------
// Main Component
// -----------------------------

type ViewMode = 'glance' | 'agenda' | 'list' | 'board'

export default function TasksPage() {
  const { state, actions } = useApp()

  const [allTasks, setAllTasks] = useState<NormalizedTask[]>([])
  const [filteredTasks, setFilteredTasks] = useState<NormalizedTask[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  // Filters & sorts
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [selectedStatus, setSelectedStatus] = useState<'all' | Task['status']>('all')
  const [sortBy, setSortBy] = useState<'priority' | 'created' | 'title' | 'due'>('due')

  // View (default to GLANCE)
  const [view, setView] = useState<ViewMode>('glance')

  // Bulk selection (List view)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Create form state
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    status: 'pending' as Task['status'],
  })

  // Persist user prefs (client only)
  useEffect(() => {
    try {
      const p = localStorage.getItem('tasks:priority') as any
      const s = localStorage.getItem('tasks:status') as any
      const sb = localStorage.getItem('tasks:sortBy') as any
      // new storage key for view
      const v = localStorage.getItem('tasks:view:v2') as any
      if (p && ['all', 'high', 'medium', 'low'].includes(p)) setSelectedPriority(p)
      if (s && ['all', 'pending', 'in-progress', 'completed'].includes(s)) setSelectedStatus(s)
      if (sb && ['priority', 'created', 'title', 'due'].includes(sb)) setSortBy(sb)
      if (v && ['glance', 'agenda', 'list', 'board'].includes(v)) setView(v)
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('tasks:priority', selectedPriority)
      localStorage.setItem('tasks:status', selectedStatus)
      localStorage.setItem('tasks:sortBy', sortBy)
      localStorage.setItem('tasks:view:v2', view)
    } catch {}
  }, [selectedPriority, selectedStatus, sortBy, view])

  useEffect(() => {
    loadTasks()
  }, [])

  useEffect(() => {
    filterAndSortTasks()
  }, [allTasks, selectedPriority, selectedStatus, sortBy])

  const loadTasks = async (): Promise<void> => {
    try {
      if (!state.user?.id) {
        setAllTasks([])
        return
      }
      const response = await tasks.getTasks(state.user.id)
      const raw: ApiTask[] = Array.isArray(response) ? response : response.tasks || []
      const normalized = raw.map(normalizeTask)
      setAllTasks(normalized)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      actions.setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortTasks = (): void => {
    let filtered = [...allTasks]

    if (selectedPriority !== 'all') {
      filtered = filtered.filter((t) => t.priority === selectedPriority)
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter((t) => t.status === selectedStatus)
    }

    filtered.sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      } else if (sortBy === 'created') {
        return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title)
      } else if (sortBy === 'due') {
        const ad = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
        const bd = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
        return ad - bd
      }
      return 0
    })

    setFilteredTasks(filtered)
  }

  const taskCounts = useMemo(() => ({
    all: allTasks.length,
    high: allTasks.filter((t) => t.priority === 'high').length,
    medium: allTasks.filter((t) => t.priority === 'medium').length,
    low: allTasks.filter((t) => t.priority === 'low').length,
    pending: allTasks.filter((t) => t.status === 'pending').length,
    'in-progress': allTasks.filter((t) => t.status === 'in-progress').length,
    completed: allTasks.filter((t) => t.status === 'completed').length,
  }), [allTasks])

  // Glance metrics (from ALL tasks)
  const glance = useMemo(() => {
    const today = startOfDay()
    const isToday = (iso?: string) => !!iso && new Date(iso).toDateString() === today.toDateString()
    const isOverdue = (iso?: string) => !!iso && new Date(iso) < today

    const overdue = allTasks.filter((t) => isOverdue(t.dueDate))
    const dueToday = allTasks.filter((t) => isToday(t.dueDate))
    const inProgress = allTasks.filter((t) => t.status === 'in-progress')
    const highPriority = allTasks.filter((t) => t.priority === 'high')

    const nextUp = allTasks
      .filter((t) => t.status !== 'completed')
      .slice()
      .sort((a, b) => {
        const ad = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
        const bd = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
        const pr = { high: 0, medium: 1, low: 2 } as const
        return ad - bd || pr[a.priority] - pr[b.priority] || a.title.localeCompare(b.title)
      })
      .slice(0, 5)

    const topOverdue = overdue
      .slice()
      .sort((a, b) => new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime())
      .slice(0, 5)

    return { overdue, dueToday, inProgress, highPriority, nextUp, topOverdue }
  }, [allTasks])

  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (!newTask.title.trim() || isCreating) return

    setIsCreating(true)
    try {
      if (!state.user?.id) throw new Error('User not found')

      const created = await tasks.createTask(state.user.id, {
        ...newTask,
        createdAt: new Date().toISOString(),
      })

      const normalized = 'id' in created && typeof (created as any).id !== 'string' ? normalizeTask(created as ApiTask) : (created as NormalizedTask)
      setAllTasks((prev) => [normalized, ...prev])
      setNewTask({ title: '', description: '', priority: 'medium', status: 'pending' })
      setShowCreateForm(false)
      actions.setError(null)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      actions.setError(errorMessage)
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdateTask = async (taskId: string, updates: Partial<Task> | Partial<NormalizedTask>): Promise<void> => {
    try {
      if (!state.user?.id) throw new Error('User not found')

      const updated = await tasks.updateTask(state.user.id, taskId, updates)
      const normalized = (updated && typeof (updated as any).id !== 'string') ? normalizeTask(updated as ApiTask) : (updated as NormalizedTask)

      setAllTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...normalized } : t)))
      actions.setError(null)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      actions.setError(errorMessage)
    }
  }

  const handleDeleteTask = async (taskId: string): Promise<void> => {
    try {
      if (!state.user?.id) throw new Error('User not found')
      await tasks.deleteTask(state.user.id, taskId)
      setAllTasks((prev) => prev.filter((t) => t.id !== taskId))
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(taskId)
        return next
      })
      actions.setError(null)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      actions.setError(errorMessage)
    }
  }

  // Bulk actions (List view)
  const selectedCount = selectedIds.size
  const allVisibleIds = useMemo(() => filteredTasks.map((t) => t.id), [filteredTasks])
  const allSelectedOnPage = selectedCount > 0 && allVisibleIds.every((id) => selectedIds.has(id))

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      if (allSelectedOnPage) return new Set<string>()
      return new Set(allVisibleIds)
    })
  }

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const bulkUpdateStatus = async (status: Task['status']) => {
    const ids = Array.from(selectedIds)
    await Promise.all(ids.map((id) => handleUpdateTask(id, { status })))
    setSelectedIds(new Set())
  }

  const bulkDelete = async () => {
    const ids = Array.from(selectedIds)
    await Promise.all(ids.map((id) => handleDeleteTask(id)))
    setSelectedIds(new Set())
  }

  // Possible duplicate titles banner
  const duplicateTitles = useMemo(() => {
    const map = new Map<string, number>()
    for (const t of allTasks) {
      const key = t.title.trim().toLowerCase()
      map.set(key, (map.get(key) || 0) + 1)
    }
    const dups = Array.from(map.values()).filter((n) => n > 1).reduce((a, b) => a + (b - 1), 0)
    return dups
  }, [allTasks])

  // -----------------------------
  // Render helpers (views)
  // -----------------------------

  const HeaderActions = () => (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Task Bucket</h1>
        <p className="mt-1 text-sm text-muted-foreground">Glance-first. Minimal. Fast triage.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <div className="inline-flex rounded-xl shadow-sm ring-1 ring-border/50 overflow-hidden" role="group">
          <Button variant={view === 'glance' ? 'default' : 'ghost'} className="rounded-none" onClick={() => setView('glance')}>Glance</Button>
          <Button variant={view === 'agenda' ? 'default' : 'ghost'} className="rounded-none" onClick={() => setView('agenda')}>Agenda</Button>
          <Button variant={view === 'list' ? 'default' : 'ghost'} className="rounded-none" onClick={() => setView('list')}>List</Button>
          <Button variant={view === 'board' ? 'default' : 'ghost'} className="rounded-none" onClick={() => setView('board')}>Board</Button>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="w-full sm:w-auto rounded-xl">
          <Plus className="mr-2 h-4 w-4" /> Create Task
        </Button>
      </div>
    </div>
  )

  // Modern KPI tile
  const KPI = ({
    icon: Icon,
    label,
    value,
    onClick,
  }: {
    icon: any
    label: string
    value: number
    onClick?: () => void
  }) => (
    <motion.button whileHover={{ y: -2 }} whileTap={{ y: 0 }} onClick={onClick} className="text-left group">
      <div className="rounded-2xl ring-1 ring-border/60 bg-gradient-to-br from-muted/40 to-background shadow-sm p-5 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-background ring-1 ring-border/60">
              <Icon className="h-4 w-4" />
            </span>
            <span className="text-sm">{label}</span>
          </div>
          <div className="text-3xl font-semibold tracking-tight">{value}</div>
        </div>
      </div>
    </motion.button>
  )

  const MiniItem = ({ t }: { t: NormalizedTask }) => (
    <div className="flex items-start gap-3 py-2">
      <div className={`mt-1 h-2.5 w-2.5 rounded-full ${t.priority === 'high' ? 'bg-red-500' : t.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium truncate">{t.title}</div>
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          {t.type && <span className="capitalize">{t.type}</span>}
          {t.dueDate && <span>{new Date(t.dueDate).toLocaleDateString()}</span>}
        </div>
      </div>
    </div>
  )

  const BulkBar = () => (selectedCount > 0 ? (
    <div className="sticky top-0 z-10 mb-3 rounded-md border p-2 sm:p-3 bg-background flex flex-wrap items-center gap-2 justify-between">
      <div className="text-sm">{selectedCount} selected</div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => bulkUpdateStatus('pending')}><Clock className="h-4 w-4 mr-1" />Pending</Button>
        <Button variant="outline" size="sm" onClick={() => bulkUpdateStatus('in-progress')}><Zap className="h-4 w-4 mr-1" />In Progress</Button>
        <Button variant="outline" size="sm" onClick={() => bulkUpdateStatus('completed')}><CheckCircle className="h-4 w-4 mr-1" />Complete</Button>
        <Button variant="destructive" size="sm" onClick={bulkDelete}><Trash2 className="h-4 w-4 mr-1" />Delete</Button>
      </div>
    </div>
  ) : null)

  const TasksList = ({ items }: { items: NormalizedTask[] }) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[44px]"><Input type="checkbox" checked={allSelectedOnPage} onChange={toggleSelectAll} className="h-4 w-4" /></TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((t) => {
            const checked = selectedIds.has(t.id)
            return (
              <TableRow key={t.id} className="hover:bg-muted/30">
                <TableCell>
                  <Input type="checkbox" checked={checked} onChange={() => toggleSelectOne(t.id)} className="h-4 w-4" />
                </TableCell>
                <TableCell className="max-w-[420px]">
                  <div className="font-medium line-clamp-1">{t.title}</div>
                  {t.description ? <div className="text-xs text-muted-foreground line-clamp-1">{t.description}</div> : null}
                </TableCell>
                <TableCell>
                  {t.type ? (
                    <Badge variant="secondary" className="capitalize">{t.type}</Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={t.priority === 'high' ? 'bg-red-100 text-red-800' : t.priority === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}>
                    {t.priority[0].toUpperCase() + t.priority.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={t.status === 'completed' ? 'bg-green-100 text-green-800' : t.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                    {t.status.replace('-', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-1 rounded ${dueChipClass(t.dueDate)}`}>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}</span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleUpdateTask(t.id, { status: t.status === 'completed' ? 'pending' : 'completed' })} title={t.status === 'completed' ? 'Mark as Pending' : 'Mark as Completed'}>
                      {t.status === 'completed' ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {}}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" onClick={() => handleDeleteTask(t.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )

  const AgendaView = ({ items }: { items: NormalizedTask[] }) => {
    const groups = groupByAgenda(items)
    return (
      <div className="space-y-6">
        {groups.map((g) => (
          <section key={g.label}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">{g.label}</h2>
              <span className="text-sm text-muted-foreground">{g.items.length}</span>
            </div>
            <div className="rounded-md border divide-y">
              {g.items.map((t) => (
                <div key={t.id} className="p-3 flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{t.title}</div>
                    {t.description ? <div className="text-xs text-muted-foreground truncate">{t.description}</div> : null}
                    <div className="flex gap-2 mt-1">
                      {t.type && <Badge variant="secondary" className="capitalize">{t.type}</Badge>}
                      <Badge className={t.priority === 'high' ? 'bg-red-100 text-red-800' : t.priority === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}>{t.priority}</Badge>
                      <span className={`text-xs px-2 py-1 rounded ${dueChipClass(t.dueDate)}`}>{t.dueDate ? new Date(t.dueDate).toLocaleString() : 'No date'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-auto">
                    <Button variant={t.status === 'pending' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => handleUpdateTask(t.id, { status: 'pending' })} title="Mark as Pending"><Clock className="h-4 w-4" /></Button>
                    <Button variant={t.status === 'in-progress' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => handleUpdateTask(t.id, { status: 'in-progress' })} title="Mark as In Progress"><Zap className="h-4 w-4" /></Button>
                    <Button variant={t.status === 'completed' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => handleUpdateTask(t.id, { status: 'completed' })} title="Mark as Completed"><CheckCircle className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {}}><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => handleDeleteTask(t.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    )
  }

  const GlanceView = () => {
    return (
      <div className="space-y-6">
        {/* KPI grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KPI icon={AlertCircle} label="Overdue" value={glance.overdue.length} onClick={() => { setSelectedStatus('all'); setSelectedPriority('all'); setView('agenda') }} />
          <KPI icon={Calendar} label="Due Today" value={glance.dueToday.length} onClick={() => { setSelectedStatus('all'); setSelectedPriority('all'); setView('agenda') }} />
          <KPI icon={Zap} label="In Progress" value={glance.inProgress.length} onClick={() => { setSelectedStatus('in-progress'); setSelectedPriority('all'); setView('list') }} />
          <KPI icon={Flag} label="High Priority" value={glance.highPriority.length} onClick={() => { setSelectedPriority('high'); setSelectedStatus('all'); setView('list') }} />
        </div>

        {/* Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <Card className="overflow-hidden rounded-2xl">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-medium">Next up</h3>
                  <Button variant="ghost" size="sm" onClick={() => setView('agenda')}>Agenda</Button>
                </div>
                <div className="p-4">
                  {glance.nextUp.length === 0 ? (
                    <div className="text-sm text-muted-foreground">Nothing queued. 🎉</div>
                  ) : (
                    <div className="divide-y">
                      {glance.nextUp.map((t) => (
                        <div key={t.id} className="py-2">
                          <MiniItem t={t} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Card className="overflow-hidden rounded-2xl">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <h3 className="font-medium">Overdue</h3>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setView('agenda')}>Review</Button>
                </div>
                <div className="p-4">
                  {glance.topOverdue.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No overdue tasks. ✅</div>
                  ) : (
                    <div className="divide-y">
                      {glance.topOverdue.map((t) => (
                        <div key={t.id} className="py-2">
                          <MiniItem t={t} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  // -----------------------------
  // Page JSX
  // -----------------------------

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <HeaderActions />
        </div>

        {/* Optional duplicates hint */}
        {duplicateTitles > 0 && (
          <div className="mb-4 rounded-md border p-3 bg-amber-50 text-amber-900">
            Possible duplicates detected across titles: <strong>{duplicateTitles}</strong>
          </div>
        )}

        {/* Filters — minimal */}
        <Card className="mb-6 sm:mb-8 rounded-2xl">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority-filter">Priority</Label>
                <Select value={selectedPriority} onValueChange={(v: any) => setSelectedPriority(v)}>
                  <SelectTrigger id="priority-filter" className="rounded-xl">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-filter">Status</Label>
                <Select value={selectedStatus} onValueChange={(v: any) => setSelectedStatus(v)}>
                  <SelectTrigger id="status-filter" className="rounded-xl">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sort-by">Sort by</Label>
                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                  <SelectTrigger id="sort-by" className="rounded-xl">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="due">Due (Soonest)</SelectItem>
                    <SelectItem value="priority">Priority (High→Low)</SelectItem>
                    <SelectItem value="created">Created (Newest)</SelectItem>
                    <SelectItem value="title">Title (A–Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>View</Label>
                <div className="grid grid-cols-4 gap-2">
                  <Button variant={view === 'glance' ? 'default' : 'outline'} onClick={() => setView('glance')} className="rounded-xl">Glance</Button>
                  <Button variant={view === 'agenda' ? 'default' : 'outline'} onClick={() => setView('agenda')} className="rounded-xl">Agenda</Button>
                  <Button variant={view === 'list' ? 'default' : 'outline'} onClick={() => setView('list')} className="rounded-xl">List</Button>
                  <Button variant={view === 'board' ? 'default' : 'outline'} onClick={() => setView('board')} className="rounded-xl">Board</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Views */}
        {view === 'glance' && <GlanceView />}

        {view === 'list' && (
          <>
            <BulkBar />
            {filteredTasks.length === 0 ? (
              <EmptyState hasAny={allTasks.length > 0} />
            ) : (
              <TasksList items={filteredTasks} />
            )}
          </>
        )}

        {view === 'agenda' && (filteredTasks.length === 0 ? <EmptyState hasAny={allTasks.length > 0} /> : <AgendaView items={filteredTasks} />)}

        {view === 'board' && (
          isLoading ? (
            <CardsSkeleton />
          ) : filteredTasks.length === 0 ? (
            <EmptyState hasAny={allTasks.length > 0} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task as any} onUpdate={handleUpdateTask} onDelete={handleDeleteTask} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}

// -----------------------------
// Reusable pieces
// -----------------------------

function EmptyState({ hasAny }: { hasAny: boolean }) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto h-12 w-12 text-muted-foreground">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h3 className="mt-2 text-sm font-medium">No tasks found</h3>
      <p className="mt-1 text-sm text-muted-foreground">{hasAny ? 'Try adjusting your filters to see more tasks.' : 'Get started by creating your first task.'}</p>
    </div>
  )
}

function CardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
