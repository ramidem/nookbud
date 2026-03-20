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
import { useTw } from '@/hooks/useTw';
import {
  EntryService,
  RelationshipService,
  ChildService,
  UserService,
} from '@/services';
import type { Child } from '@/database/schema';
import type { ExpenseCategory, SplitType } from '@/types/entry-content.types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TimelineStackParamList } from '@/navigation/TimelineNavigator';

type Props = NativeStackScreenProps<TimelineStackParamList, 'AddExpense'>;

const CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'childcare', label: '👶 Childcare' },
  { value: 'medical', label: '🏥 Medical' },
  { value: 'education', label: '📚 Education' },
  { value: 'clothing', label: '👕 Clothing' },
  { value: 'activities', label: '⚽ Activities' },
  { value: 'food', label: '🍎 Food' },
  { value: 'transportation', label: '🚗 Transport' },
  { value: 'other', label: '📦 Other' },
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'PHP', 'INR', 'SGD'];

const SPLIT_OPTIONS: { value: SplitType; label: string }[] = [
  { value: '50/50', label: '50/50 Split' },
  { value: 'full', label: 'Full Amount' },
  { value: 'custom', label: 'Custom %' },
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
        relationshipId,
        type: 'expense',
        childId: selectedChildId ?? undefined,
        content: {
          amount: amountCents,
          currency,
          description: description.trim(),
          category,
          paidBy: userId,
          splitType,
          receiptAttached: false,
        },
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
      style={tw`flex-1 bg-white`}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={tw`flex-row items-center justify-between px-4 pt-14 pb-4 border-b border-gray-100`}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={tw`text-blue-600 text-base`}>Cancel</Text>
        </Pressable>
        <Text style={tw`text-lg font-semibold text-gray-900`}>Add Expense</Text>
        <Pressable onPress={handleSave} disabled={!canSave || isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text style={tw`${canSave ? 'text-blue-600' : 'text-gray-400'} text-base font-semibold`}>
              Save
            </Text>
          )}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={tw`p-4`}>
        {/* Amount */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-sm font-medium text-gray-600 mb-2`}>Amount</Text>
          <View style={tw`flex-row items-center`}>
            <View style={tw`mr-2`}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={tw`flex-row`}>
                  {CURRENCIES.map((c) => (
                    <Pressable
                      key={c}
                      style={tw`px-3 py-2 rounded-lg mr-1 ${currency === c ? 'bg-blue-600' : 'bg-gray-100'}`}
                      onPress={() => setCurrency(c)}
                    >
                      <Text style={tw`${currency === c ? 'text-white' : 'text-gray-700'} font-medium`}>
                        {c}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
          <TextInput
            style={tw`border border-gray-300 rounded-xl px-4 py-4 text-2xl font-semibold mt-2`}
            placeholder="0.00"
            placeholderTextColor="#9CA3AF"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Description */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-sm font-medium text-gray-600 mb-2`}>Description</Text>
          <TextInput
            style={tw`border border-gray-300 rounded-xl px-4 py-3`}
            placeholder="What was this expense for?"
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Category */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-sm font-medium text-gray-600 mb-2`}>Category</Text>
          <View style={tw`flex-row flex-wrap gap-2`}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.value}
                style={tw`px-3 py-2 rounded-lg ${category === cat.value ? 'bg-blue-600' : 'bg-gray-100'}`}
                onPress={() => setCategory(cat.value)}
              >
                <Text style={tw`${category === cat.value ? 'text-white' : 'text-gray-700'}`}>
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Split Type */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-sm font-medium text-gray-600 mb-2`}>Split</Text>
          <View style={tw`flex-row gap-2`}>
            {SPLIT_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={tw`flex-1 py-3 rounded-lg ${splitType === opt.value ? 'bg-blue-600' : 'bg-gray-100'}`}
                onPress={() => setSplitType(opt.value)}
              >
                <Text style={tw`text-center ${splitType === opt.value ? 'text-white' : 'text-gray-700'} font-medium`}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Child (optional) */}
        {children.length > 0 && (
          <View style={tw`mb-6`}>
            <Text style={tw`text-sm font-medium text-gray-600 mb-2`}>For Child (optional)</Text>
            <View style={tw`flex-row flex-wrap gap-2`}>
              <Pressable
                style={tw`px-4 py-2 rounded-lg ${selectedChildId === null ? 'bg-blue-600' : 'bg-gray-100'}`}
                onPress={() => setSelectedChildId(null)}
              >
                <Text style={tw`${selectedChildId === null ? 'text-white' : 'text-gray-700'}`}>
                  All Children
                </Text>
              </Pressable>
              {children.map((child) => (
                <Pressable
                  key={child.id}
                  style={tw`px-4 py-2 rounded-lg ${selectedChildId === child.id ? 'bg-blue-600' : 'bg-gray-100'}`}
                  onPress={() => setSelectedChildId(child.id)}
                >
                  <Text style={tw`${selectedChildId === child.id ? 'text-white' : 'text-gray-700'}`}>
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
