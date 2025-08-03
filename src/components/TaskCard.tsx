import { useState } from 'react';

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
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

interface EditedTask {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
}

export default function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<EditedTask>({
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    status: task.status
  });

  const priorityColors: Record<string, { bg: string; border: string; text: string; badge: string }> = {
    high: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      badge: 'bg-red-100 text-red-800'
    },
    medium: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      badge: 'bg-yellow-100 text-yellow-800'
    },
    low: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      badge: 'bg-green-100 text-green-800'
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800'
  };

  const colors = priorityColors[task.priority] || priorityColors.medium;

  const handleSave = (): void => {
    onUpdate(task.id, editedTask);
    setIsEditing(false);
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

  const handleStatusChange = (newStatus: 'pending' | 'in-progress' | 'completed'): void => {
    onUpdate(task.id, { status: newStatus });
  };

  if (isEditing) {
    return (
      <div className={`border-2 ${colors.border} ${colors.bg} rounded-lg p-4`}>
        <div className="space-y-3">
          <input
            type="text"
            value={editedTask.title}
            onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Task title"
          />
                      <textarea
              value={editedTask.description}
              onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              placeholder="Task description"
            />
          <div className="flex space-x-2">
            <select
              value={editedTask.priority}
              onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as 'high' | 'medium' | 'low' })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            <select
              value={editedTask.status}
              onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value as 'pending' | 'in-progress' | 'completed' })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 text-sm text-white bg-primary-600 rounded-md hover:bg-primary-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border-2 ${colors.border} ${colors.bg} rounded-lg p-4 hover:shadow-md transition-shadow`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{task.title}</h3>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 text-gray-400 hover:text-red-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      
      {task.description && (
        <p className="text-gray-700 mb-3 line-clamp-3">{task.description}</p>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors.badge}`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[task.status]}`}>
            {task.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleStatusChange('pending')}
            className={`p-1 rounded ${task.status === 'pending' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Mark as Pending"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            onClick={() => handleStatusChange('in-progress')}
            className={`p-1 rounded ${task.status === 'in-progress' ? 'bg-blue-200' : 'hover:bg-blue-100'}`}
            title="Mark as In Progress"
          >
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
          <button
            onClick={() => handleStatusChange('completed')}
            className={`p-1 rounded ${task.status === 'completed' ? 'bg-green-200' : 'hover:bg-green-100'}`}
            title="Mark as Completed"
          >
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      {task.createdAt && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Created: {new Date(task.createdAt).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}