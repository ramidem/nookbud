import React, { useCallback, useImperativeHandle, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { SvgProps } from 'react-native-svg';

import { AlertManagerRef, AlertOptions, AlertVariant } from './alert-manager.types';
import { Alert } from './alert.service';

import { Modal } from '@/components/atoms';
import { Typography } from '@/components/atoms/Typography';
import { AlertTriangleIcon, CheckCircleIcon, InfoIcon, XCircleIcon } from '@/icons';
import { colors, tw } from '@/tailwind';

type QueuedAlert = AlertOptions & {
  variant: AlertVariant;
};

type VariantConfig = {
  color: string;
  icon: React.FC<SvgProps>;
};

const ICON_SIZE = 24;

const VARIANT_CONFIG: Record<AlertVariant, VariantConfig> = {
  error: { color: colors.error, icon: XCircleIcon },
  info: { color: colors.neutral[500], icon: InfoIcon },
  success: { color: colors.success, icon: CheckCircleIcon },
  warning: { color: colors.neutral[950], icon: AlertTriangleIcon },
};

export function AlertManager() {
  const [queue, setQueue] = useState<QueuedAlert[]>([]);
  const ref = useRef<AlertManagerRef>(null);

  const currentAlert = queue[0];
  const isVisible = !!currentAlert;

  const handleDismiss = useCallback(() => {
    setQueue((prev) => prev.slice(1));
  }, []);

  const handleActionPress = useCallback(
    (onPress?: () => void) => {
      handleDismiss();
      onPress?.();
    },
    [handleDismiss],
  );

  useImperativeHandle(ref, () => ({
    show: (variant: AlertVariant, options: AlertOptions) => {
      setQueue((prev) => [...prev, { ...options, variant }]);
    },
  }));

  React.useEffect(() => {
    Alert.setRef({
      show: (variant: AlertVariant, options: AlertOptions) => {
        setQueue((prev) => [...prev, { ...options, variant }]);
      },
    });
  }, []);

  if (!currentAlert) {
    return null;
  }

  const config = VARIANT_CONFIG[currentAlert.variant];
  const IconComponent = config.icon;
  const showIcon = !currentAlert.hideIcon;
  const actions = currentAlert.actions?.length
    ? currentAlert.actions
    : [{ label: 'Ok', variant: 'default' as const }];

  return (
    <Modal isVisible={isVisible} onBackButtonPress={handleDismiss} onBackdropPress={handleDismiss}>
      <View pointerEvents="box-none" style={tw`flex-1 items-center justify-center`}>
        <View
          style={tw`dark:border-dark-divider dark:bg-dark-sheet border-divider mx-8 w-[85%] rounded-2xl border bg-white p-6`}
        >
          {/* Icon */}
          {showIcon && (
            <View
              style={tw`dark:bg-dark-surface mb-4 h-10 w-10 items-center justify-center rounded-full bg-neutral-100`}
            >
              <IconComponent color={config.color} height={ICON_SIZE} width={ICON_SIZE} />
            </View>
          )}

          {/* Title */}
          <Typography style={tw`dark:text-dark-foreground text-foreground text-lg font-semibold`}>
            {currentAlert.title}
          </Typography>

          {/* Message */}
          {currentAlert.message ? (
            <Typography style={tw`dark:text-subtitle text-subtitle mt-4 text-sm leading-relaxed`}>
              {currentAlert.message}
            </Typography>
          ) : null}

          {/* Action buttons */}
          <View style={tw`mt-6 gap-3`}>
            {actions.map((action) =>
              action.variant === 'cancel' ? (
                <Pressable
                  key={action.label}
                  style={tw`dark:border-dark-divider dark:bg-dark-surface border-divider items-center rounded-xl border bg-neutral-50 py-3.5`}
                  onPress={() => handleActionPress(action.onPress)}
                >
                  <Typography
                    style={tw`dark:text-dark-foreground text-base font-semibold text-neutral-700`}
                  >
                    {action.label}
                  </Typography>
                </Pressable>
              ) : (
                <Pressable
                  key={action.label}
                  style={tw`items-center rounded-xl bg-neutral-950 py-3.5`}
                  onPress={() => handleActionPress(action.onPress)}
                >
                  <Typography style={tw`text-base font-semibold text-white`}>
                    {action.label}
                  </Typography>
                </Pressable>
              ),
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
