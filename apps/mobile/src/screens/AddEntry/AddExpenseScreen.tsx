import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { z } from 'zod';

import { Alert, EmojiText } from '@/components/atoms';
import { useActiveSpace } from '@/hooks';
import { useTw } from '@/hooks/useTw';
import type { ActivityStackParamList } from '@/navigation/ActivityNavigator';
import { EntryService, ChildService, UserService, SpaceService } from '@/services';
import { colors } from '@/tailwind';
import type { Child } from '@/types';

type Props = NativeStackScreenProps<ActivityStackParamList, 'AddExpense'>;

const ACTIVE_BG = 'bg-primary';
const INACTIVE_BG = 'bg-neutral-200';
const ACTIVE_TEXT = 'text-white';
const INACTIVE_TEXT = 'text-foreground';

const CATEGORIES: { label: string; value: ExpenseFormData['category'] }[] = [
  { label: 'Childcare', value: 'childcare' },
  { label: 'Medical', value: 'medical' },
  { label: 'Education', value: 'education' },
  { label: 'Clothing', value: 'clothing' },
  { label: 'Activities', value: 'activities' },
  { label: 'Food', value: 'food' },
  { label: 'Transport', value: 'transportation' },
  { label: 'Other', value: 'other' },
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'PHP', 'INR', 'SGD'];

const SPLIT_OPTIONS: { label: string; value: ExpenseFormData['splitType'] }[] = [
  { label: '50/50 Split', value: '50/50' },
  { label: 'Full Amount', value: 'full' },
  { label: 'Custom %', value: 'custom' },
];

const expenseFormSchema = z.object({
  amount: z.string().min(1, 'Amount is required'),
  category: z.enum([
    'childcare',
    'medical',
    'education',
    'clothing',
    'activities',
    'food',
    'transportation',
    'other',
  ]),
  currency: z.string(),
  description: z.string().min(1, 'Description is required'),
  selectedChildId: z.string().nullable(),
  splitType: z.enum(['50/50', 'custom', 'full']),
});

type ExpenseFormData = z.infer<typeof expenseFormSchema>;

export function AddExpenseScreen({ navigation }: Props) {
  const tw = useTw();
  const { activeSpace, activeSpaceId, isAllSpaces } = useActiveSpace();
  const [isLoading, setIsLoading] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(true);

  const {
    control,
    formState: { isValid },
    handleSubmit,
  } = useForm<ExpenseFormData>({
    defaultValues: {
      amount: '',
      category: 'other',
      currency: 'USD',
      description: '',
      selectedChildId: null,
      splitType: '50/50',
    },
    mode: 'onChange',
    resolver: zodResolver(expenseFormSchema),
  });

  useEffect(() => {
    async function load() {
      if (isAllSpaces || !activeSpaceId) {
        Alert.error({
          message:
            'Please select a Space first. Tap the Space switcher at the top to choose which Space to log this entry to.',
          title: 'No Space Selected',
        });
        navigation.goBack();

        return;
      }

      // Role permission check
      const role = await SpaceService.getUserRole(activeSpaceId);
      if (role === 'viewer') {
        Alert.error({
          message: 'Your role in this Space does not allow creating entries.',
          title: 'Access Denied',
        });
        setHasPermission(false);
        navigation.goBack();

        return;
      }

      const c = await ChildService.listBySpace(activeSpaceId);
      setChildren(c);

      const uid = UserService.getCurrentUserId();
      setUserId(uid);
    }
    load();
  }, [activeSpaceId, isAllSpaces, navigation]);

  const canSave = isValid && hasPermission && !isAllSpaces;

  const onSubmit = async (data: ExpenseFormData) => {
    if (!activeSpaceId || !userId) return;

    setIsLoading(true);
    try {
      const amountCents = Math.round(parseFloat(data.amount) * 100);
      if (isNaN(amountCents) || amountCents <= 0) {
        Alert.error({ message: 'Please enter a valid amount', title: 'Invalid Amount' });

        return;
      }

      await EntryService.create({
        childId: data.selectedChildId ?? undefined,
        content: {
          amount: amountCents,
          category: data.category,
          currency: data.currency,
          description: data.description.trim(),
          paidBy: userId,
          receiptAttached: false,
          splitType: data.splitType,
        },
        spaceId: activeSpaceId,
        type: 'expense',
      });

      navigation.goBack();
    } catch (err) {
      Alert.error({
        message: err instanceof Error ? err.message : 'Failed to save',
        title: 'Error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={tw`bg-surface flex-1`}>
      {/* Header */}
      <View
        style={tw`border-background flex-row items-center justify-between border-b px-4 pb-4 pt-14`}
      >
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={tw`text-primary text-base`}>Cancel</Text>
        </Pressable>
        <Text style={tw`text-foreground font-serif-semibold text-lg`}>Add Expense</Text>
        <Pressable disabled={!canSave || isLoading} onPress={handleSubmit(onSubmit)}>
          {isLoading ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text
              style={tw`${canSave ? 'text-primary' : 'text-placeholder'} text-base font-semibold`}
            >
              Save
            </Text>
          )}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={tw`p-4`}>
        {/* Space context pill */}
        {activeSpace && (
          <View style={tw`mb-4 self-start rounded-lg bg-neutral-200 px-3 py-1.5`}>
            <Text style={tw`text-foreground text-sm`}>
              <EmojiText>{activeSpace.emoji}</EmojiText> {activeSpace.name}
            </Text>
          </View>
        )}

        {/* Amount */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-subtitle mb-2 text-sm font-medium`}>Amount</Text>
          <View style={tw`flex-row items-center`}>
            <View style={tw`mr-2`}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Controller
                  control={control}
                  name="currency"
                  render={({ field }) => (
                    <View style={tw`flex-row`}>
                      {CURRENCIES.map((c) => (
                        <Pressable
                          key={c}
                          style={tw`mr-1 rounded-lg px-3 py-2 ${field.value === c ? ACTIVE_BG : INACTIVE_BG}`}
                          onPress={() => field.onChange(c)}
                        >
                          <Text
                            style={tw`${field.value === c ? ACTIVE_TEXT : INACTIVE_TEXT} font-medium`}
                          >
                            {c}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                />
              </ScrollView>
            </View>
          </View>
          <Controller
            control={control}
            name="amount"
            render={({ field }) => (
              <TextInput
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.placeholder}
                style={tw`border-divider text-foreground mt-2 rounded-xl border px-4 py-4 text-2xl font-semibold`}
                value={field.value}
                onChangeText={(value) => field.onChange(value)}
              />
            )}
          />
        </View>

        {/* Description */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-subtitle mb-2 text-sm font-medium`}>Description</Text>
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <TextInput
                placeholder="What was this expense for?"
                placeholderTextColor={colors.placeholder}
                style={tw`border-divider text-foreground rounded-xl border px-4 py-3`}
                value={field.value}
                onChangeText={(value) => field.onChange(value)}
              />
            )}
          />
        </View>

        {/* Category */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-subtitle mb-2 text-sm font-medium`}>Category</Text>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <View style={tw`flex-row flex-wrap gap-2`}>
                {CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat.value}
                    style={tw`rounded-lg px-3 py-2 ${field.value === cat.value ? ACTIVE_BG : INACTIVE_BG}`}
                    onPress={() => field.onChange(cat.value)}
                  >
                    <Text style={tw`${field.value === cat.value ? ACTIVE_TEXT : INACTIVE_TEXT}`}>
                      {cat.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          />
        </View>

        {/* Split Type */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-subtitle mb-2 text-sm font-medium`}>Split</Text>
          <Controller
            control={control}
            name="splitType"
            render={({ field }) => (
              <View style={tw`flex-row gap-2`}>
                {SPLIT_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    style={tw`flex-1 rounded-lg py-3 ${field.value === opt.value ? ACTIVE_BG : INACTIVE_BG}`}
                    onPress={() => field.onChange(opt.value)}
                  >
                    <Text
                      style={tw`text-center ${field.value === opt.value ? ACTIVE_TEXT : INACTIVE_TEXT} font-medium`}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          />
        </View>

        {/* Child (optional) */}
        {children.length > 0 && (
          <View style={tw`mb-6`}>
            <Text style={tw`text-subtitle mb-2 text-sm font-medium`}>For Child (optional)</Text>
            <Controller
              control={control}
              name="selectedChildId"
              render={({ field }) => (
                <View style={tw`flex-row flex-wrap gap-2`}>
                  <Pressable
                    style={tw`rounded-lg px-4 py-2 ${field.value === null ? ACTIVE_BG : INACTIVE_BG}`}
                    onPress={() => field.onChange(null)}
                  >
                    <Text style={tw`${field.value === null ? ACTIVE_TEXT : INACTIVE_TEXT}`}>
                      All Children
                    </Text>
                  </Pressable>
                  {children.map((child) => (
                    <Pressable
                      key={child.id}
                      style={tw`rounded-lg px-4 py-2 ${field.value === child.id ? ACTIVE_BG : INACTIVE_BG}`}
                      onPress={() => field.onChange(child.id)}
                    >
                      <Text style={tw`${field.value === child.id ? ACTIVE_TEXT : INACTIVE_TEXT}`}>
                        {child.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
