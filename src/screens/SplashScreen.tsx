import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  Easing,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const bgOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    // Exit animation after 2.5s
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(bgOpacity, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        onFinish();
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, [onFinish, scaleAnim, opacityAnim, bgOpacity]);

  return (
    <Animated.View style={[styles.container, { opacity: bgOpacity }]}>
      {/* Subtle radial gradient simulation via layered circles */}
      <View style={styles.bgLayer}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
      </View>

      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: opacityAnim,
            transform: [
              { scale: scaleAnim },
              {
                rotate: opacityAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['-10deg', '0deg'],
                }),
              },
            ],
          },
        ]}
      >
        {/* Outer ring */}
        <View style={styles.outerRing}>
          {/* Inner ring */}
          <View style={styles.innerRing}>
            {/* Logo center */}
            <View style={styles.logoCenter}>
              <View style={styles.coffeeIcon}>
                <View style={styles.cupBody}>
                  <View style={styles.cupHandle} />
                  <View style={styles.steam1} />
                  <View style={styles.steam2} />
                  <View style={styles.steam3} />
                </View>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Bottom accent line */}
      <Animated.View
        style={[
          styles.accentLine,
          {
            opacity: opacityAnim,
            transform: [
              {
                scaleX: opacityAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
            ],
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  bgLayer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle1: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: (width * 1.2) / 2,
    backgroundColor: '#1e293b',
    opacity: 0.5,
  },
  circle2: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    backgroundColor: '#334155',
    opacity: 0.3,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: '#d97706',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
  },
  innerRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: '#d97706',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.6,
  },
  logoCenter: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#d97706',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#d97706',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  coffeeIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cupBody: {
    width: 36,
    height: 28,
    borderRadius: 4,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cupHandle: {
    position: 'absolute',
    right: -10,
    top: 6,
    width: 12,
    height: 16,
    borderRadius: 6,
    borderWidth: 3,
    borderColor: '#fff',
    borderLeftWidth: 0,
    backgroundColor: 'transparent',
  },
  steam1: {
    position: 'absolute',
    top: -10,
    left: 8,
    width: 3,
    height: 8,
    borderRadius: 1.5,
    backgroundColor: '#fff',
    opacity: 0.6,
  },
  steam2: {
    position: 'absolute',
    top: -12,
    left: 16,
    width: 3,
    height: 10,
    borderRadius: 1.5,
    backgroundColor: '#fff',
    opacity: 0.4,
  },
  steam3: {
    position: 'absolute',
    top: -8,
    left: 24,
    width: 3,
    height: 6,
    borderRadius: 1.5,
    backgroundColor: '#fff',
    opacity: 0.5,
  },
  accentLine: {
    position: 'absolute',
    bottom: height * 0.15,
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#d97706',
  },
});
