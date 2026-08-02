import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getWardrobeFlow, removeWardrobeFlow } from '@/data/wardrobe-flow';
import { getWardrobePreset } from '@/data/wardrobe-presets';
import type { WardrobeGenerateResponse } from '@/types/wardrobe';

export default function ResultScreen() {
  const router = useRouter();
  const { mode, presetId, userImageUri, referenceImageUri, flowId } = useLocalSearchParams<{
    mode?: string;
    presetId?: string;
    userImageUri?: string;
    referenceImageUri?: string;
    flowId?: string;
  }>();
  const [isLoading, setIsLoading] = useState(true);
  const [generatedImageUri, setGeneratedImageUri] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const preset = useMemo(() => getWardrobePreset(presetId), [presetId]);

  useEffect(() => {
    let isMounted = true;
    const flow = flowId ? getWardrobeFlow(flowId) : undefined;

    if (!flow) {
      setErrorMessage('This try-on session is no longer available. Please start again.');
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const { mode: flowMode, presetId: flowPresetId, targetImageDataUrl, referenceImageDataUrl } = flow;

    async function generateLook() {
      try {
        const response = await fetch('/api/wardrobe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: flowMode,
            presetId: flowPresetId,
            targetImageDataUrl,
            referenceImageDataUrl,
          }),
        });
        const data = (await response.json()) as WardrobeGenerateResponse | { error?: { message?: string } };

        if (!response.ok) {
          throw new Error('error' in data ? data.error?.message : 'Wardrobe generation failed.');
        }

        if (isMounted) {
          setGeneratedImageUri((data as WardrobeGenerateResponse).imageDataUrl);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Wardrobe generation failed.');
        }
      } finally {
        if (isMounted) {
          removeWardrobeFlow(flowId as string);
          setIsLoading(false);
        }
      }
    }

    void generateLook();
    return () => {
      isMounted = false;
    };
  }, [flowId]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>RESULT</Text>
        <Text style={styles.title}>{isLoading ? 'Generating your look' : 'Your result'}</Text>

        {isLoading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color="#292A26" size="large" />
            <Text style={styles.loadingText}>Preparing your try-on preview...</Text>
          </View>
        ) : (
          <View style={styles.resultCard}>
            <View style={styles.previewGrid}>
              <View style={styles.previewPanel}>
                <Text style={styles.previewLabel}>YOUR PHOTO</Text>
                {userImageUri ? (
                  <Image contentFit="cover" source={{ uri: userImageUri }} style={styles.previewImage} />
                ) : (
                  <View style={styles.previewPlaceholder} />
                )}
              </View>

              <View style={styles.previewPanel}>
                <Text style={styles.previewLabel}>
                  {mode === 'custom' ? 'REFERENCE LOOK' : 'SELECTED PRESET'}
                </Text>
                {generatedImageUri ? (
                  <Image contentFit="cover" source={{ uri: generatedImageUri }} style={styles.previewImage} />
                ) : mode === 'custom' && referenceImageUri ? (
                  <Image
                    contentFit="cover"
                    source={{ uri: referenceImageUri }}
                    style={styles.previewImage}
                  />
                ) : preset ? (
                  <Image
                    contentFit="cover"
                    source={{ uri: preset.previewUri }}
                    style={[styles.previewImage, { backgroundColor: preset.tint }]}
                  />
                ) : (
                  <View style={styles.previewPlaceholder} />
                )}
              </View>
            </View>

            <Text style={styles.resultName}>
              {mode === 'custom' ? 'Custom reference selected' : preset?.name ?? 'Preset selected'}
            </Text>
            <Text style={styles.resultNote}>
              {errorMessage ?? 'Your generated wardrobe preview is ready.'}
            </Text>
          </View>
        )}

        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <Text style={styles.buttonText}>{isLoading ? 'Back' : 'Try another look'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F7F3' },
  container: { flex: 1, padding: 20, gap: 24 },
  eyebrow: { color: '#8E887D', fontSize: 10, fontWeight: '700', letterSpacing: 1.3 },
  title: { color: '#262520', fontSize: 34, fontWeight: '700', letterSpacing: -1.2 },
  loadingCard: {
    flex: 1,
    minHeight: 280,
    borderRadius: 24,
    backgroundColor: '#EEECE6',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  loadingText: { color: '#5D5A54', fontSize: 15, fontWeight: '600' },
  resultCard: { gap: 16, borderRadius: 24, backgroundColor: '#EEECE6', padding: 16 },
  previewGrid: { flexDirection: 'row', gap: 12 },
  previewPanel: { flex: 1, gap: 8 },
  previewLabel: { color: '#8C867D', fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  previewImage: { width: '100%', aspectRatio: 0.75, borderRadius: 18, backgroundColor: '#DDD6CA' },
  previewPlaceholder: { width: '100%', aspectRatio: 0.75, borderRadius: 18, backgroundColor: '#DDD6CA' },
  resultName: { color: '#302F2A', fontSize: 18, fontWeight: '700' },
  resultNote: { color: '#77736A', fontSize: 13, lineHeight: 20 },
  button: {
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: '#292A26',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#FCFBF7', fontSize: 16, fontWeight: '700' },
  pressed: { opacity: 0.82 },
});
