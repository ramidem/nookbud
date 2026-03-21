import { Platform, Text, TextProps, TextStyle } from 'react-native';

const systemFont: TextStyle = {
  fontFamily: Platform.select({ android: 'sans-serif', ios: 'System' }),
};

export function EmojiText(props: TextProps) {
  const { style, ...rest } = props;

  return <Text style={[systemFont, style]} {...rest} />;
}
