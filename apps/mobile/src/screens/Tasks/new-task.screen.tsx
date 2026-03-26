import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';
import { z } from 'zod';

import {
  Alert,
  Button,
  DatePickerInput,
  InputLayout,
  ScreenContainer,
  ScreenHeader,
  SelectDropdown,
  TextInput,
  Toast,
  Typography,
} from '@/components';
import { type Child, type SpaceMember, type User } from '@/database/schema';
import { useActiveSpace } from '@/hooks/useActiveSpace.hook';
import { useTw } from '@/hooks/useTw';
import type { SpacesStackParamList } from '@/navigation/SpacesNavigator';
import { SpaceService, TaskService } from '@/services';

type Props = NativeStackScreenProps<SpacesStackParamList, 'NewTask'>;

const createTaskSchema = z.object({
  assignedTo: z.string().optional(),
  childId: z.string().optional(),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  title: z.string().min(1, 'Title is required'),
});

type CreateTaskForm = z.infer<typeof createTaskSchema>;

type MemberWithUser = SpaceMember & { user: User };

const PRIORITY_OPTIONS = [
  { key: 'low', label: 'Low' },
  { key: 'medium', label: 'Medium' },
  { key: 'high', label: 'High' },
] as const;

export function NewTaskScreen({ navigation }: Props) {
  const tw = useTw();
  const { activeSpaceId, isAllSpaces } = useActiveSpace();
  const [members, setMembers] = useState<MemberWithUser[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<CreateTaskForm>({
    defaultValues: { priority: 'medium' },
    resolver: zodResolver(createTaskSchema),
  });

  useEffect(() => {
    async function load() {
      if (isAllSpaces || !activeSpaceId) {
        Alert.error({ message: 'Please select a Space first.', title: 'No Space Selected' });
        navigation.goBack();

        return;
      }

      const role = await SpaceService.getUserRole(activeSpaceId);
      if (role === 'viewer') {
        Alert.error({
          message: 'Your role in this Space does not allow creating tasks.',
          title: 'Access Denied',
        });
        navigation.goBack();

        return;
      }

      const spaceDetails = await SpaceService.getSpaceById(activeSpaceId);
      if (spaceDetails) {
        setMembers(spaceDetails.members);
        setChildren(spaceDetails.children);
      }
    }

    load();
  }, [activeSpaceId, isAllSpaces, navigation]);

  const memberOptions = members.map((m) => ({
    id: m.userId,
    label: `${m.user.firstName} ${m.user.lastName}`.trim(),
  }));

  const childOptions = children.map((c) => ({
    id: c.id,
    label: c.name,
  }));

  const onSubmit = async (data: CreateTaskForm) => {
    if (!activeSpaceId) return;

    setIsSubmitting(true);
    try {
      await TaskService.createTask(activeSpaceId, {
        assignedTo: data.assignedTo,
        childId: data.childId,
        description: data.description,
        dueDate: data.dueDate,
        priority: data.priority,
        title: data.title,
      });
      Toast.success('Task created');
      navigation.goBack();
    } catch (error) {
      Alert.error({
        message: error instanceof Error ? error.message : 'Failed to create task.',
        title: 'Error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader hasBackButton title="New Task" onBackPress={() => navigation.goBack()} />

      <View style={tw`px-4 pt-4`}>
        {/* Title */}
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value } }) => (
            <InputLayout isRequired error={errors.title?.message} label="Title">
              <TextInput placeholder="Task title" value={value} onChangeText={onChange} />
            </InputLayout>
          )}
        />

        {/* Description */}
        <View style={tw`mt-4`}>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <InputLayout label="Description">
                <TextInput
                  multiline
                  numberOfLines={3}
                  placeholder="Add details..."
                  value={value}
                  onChangeText={onChange}
                />
              </InputLayout>
            )}
          />
        </View>

        {/* Priority */}
        <View style={tw`mt-4`}>
          <Typography style={tw`text-foreground mb-2 text-sm font-medium`}>Priority</Typography>
          <Controller
            control={control}
            name="priority"
            render={({ field: { onChange, value } }) => (
              <View style={tw`flex-row`}>
                {PRIORITY_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.key}
                    style={tw`mr-2 rounded-full px-4 py-2 ${
                      value === opt.key ? 'bg-primary' : 'bg-neutral-200'
                    }`}
                    onPress={() => onChange(opt.key)}
                  >
                    <Text
                      style={tw`text-sm font-medium ${
                        value === opt.key ? 'text-white' : 'text-foreground'
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          />
        </View>

        {/* Assignee */}
        {memberOptions.length > 0 ? (
          <View style={tw`mt-4`}>
            <Controller
              control={control}
              name="assignedTo"
              render={({ field: { onChange, value } }) => (
                <SelectDropdown
                  label="Assign to"
                  options={memberOptions}
                  placeholder="Unassigned"
                  selectedId={value}
                  onSelect={onChange}
                />
              )}
            />
          </View>
        ) : null}

        {/* Child */}
        {childOptions.length > 0 ? (
          <View style={tw`mt-4`}>
            <Controller
              control={control}
              name="childId"
              render={({ field: { onChange, value } }) => (
                <SelectDropdown
                  label="Child"
                  options={childOptions}
                  placeholder="None"
                  selectedId={value}
                  onSelect={onChange}
                />
              )}
            />
          </View>
        ) : null}

        {/* Due Date */}
        <View style={tw`mt-4`}>
          <Controller
            control={control}
            name="dueDate"
            render={({ field: { onChange, value } }) => (
              <DatePickerInput
                label="Due date"
                mode="date"
                placeholder="No due date"
                value={value}
                onChange={onChange}
              />
            )}
          />
        </View>

        {/* Submit */}
        <View style={tw`mt-8`}>
          <Button
            disabled={isSubmitting}
            isLoading={isSubmitting}
            title="Create Task"
            onPress={handleSubmit(onSubmit)}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}
