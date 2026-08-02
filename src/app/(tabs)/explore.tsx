import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { wardrobePresets } from '@/data/wardrobe-presets';

export default function PresetsScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>VIRTUAL WARDROBE</Text>
          <Text style={styles.title}>Presets</Text>
          <Text style={styles.intro}>Browse curated looks for every version of your day.</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>The wardrobe edit</Text>
          <Text style={styles.count}>{wardrobePresets.length} LOOKS</Text>
        </View>

        <View style={styles.grid}>
          {wardrobePresets.map((preset) => (
            <Pressable
              accessibilityRole="button"
              key={preset.id}
              onPress={() =>
                router.push({ pathname: '/(tabs)/try-on', params: { presetId: preset.id } })
              }
              style={styles.card}>
              <Image
                cachePolicy="memory-disk"
                contentFit="cover"
                source={{ uri: preset.previewUri }}
                style={[styles.image, { backgroundColor: preset.tint }]}
              />
              <View style={styles.cardCopy}>
                <Text numberOfLines={1} style={styles.cardTitle}>
                  {preset.name}
                </Text>
                <Text numberOfLines={1} style={styles.cardLabel}>
                  {preset.styleLabel}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F7F3' },
  content: { padding: 20, paddingBottom: 34, gap: 24 },
  header: { paddingTop: 8 },
  eyebrow: { color: '#8E887D', fontSize: 10, fontWeight: '700', letterSpacing: 1.3 },
  title: { color: '#262520', fontSize: 38, fontWeight: '700', letterSpacing: -1.3, marginTop: 4 },
  intro: { color: '#77736A', fontSize: 15, lineHeight: 21, marginTop: 8, maxWidth: 275 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: '#302F2A', fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  count: { color: '#8C867D', fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '48.1%', overflow: 'hidden', borderRadius: 18, backgroundColor: '#EEECE6' },
  image: { width: '100%', aspectRatio: 0.68 },
  cardCopy: { paddingHorizontal: 12, paddingVertical: 11 },
  cardTitle: { color: '#393730', fontSize: 14, fontWeight: '700' },
  cardLabel: { color: '#817C73', fontSize: 11, marginTop: 4, textTransform: 'capitalize' },
});
