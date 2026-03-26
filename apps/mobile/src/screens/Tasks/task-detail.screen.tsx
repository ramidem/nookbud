import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import {
  Alert,
  Button,
  ScreenContainer,
  ScreenHeader,
  SelectDropdown,
  Toast,
  Typography,
} from '@/components';
import {
  TASK_PRIORITY_DISPLAY,
  TASK_STATUS_DISPLAY,
  type AuditLog,
  type SpaceMember,
  type Task,
  type TaskPriority,
  type User,
} from '@/database/schema';
import { useTw } from '@/hooks/useTw';
import { CalendarIcon, CheckCircleIcon, ClockIcon, UserIcon } from '@/icons';
import type { SpacesStackParamList } from '@/navigation/SpacesNavigator';
import { AuditService, SpaceService, TaskService } from '@/services';
import { colors } from '@/tailwind';

type Props = NativeStackScreenProps<SpacesStackParamList, 'TaskDetail'>;

type MemberWithUser = SpaceMember & { user: User };

const ICON_SIZE = 18;

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  high: 'bg-error',
  low: 'bg-neutral-400',
  medium: 'bg-warning',
};

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateTime(date: Date): string {
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getMemberName(members: MemberWithUser[], userId: string | null): string {
  if (!userId) return 'Unassigned';
  const member = members.find((m) => m.userId === userId);
  if (!member) return 'Unknown';

  return `${member.user.firstName} ${member.user.lastName}`.trim();
}

export function TaskDetailScreen({ navigation, route }: Props) {
  const tw = useTw();
  const { taskId } = route.params;
  const [task, setTask] = useState<Task | null>(null);
  const [members, setMembers] = useState<MemberWithUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const canWrite = userRole === 'owner' || userRole === 'editor';
  const isOwner = userRole === 'owner';
  const isDone = task?.status === 'done';

  const loadData = useCallback(async () => {
    try {
      const loadedTask = await TaskService.getById(taskId);
      if (!loadedTask) {
        Alert.error({ message: 'Task not found.', title: 'Error' });
        navigation.goBack();

        return;
      }

      setTask(loadedTask);

      const [spaceDetails, role, logs] = await Promise.all([
        SpaceService.getSpaceById(loadedTask.spaceId),
        SpaceService.getUserRole(loadedTask.spaceId),
        AuditService.getByEntity('task', taskId),
      ]);

      setMembers(spaceDetails?.members ?? []);
      setUserRole(role);
      setAuditLogs(logs.reverse());
    } catch {
      // Silent fail
    }
  }, [taskId, navigation]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      loadData().finally(() => setIsLoading(false));
    }, [loadData]),
  );

  const handleComplete = async () => {
    try {
      const updated = await TaskService.completeTask(taskId);
      setTask(updated);
      Toast.success('Task completed');
      await loadData();
    } catch (error) {
      Alert.error({
        message: error instanceof Error ? error.message : 'Failed to complete task.',
        title: 'Error',
      });
    }
  };

  const handleReopen = async () => {
    try {
      const updated = await TaskService.reopenTask(taskId);
      setTask(updated);
      Toast.success('Task reopened');
      await loadData();
    } catch (error) {
      Alert.error({
        message: error instanceof Error ? error.message : 'Failed to reopen task.',
        title: 'Error',
      });
    }
  };

  const handleDelete = () => {
    Alert.warning({
      actions: [
        { label: 'Cancel', variant: 'cancel' },
        {
          label: 'Delete',
          onPress: async () => {
            try {
              await TaskService.deleteTask(taskId);
              Toast.success('Task deleted');
              navigation.goBack();
            } catch (error) {
              Alert.error({
                message: error instanceof Error ? error.message : 'Failed to delete task.',
                title: 'Error',
              });
            }
          },
        },
      ],
      message: 'This task will be permanently removed from the list.',
      title: 'Delete Task',
    });
  };

  const handleReassign = async (userId: string) => {
    try {
      const updated = await TaskService.updateTask(taskId, { assignedTo: userId });
      setTask(updated);
      Toast.success('Task reassigned');
      await loadData();
    } catch (error) {
      Alert.error({
        message: error instanceof Error ? error.message : 'Failed to reassign task.',
        title: 'Error',
      });
    }
  };

  if (isLoading || !task) {
    return (
      <ScreenContainer>
        <ScreenHeader hasBackButton title="Task" onBackPress={() => navigation.goBack()} />
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </ScreenContainer>
    );
  }

  const memberOptions = members.map((m) => ({
    id: m.userId,
    label: `${m.user.firstName} ${m.user.lastName}`.trim(),
  }));

  return (
    <ScreenContainer>
      <ScreenHeader hasBackButton title="Task" onBackPress={() => navigation.goBack()} />

      <View style={tw`px-4 pt-4`}>
        {/* Title + status */}
        <View style={tw`mb-4`}>
          <Text style={tw`font-serif-bold text-foreground text-2xl`}>{task.title}</Text>
          <View style={tw`mt-2 flex-row items-center`}>
            {/* Status badge */}
            <View
              style={tw`mr-2 rounded-full px-3 py-1 ${isDone ? 'bg-success' : 'bg-neutral-200'}`}
            >
              <Text style={tw`text-xs font-semibold ${isDone ? 'text-white' : 'text-foreground'}`}>
                {TASK_STATUS_DISPLAY[task.status]}
              </Text>
            </View>
            {/* Priority badge */}
            <View style={tw`flex-row items-center`}>
              <View style={tw`mr-1 h-2.5 w-2.5 rounded-full ${PRIORITY_COLORS[task.priority]}`} />
              <Text style={tw`text-subtitle text-xs`}>{TASK_PRIORITY_DISPLAY[task.priority]}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {task.description ? (
          <View style={tw`mb-4`}>
            <Typography style={tw`text-foreground text-base leading-6`}>
              {task.description}
            </Typography>
          </View>
        ) : null}

        {/* Detail rows */}
        <View style={tw`bg-surface mb-4 rounded-xl p-4`}>
          {/* Assignee */}
          <View style={tw`mb-3 flex-row items-center`}>
            <UserIcon height={ICON_SIZE} style={tw`text-subtitle mr-3`} width={ICON_SIZE} />
            <Typography style={tw`text-subtitle text-sm`}>Assigned to</Typography>
            <Typography style={tw`text-foreground ml-auto text-sm font-medium`}>
              {getMemberName(members, task.assignedTo)}
            </Typography>
          </View>

          {/* Due date */}
          {task.dueDate ? (
            <View style={tw`mb-3 flex-row items-center`}>
              <CalendarIcon height={ICON_SIZE} style={tw`text-subtitle mr-3`} width={ICON_SIZE} />
              <Typography style={tw`text-subtitle text-sm`}>Due date</Typography>
              <Typography style={tw`text-foreground ml-auto text-sm font-medium`}>
                {formatDate(task.dueDate)}
              </Typography>
            </View>
          ) : null}

          {/* Created by */}
          <View style={tw`mb-3 flex-row items-center`}>
            <ClockIcon height={ICON_SIZE} style={tw`text-subtitle mr-3`} width={ICON_SIZE} />
            <Typography style={tw`text-subtitle text-sm`}>Created by</Typography>
            <Typography style={tw`text-foreground ml-auto text-sm font-medium`}>
              {getMemberName(members, task.createdBy)}
            </Typography>
          </View>

          {/* Completed by */}
          {task.completedAt && task.completedBy ? (
            <View style={tw`flex-row items-center`}>
              <CheckCircleIcon height={ICON_SIZE} style={tw`text-success mr-3`} width={ICON_SIZE} />
              <Typography style={tw`text-subtitle text-sm`}>Completed by</Typography>
              <Typography style={tw`text-foreground ml-auto text-sm font-medium`}>
                {getMemberName(members, task.completedBy)}
              </Typography>
            </View>
          ) : null}
        </View>

        {/* Actions */}
        {canWrite ? (
          <View style={tw`mb-4`}>
            {isDone ? (
              <Button title="Reopen Task" onPress={handleReopen} />
            ) : (
              <Button title="Mark Complete" onPress={handleComplete} />
            )}

            {/* Reassign */}
            {memberOptions.length > 1 ? (
              <View style={tw`mt-3`}>
                <SelectDropdown
                  label="Reassign"
                  options={memberOptions}
                  placeholder="Select member"
                  selectedId={task.assignedTo ?? undefined}
                  onSelect={handleReassign}
                />
              </View>
            ) : null}

            {/* Delete — owner only */}
            {isOwner ? (
              <Pressable style={tw`mt-4 items-center py-3`} onPress={handleDelete}>
                <Typography style={tw`text-error text-sm font-medium`}>Delete Task</Typography>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {/* Audit trail */}
        {auditLogs.length > 0 ? (
          <View style={tw`mb-8`}>
            <Text style={tw`text-subtitle mb-2 text-xs font-semibold uppercase tracking-wider`}>
              Activity
            </Text>
            {auditLogs.map((log) => (
              <View key={log.id} style={tw`bg-surface mb-1 rounded-lg px-3 py-2`}>
                <View style={tw`flex-row items-center justify-between`}>
                  <Typography style={tw`text-foreground text-xs`}>
                    {getMemberName(members, log.userId)} — {log.action}
                  </Typography>
                  <Typography style={tw`text-placeholder text-xs`}>
                    {formatDateTime(log.createdAt)}
                  </Typography>
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </ScreenContainer>
  );
}
