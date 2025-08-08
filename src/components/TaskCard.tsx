import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Edit2,
  Trash2,
  Clock,
  Zap,
  CheckCircle,
  Calendar,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  createdAt?: string;
}

interface TaskCardProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

interface EditedTask {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
}

export default function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editedTask, setEditedTask] = useState<EditedTask>({
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    status: task.status
  });

  const priorityConfig = {
    high: {
      variant: 'destructive' as const,
      className: 'bg-red-100 text-red-800 hover:bg-red-100',
    },
    medium: {
      variant: 'secondary' as const,
      className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
    },
    low: {
      variant: 'secondary' as const,
      className: 'bg-green-100 text-green-800 hover:bg-green-100',
    },
  };

  const statusConfig = {
    pending: {
      icon: Clock,
      className: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
    },
    'in-progress': {
      icon: Zap,
      className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    },
    completed: {
      icon: CheckCircle,
      className: 'bg-green-100 text-green-800 hover:bg-green-100',
    },
  };

  const handleSave = async (): Promise<void> => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      await onUpdate(task.id, editedTask);
      setIsEditing(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = (): void => {
    setEditedTask({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status
    });
    setIsEditing(false);
  };

  const handleStatusChange = async (newStatus: 'pending' | 'in-progress' | 'completed'): Promise<void> => {
    if (isUpdating || task.status === newStatus) return;
    
    setIsUpdating(true);
    try {
      await onUpdate(task.id, { status: newStatus });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      await onDelete(task.id);
      setShowDeleteDialog(false);
    } catch (error) {
      setIsDeleting(false);
    }
  };

  const cardClassName = cn(
    "h-full transition-all",
    task.priority === 'high' && "border-red-200",
    task.priority === 'medium' && "border-yellow-200",
    task.priority === 'low' && "border-green-200",
    isDeleting && "opacity-50"
  );

  if (isEditing) {
    return (
      <Card className={cardClassName}>
        <CardHeader className="pb-3">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor={`title-${task.id}`}>Title</Label>
              <Input
                id={`title-${task.id}`}
                value={editedTask.title}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                placeholder="Task title"
                disabled={isUpdating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`desc-${task.id}`}>Description</Label>
              <Textarea
                id={`desc-${task.id}`}
                value={editedTask.description}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                placeholder="Task description"
                rows={3}
                disabled={isUpdating}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor={`priority-${task.id}`}>Priority</Label>
              <Select
                value={editedTask.priority}
                onValueChange={(value) => setEditedTask({ ...editedTask, priority: value as 'high' | 'medium' | 'low' })}
                disabled={isUpdating}
              >
                <SelectTrigger id={`priority-${task.id}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`status-${task.id}`}>Status</Label>
              <Select
                value={editedTask.status}
                onValueChange={(value) => setEditedTask({ ...editedTask, status: value as 'pending' | 'in-progress' | 'completed' })}
                disabled={isUpdating}
              >
                <SelectTrigger id={`status-${task.id}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isUpdating || !editedTask.title.trim()}
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <>
      <Card className={cardClassName}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-base sm:text-lg font-semibold line-clamp-2 flex-1">
              {task.title}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsEditing(true)}
                disabled={isUpdating || isDeleting}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:text-destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isUpdating || isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-3 mt-2">
              {task.description}
            </p>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={priorityConfig[task.priority].variant}
              className={priorityConfig[task.priority].className}
            >
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Badge>
            <Badge
              variant="secondary"
              className={statusConfig[task.status].className}
            >
              {task.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-3">
          <div className="flex items-center gap-1">
            <Button
              variant={task.status === 'pending' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => handleStatusChange('pending')}
              disabled={isUpdating || isDeleting}
              title="Mark as Pending"
            >
              <Clock className="h-4 w-4" />
            </Button>
            <Button
              variant={task.status === 'in-progress' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => handleStatusChange('in-progress')}
              disabled={isUpdating || isDeleting}
              title="Mark as In Progress"
            >
              <Zap className="h-4 w-4" />
            </Button>
            <Button
              variant={task.status === 'completed' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => handleStatusChange('completed')}
              disabled={isUpdating || isDeleting}
              title="Mark as Completed"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          </div>
          
          {isUpdating && (
            <span className="text-xs text-muted-foreground flex items-center">
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              Updating...
            </span>
          )}
          
          {task.createdAt && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="mr-1 h-3 w-3" />
              {new Date(task.createdAt).toLocaleDateString()}
            </div>
          )}
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}