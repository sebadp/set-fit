import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { theme } from '../../constants/theme';

const { width } = Dimensions.get('window');

export const SeriesSlide = ({ onNext }) => {
  const [series, setSeries] = useState(1);
  const titleOpacity = useSharedValue(0);

  useEffect(() => {
    titleOpacity.value = withTiming(1, { duration: 600 });
  }, []);

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#a8edea', '#fed6e3']} style={styles.gradient} />
      <View style={styles.content}>
        <Animated.View style={[styles.header, titleAnimatedStyle]}>
          <Text style={styles.title}>Multiplica con series 🔄</Text>
          <Text style={styles.subtitle}>Repite tu rutina las veces que quieras</Text>
        </Animated.View>

        <View style={styles.demoSection}>
          <View style={styles.blocksRow}>
            <View style={[styles.block, styles.exerciseBlock]}>
              <Text style={styles.blockEmoji}>💪</Text>
            </View>
            <View style={[styles.block, styles.restBlock]}>
              <Text style={styles.blockEmoji}>😴</Text>
            </View>
            <View style={[styles.block, styles.exerciseBlock]}>
              <Text style={styles.blockEmoji}>💪</Text>
            </View>
          </View>

          <View style={styles.seriesControl}>
            <Text style={styles.label}>Series:</Text>
            <Slider
              style={styles.slider}
              value={series}
              onValueChange={setSeries}
              minimumValue={1}
              maximumValue={5}
              step={1}
              thumbStyle={styles.thumb}
              trackStyle={styles.track}
              minimumTrackTintColor={theme.colors.primary}
            />
            <Text style={styles.seriesCount}>{series}x</Text>
          </View>

          <View style={styles.result}>
            {[...Array(series)].map((_, i) => (
              <View key={i} style={styles.seriesRow}>
                <Text style={styles.seriesNumber}>Serie {i + 1}</Text>
                <View style={styles.miniBlocks}>
                  <View style={styles.miniBlock} />
                  <View style={styles.miniBlock} />
                  <View style={styles.miniBlock} />
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.totalWorkout}>
            Tiempo total: {series * 70} segundos
          </Text>
        </View>

        <TouchableOpacity style={styles.continueButton} onPress={onNext}>
          <LinearGradient colors={[theme.colors.primary, theme.colors.primaryDark]} style={styles.continueGradient}>
            <Text style={styles.continueText}>Continuar</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, width },
  gradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: theme.spacing.xl },
  header: { alignItems: 'center', marginBottom: theme.spacing.xxl },
  title: { fontSize: 28, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: theme.spacing.md },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', textAlign: 'center' },
  demoSection: { alignItems: 'center', marginBottom: theme.spacing.xl },
  blocksRow: { flexDirection: 'row', marginBottom: theme.spacing.lg },
  block: { width: 40, height: 40, borderRadius: 8, marginHorizontal: 4, alignItems: 'center', justifyContent: 'center' },
  exerciseBlock: { backgroundColor: 'rgba(255,107,107,0.8)' },
  restBlock: { backgroundColor: 'rgba(116,185,255,0.8)' },
  blockEmoji: { fontSize: 20 },
  seriesControl: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.lg, width: '100%' },
  label: { fontSize: 18, color: 'white', fontWeight: '600' },
  slider: { flex: 1, marginHorizontal: 16 },
  seriesCount: { fontSize: 24, fontWeight: 'bold', color: 'white', minWidth: 40 },
  result: { marginBottom: theme.spacing.lg },
  seriesRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  seriesNumber: { fontSize: 14, color: 'white', width: 60 },
  miniBlocks: { flexDirection: 'row' },
  miniBlock: { width: 12, height: 12, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 2, marginHorizontal: 1 },
  totalWorkout: { fontSize: 16, color: 'white', fontWeight: '600' },
  continueButton: { borderRadius: 25, overflow: 'hidden' },
  continueGradient: { paddingVertical: 14, paddingHorizontal: 32, alignItems: 'center' },
  continueText: { color: 'white', fontSize: 16, fontWeight: '600' },
  thumb: { backgroundColor: 'white', width: 20, height: 20 },
  track: { height: 4, borderRadius: 2 },
});
