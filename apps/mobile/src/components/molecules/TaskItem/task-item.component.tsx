import React from 'react';
import { Pressable, View } from 'react-native';

import { Typography } from '@/components/atoms';
import { useTw } from '@/hooks/useTw';
import { ChevronRightIcon, ClockIcon } from '@/icons';
import { type Task, type TaskPriority } from '@/types';

type Props = {
  assigneeName?: string;
  onPress: (task: Task) => void;
  task: Task;
};

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  high: 'bg-error',
  low: 'bg-neutral-400',
  medium: 'bg-warning',
};

const ICON_SIZE = 16;

function formatDueDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
  });
}

function isOverdue(date: Date): boolean {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return date < now;
}

export function TaskItem({ assigneeName, onPress, task }: Props) {
  const tw = useTw();
  const overdue = task.dueDate ? isOverdue(task.dueDate) : false;
  const isDone = task.status === 'done';

  return (
    <Pressable
      style={tw`bg-surface mb-2 flex-row items-center rounded-xl px-4 py-3`}
      onPress={() => onPress(task)}
    >
      {/* Priority dot */}
      <View
        style={tw`mr-3 h-3 w-3 rounded-full ${isDone ? 'bg-success' : PRIORITY_COLORS[task.priority]}`}
      />

      {/* Content */}
      <View style={tw`flex-1`}>
        <Typography
          style={tw`text-foreground text-base ${isDone ? 'line-through opacity-60' : ''}`}
        >
          {task.title}
        </Typography>
        <View style={tw`mt-1 flex-row items-center`}>
          <Typography style={tw`text-subtitle text-xs`}>{assigneeName ?? 'Unassigned'}</Typography>
          {task.dueDate ? (
            <View style={tw`ml-2 flex-row items-center`}>
              <ClockIcon
                height={ICON_SIZE}
                style={tw`${overdue && !isDone ? 'text-error' : 'text-subtitle'} mr-0.5`}
                width={ICON_SIZE}
              />
              <Typography
                style={tw`text-xs ${overdue && !isDone ? 'text-error font-medium' : 'text-subtitle'}`}
              >
                {formatDueDate(task.dueDate)}
              </Typography>
            </View>
          ) : null}
        </View>
      </View>

      <ChevronRightIcon height={20} style={tw`text-placeholder`} width={20} />
    </Pressable>
  );
}
