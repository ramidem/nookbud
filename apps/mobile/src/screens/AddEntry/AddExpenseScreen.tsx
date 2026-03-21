import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';

import type { Child } from '@/database/schema';
import { useTw } from '@/hooks/useTw';
import type { TimelineStackParamList } from '@/navigation/TimelineNavigator';
import { EntryService, RelationshipService, ChildService, UserService } from '@/services';
import type { ExpenseCategory, SplitType } from '@/types/entry-content.types';

type Props = NativeStackScreenProps<TimelineStackParamList, 'AddExpense'>;

const ACTIVE_BG = 'bg-blue-600';
const INACTIVE_BG = 'bg-gray-100';
const ACTIVE_TEXT = 'text-white';
const INACTIVE_TEXT = 'text-gray-700';

const CATEGORIES: { value: ExpenseCategory; label: string }[] = [
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

const SPLIT_OPTIONS: { value: SplitType; label: string }[] = [
  { label: '50/50 Split', value: '50/50' },
  { label: 'Full Amount', value: 'full' },
  { label: 'Custom %', value: 'custom' },
];

export function AddExpenseScreen({ navigation }: Props) {
  const tw = useTw();
  const [isLoading, setIsLoading] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [relationshipId, setRelationshipId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Form state
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('other');
  const [splitType, setSplitType] = useState<SplitType>('50/50');
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const rel = await RelationshipService.getCurrentRelationship();
      if (rel) {
        setRelationshipId(rel.id);
        const c = await ChildService.listByRelationship(rel.id);
        setChildren(c);
      }
      const uid = UserService.getCurrentUserId();
      setUserId(uid);
    }
    load();
  }, []);

  const canSave = amount.trim().length > 0 && description.trim().length > 0;

  const handleSave = async () => {
    if (!canSave || !relationshipId || !userId) return;

    setIsLoading(true);
    try {
      const amountCents = Math.round(parseFloat(amount) * 100);
      if (isNaN(amountCents) || amountCents <= 0) {
        Alert.alert('Invalid Amount', 'Please enter a valid amount');

        return;
      }

      await EntryService.create({
        childId: selectedChildId ?? undefined,
        content: {
          amount: amountCents,
          category,
          currency,
          description: description.trim(),
          paidBy: userId,
          receiptAttached: false,
          splitType,
        },
        relationshipId,
        type: 'expense',
      });

      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={tw`flex-1 bg-white`}
    >
      {/* Header */}
      <View
        style={tw`flex-row items-center justify-between border-b border-gray-100 px-4 pb-4 pt-14`}
      >
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={tw`text-base text-blue-600`}>Cancel</Text>
        </Pressable>
        <Text style={tw`text-lg font-semibold text-gray-900`}>Add Expense</Text>
        <Pressable disabled={!canSave || isLoading} onPress={handleSave}>
          {isLoading ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text
              style={tw`${canSave ? 'text-blue-600' : 'text-gray-400'} text-base font-semibold`}
            >
              Save
            </Text>
          )}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={tw`p-4`}>
        {/* Amount */}
        <View style={tw`mb-6`}>
          <Text style={tw`mb-2 text-sm font-medium text-gray-600`}>Amount</Text>
          <View style={tw`flex-row items-center`}>
            <View style={tw`mr-2`}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={tw`flex-row`}>
                  {CURRENCIES.map((c) => (
                    <Pressable
                      key={c}
                      style={tw`mr-1 rounded-lg px-3 py-2 ${currency === c ? ACTIVE_BG : INACTIVE_BG}`}
                      onPress={() => setCurrency(c)}
                    >
                      <Text style={tw`${currency === c ? ACTIVE_TEXT : INACTIVE_TEXT} font-medium`}>
                        {c}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
          <TextInput
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor="#9CA3AF"
            style={tw`mt-2 rounded-xl border border-gray-300 px-4 py-4 text-2xl font-semibold`}
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        {/* Description */}
        <View style={tw`mb-6`}>
          <Text style={tw`mb-2 text-sm font-medium text-gray-600`}>Description</Text>
          <TextInput
            placeholder="What was this expense for?"
            placeholderTextColor="#9CA3AF"
            style={tw`rounded-xl border border-gray-300 px-4 py-3`}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Category */}
        <View style={tw`mb-6`}>
          <Text style={tw`mb-2 text-sm font-medium text-gray-600`}>Category</Text>
          <View style={tw`flex-row flex-wrap gap-2`}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.value}
                style={tw`rounded-lg px-3 py-2 ${category === cat.value ? ACTIVE_BG : INACTIVE_BG}`}
                onPress={() => setCategory(cat.value)}
              >
                <Text style={tw`${category === cat.value ? ACTIVE_TEXT : INACTIVE_TEXT}`}>
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Split Type */}
        <View style={tw`mb-6`}>
          <Text style={tw`mb-2 text-sm font-medium text-gray-600`}>Split</Text>
          <View style={tw`flex-row gap-2`}>
            {SPLIT_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={tw`flex-1 rounded-lg py-3 ${splitType === opt.value ? ACTIVE_BG : INACTIVE_BG}`}
                onPress={() => setSplitType(opt.value)}
              >
                <Text
                  style={tw`text-center ${splitType === opt.value ? ACTIVE_TEXT : INACTIVE_TEXT} font-medium`}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Child (optional) */}
        {children.length > 0 && (
          <View style={tw`mb-6`}>
            <Text style={tw`mb-2 text-sm font-medium text-gray-600`}>For Child (optional)</Text>
            <View style={tw`flex-row flex-wrap gap-2`}>
              <Pressable
                style={tw`rounded-lg px-4 py-2 ${selectedChildId === null ? ACTIVE_BG : INACTIVE_BG}`}
                onPress={() => setSelectedChildId(null)}
              >
                <Text style={tw`${selectedChildId === null ? ACTIVE_TEXT : INACTIVE_TEXT}`}>
                  All Children
                </Text>
              </Pressable>
              {children.map((child) => (
                <Pressable
                  key={child.id}
                  style={tw`rounded-lg px-4 py-2 ${selectedChildId === child.id ? ACTIVE_BG : INACTIVE_BG}`}
                  onPress={() => setSelectedChildId(child.id)}
                >
                  <Text style={tw`${selectedChildId === child.id ? ACTIVE_TEXT : INACTIVE_TEXT}`}>
                    {child.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
