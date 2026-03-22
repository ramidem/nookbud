import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import PagerView from 'react-native-pager-view';

import SlideLog from './illustrations/slide-1-log.svg';
import SlideCoordinate from './illustrations/slide-2-coordinate.svg';
import SlideVerified from './illustrations/slide-3-verified.svg';

import { Button, Typography } from '@/components';
import { useTw } from '@/hooks/useTw';
import type { AuthStackParamList } from '@/navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

interface Slide {
  Illustration: React.FC<{ width: number; height: number }>;
  body: string;
  headline: string;
  key: string;
}

const SLIDES: Slide[] = [
  {
    Illustration: SlideLog,
    body: 'Keep a record of every moment — notes, photos, and timestamps. All in one place.',
    headline: 'Log what happened.',
    key: 'log',
  },
  {
    Illustration: SlideCoordinate,
    body: 'Schedules, agreements, updates. Everyone involved stays on the same page.',
    headline: 'Stay coordinated.',
    key: 'coordinate',
  },
  {
    Illustration: SlideVerified,
    body: 'Every record is timestamped and tamper-proof. Always there when you need it.',
    headline: 'Everything verified.',
    key: 'verified',
  },
];

const LAST_INDEX = SLIDES.length - 1;

export function WelcomeScreen({ navigation }: Props) {
  const tw = useTw();
  const pagerRef = useRef<PagerView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isLast = activeIndex === LAST_INDEX;

  const handleSkip = () => {
    navigation.navigate('SignUp');
  };

  const handleSignIn = () => {
    navigation.navigate('SignIn');
  };

  const handleNext = () => {
    if (isLast) {
      navigation.navigate('SignUp');
    } else {
      pagerRef.current?.setPage(activeIndex + 1);
    }
  };

  return (
    <View style={tw`bg-surface flex-1`}>
      {/* Skip button */}
      {!isLast && (
        <View style={tw`absolute right-6 top-14 z-10`}>
          <Pressable onPress={handleSkip}>
            <Typography style={tw`text-subtitle text-sm`}>Skip</Typography>
          </Pressable>
        </View>
      )}

      {/* Slides */}
      <PagerView
        ref={pagerRef}
        initialPage={0}
        style={tw`flex-1`}
        onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
      >
        {SLIDES.map((slide) => (
          <View key={slide.key} style={tw`flex-1`}>
            <SlideContent
              body={slide.body}
              headline={slide.headline}
              Illustration={slide.Illustration}
            />
          </View>
        ))}
      </PagerView>

      {/* Bottom controls — fixed height so slide content never shifts */}
      <View style={tw`h-52 justify-end px-6 pb-12`}>
        {/* Dot indicators */}
        <View style={tw`mb-6 flex-row items-center justify-center gap-2`}>
          {SLIDES.map((slide, i) => (
            <View
              key={slide.key}
              style={tw`h-2 rounded-full ${i === activeIndex ? 'bg-primary w-6' : 'bg-divider w-2'}`}
            />
          ))}
        </View>

        <View style={tw`gap-3`}>
          <Button size="lg" title={isLast ? 'Get started' : 'Next'} onPress={handleNext} />
          <Button
            size="lg"
            style={tw`${isLast ? '' : 'opacity-0'}`}
            title="Sign in"
            variant="outlined"
            onPress={isLast ? handleSignIn : undefined}
          />
        </View>
      </View>
    </View>
  );
}

function SlideContent({
  body,
  headline,
  Illustration,
}: {
  Illustration: React.FC<{ height: number; width: number }>;
  body: string;
  headline: string;
}) {
  const tw = useTw();

  return (
    <View style={tw`flex-1 px-6`}>
      {/* Illustration */}
      <View style={tw`mb-10 mt-16 flex-1 items-center justify-center`}>
        <Illustration height={280} width={280} />
      </View>

      {/* Text */}
      <View style={tw`pb-4`}>
        <Typography style={tw`text-foreground font-serif-bold mb-3 text-3xl`}>
          {headline}
        </Typography>
        <Typography style={tw`text-subtitle text-base leading-6`}>{body}</Typography>
      </View>
    </View>
  );
}
