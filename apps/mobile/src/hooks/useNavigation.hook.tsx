import { ParamListBase, useNavigation as RNUseNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

export function useNavigation<T extends ParamListBase>() {
  return RNUseNavigation<StackNavigationProp<T, keyof T>>();
}
