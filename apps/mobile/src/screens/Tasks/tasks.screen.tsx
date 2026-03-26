import { LegendList } from '@legendapp/list';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { PageHeader, ScreenContainer, TaskItem, Typography } from '@/components';
import { type SpaceMember, type Task, type TaskStatus, type User } from '@/database/schema';
import { useActiveSpace } from '@/hooks/useActiveSpace.hook';
import { useTw } from '@/hooks/useTw';
import { ClipboardListIcon } from '@/icons';
import type { SpacesStackParamList } from '@/navigation/SpacesNavigator';
import { SpaceService, TaskService, UserService } from '@/services';
import { colors } from '@/tailwind';

type Props = NativeStackScreenProps<SpacesStackParamList, 'Tasks'>;

type FilterTab = 'all' | 'mine' | 'unassigned';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'mine', label: 'Mine' },
  { key: 'unassigned', label: 'Unassigned' },
];

const SECTION_ORDER: TaskStatus[] = ['open', 'in_progress', 'done'];
const SECTION_LABELS: Record<TaskStatus, string> = {
  done: 'Done',
  in_progress: 'In Progress',
  open: 'Open',
};

type MemberWithUser = SpaceMember & { user: User };

function getMemberName(members: MemberWithUser[], userId: string | null): string | undefined {
  if (!userId) return undefined;
  const member = members.find((m) => m.userId === userId);
  if (!member) return undefined;

  return `${member.user.firstName} ${member.user.lastName}`.trim();
}

export function TasksScreen({ navigation }: Props) {
  const tw = useTw();
  const { activeSpaceId, isAllSpaces } = useActiveSpace();
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [members, setMembers] = useState<MemberWithUser[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const currentUserId = UserService.getCurrentUserId();
  const canWrite = userRole === 'owner' || userRole === 'editor';

  const loadData = useCallback(async () => {
    if (isAllSpaces || !activeSpaceId) return;

    try {
      const [allTasks, spaceDetails, role] = await Promise.all([
        TaskService.listTasks(activeSpaceId),
        SpaceService.getSpaceById(activeSpaceId),
        SpaceService.getUserRole(activeSpaceId),
      ]);
      setTaskList(allTasks);
      setMembers(spaceDetails?.members ?? []);
      setUserRole(role);
    } catch {
      // Silent fail
    }
  }, [activeSpaceId, isAllSpaces]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      loadData().finally(() => setIsLoading(false));
    }, [loadData]),
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const filteredTasks = useMemo(() => {
    let filtered = taskList;
    if (activeFilter === 'mine') {
      filtered = taskList.filter((t) => t.assignedTo === currentUserId);
    } else if (activeFilter === 'unassigned') {
      filtered = taskList.filter((t) => !t.assignedTo);
    }

    return filtered;
  }, [taskList, activeFilter, currentUserId]);

  const sections = useMemo(
    () =>
      SECTION_ORDER.map((status) => ({
        data: filteredTasks.filter((t) => t.status === status),
        status,
        title: SECTION_LABELS[status],
      })),
    [filteredTasks],
  );

  const handleTaskPress = useCallback(
    (task: Task) => {
      navigation.navigate('TaskDetail', { taskId: task.id });
    },
    [navigation],
  );

  const handleAddTask = () => {
    navigation.navigate('NewTask');
  };

  if (isLoading) {
    return (
      <ScreenContainer excludedEdges={['top']} hasScroll={false}>
        <PageHeader title="Tasks" />
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer excludedEdges={['top']} hasScroll={false}>
      <PageHeader title="Tasks" />

      {/* Filter tabs */}
      <View style={tw`pb-2`}>
        <ScrollView
          horizontal
          contentContainerStyle={tw`px-4`}
          showsHorizontalScrollIndicator={false}
        >
          {FILTER_TABS.map((tab) => (
            <Pressable
              key={tab.key}
              style={tw`mr-2 rounded-full px-4 py-1.5 ${
                activeFilter === tab.key ? 'bg-primary' : 'bg-neutral-200'
              }`}
              onPress={() => setActiveFilter(tab.key)}
            >
              <Text
                style={tw`text-sm font-medium ${
                  activeFilter === tab.key ? 'text-white' : 'text-foreground'
                }`}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Task sections */}
      {filteredTasks.length === 0 ? (
        <View style={tw`flex-1 items-center justify-center px-6`}>
          <ClipboardListIcon height={48} style={tw`text-placeholder mb-4`} width={48} />
          <Text style={tw`text-foreground mb-2 text-xl font-medium`}>No tasks yet</Text>
          <Typography style={tw`text-subtitle mb-6 text-center`}>
            {'Create tasks to coordinate\nco-parenting responsibilities.'}
          </Typography>
        </View>
      ) : (
        <LegendList
          contentContainerStyle={tw`px-4 pb-20 pt-2`}
          data={sections}
          estimatedItemSize={200}
          keyExtractor={(section) => section.status}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
          renderItem={({ item: section }) => (
            <View style={tw`mb-4`}>
              <Text
                style={tw`text-subtitle mb-2 px-1 text-xs font-semibold uppercase tracking-wider`}
              >
                {section.title} ({section.data.length})
              </Text>
              {section.data.length === 0 ? (
                <View style={tw`bg-surface items-center rounded-xl py-4`}>
                  <Typography style={tw`text-placeholder text-sm`}>
                    No {section.title.toLowerCase()} tasks
                  </Typography>
                </View>
              ) : (
                section.data.map((task) => (
                  <TaskItem
                    key={task.id}
                    assigneeName={getMemberName(members, task.assignedTo)}
                    task={task}
                    onPress={handleTaskPress}
                  />
                ))
              )}
            </View>
          )}
        />
      )}

      {/* FAB for owners/editors */}
      {canWrite ? (
        <Pressable
          style={tw`bg-primary absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full shadow-lg`}
          onPress={handleAddTask}
        >
          <Text style={tw`text-2xl font-light text-white`}>+</Text>
        </Pressable>
      ) : null}
    </ScreenContainer>
  );
}
