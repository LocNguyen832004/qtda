import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface TomatoLogoProps {
  size?: number;
  framed?: boolean;
}

export const TomatoLogo: React.FC<TomatoLogoProps> = ({ size = 96, framed = true }) => {
  const tomatoSize = size * 0.72;
  const leafSize = size * 0.18;

  return (
    <View
      style={[
        styles.wrapper,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: framed ? '#fff' : 'transparent',
        },
      ]}
    >
      <View style={[styles.mark, { width: tomatoSize, height: tomatoSize * 0.88 }]}>
        <View style={[styles.leaf, styles.leafLeft, { width: leafSize, height: leafSize }]} />
        <View style={[styles.leaf, styles.leafMiddle, { width: leafSize * 1.1, height: leafSize * 1.1 }]} />
        <View style={[styles.leaf, styles.leafRight, { width: leafSize, height: leafSize }]} />

        <LinearGradient
          colors={['#FF7A5C', '#F04438', '#C9252D']}
          start={{ x: 0.18, y: 0 }}
          end={{ x: 0.82, y: 1 }}
          style={[
            styles.tomato,
            {
              width: tomatoSize,
              height: tomatoSize * 0.78,
              borderRadius: tomatoSize * 0.36,
              top: size * 0.19,
            },
          ]}
        >
          <View
            style={[
              styles.highlight,
              {
                width: tomatoSize * 0.18,
                height: tomatoSize * 0.08,
                borderRadius: tomatoSize * 0.05,
              },
            ]}
          />
          <View
            style={[
              styles.clockFace,
              {
                width: tomatoSize * 0.34,
                height: tomatoSize * 0.34,
                borderRadius: tomatoSize * 0.17,
                borderWidth: Math.max(2, size * 0.025),
              },
            ]}
          >
            <View style={[styles.clockHand, { height: tomatoSize * 0.1 }]} />
            <View style={[styles.clockHand, styles.clockHandSide, { width: tomatoSize * 0.08 }]} />
          </View>
          <View style={[styles.seed, styles.seedOne]} />
          <View style={[styles.seed, styles.seedTwo]} />
        </LinearGradient>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#A7272E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  mark: {
    alignItems: 'center',
    position: 'relative',
  },
  tomato: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'absolute',
  },
  leaf: {
    backgroundColor: '#2FB56F',
    position: 'absolute',
    top: 2,
    zIndex: 2,
    borderTopLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  leafLeft: {
    transform: [{ rotate: '-36deg' }],
    left: '31%',
  },
  leafMiddle: {
    transform: [{ rotate: '45deg' }],
    left: '43%',
    backgroundColor: '#38C978',
  },
  leafRight: {
    transform: [{ rotate: '76deg' }],
    right: '29%',
    backgroundColor: '#198F5A',
  },
  highlight: {
    position: 'absolute',
    left: '20%',
    top: '22%',
    backgroundColor: 'rgba(255,255,255,0.38)',
    transform: [{ rotate: '-24deg' }],
  },
  clockFace: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(255,255,255,0.92)',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  clockHand: {
    width: 2,
    borderRadius: 2,
    backgroundColor: '#fff',
    position: 'absolute',
    top: '25%',
  },
  clockHandSide: {
    height: 2,
    top: '50%',
    left: '50%',
    transform: [{ rotate: '-18deg' }],
  },
  seed: {
    width: 5,
    height: 8,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.45)',
    position: 'absolute',
  },
  seedOne: {
    left: '24%',
    bottom: '22%',
    transform: [{ rotate: '22deg' }],
  },
  seedTwo: {
    right: '23%',
    top: '28%',
    transform: [{ rotate: '-18deg' }],
  },
});
