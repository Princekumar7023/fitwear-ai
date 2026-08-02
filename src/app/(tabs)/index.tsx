import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getWardrobePreset, wardrobePresets } from '@/data/wardrobe-presets';
import { createWardrobeFlow } from '@/data/wardrobe-flow';
import type { PickedImage, WardrobeMode } from '@/types/wardrobe';

export default function TryOnScreen() {
  const { presetId } = useLocalSearchParams<{ presetId?: string }>();
  const [mode, setMode] = useState<WardrobeMode>('preset');
  const [selectedPresetId, setSelectedPresetId] = useState(wardrobePresets[0].id);
  const [userImage, setUserImage] = useState<PickedImage | null>(null);
  const [referenceImage, setReferenceImage] = useState<PickedImage | null>(null);

  const selectedPreset = getWardrobePreset(selectedPresetId) ?? wardrobePresets[0];

  useEffect(() => {
    const preset = getWardrobePreset(presetId);

    if (preset) {
      setMode('preset');
      setSelectedPresetId(preset.id);
    }
  }, [presetId]);

  async function pickImage(
    setter: (image: PickedImage | null) => void,
    permissionTitle: string,
    permissionMessage: string
  ) {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(permissionTitle, permissionMessage);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 5],
      base64: true,
      quality: 1,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    const asset = result.assets[0];
    setter({
      uri: asset.uri,
      base64: asset.base64 ?? '',
      mimeType: asset.mimeType ?? 'image/jpeg',
      width: asset.width,
      height: asset.height,
      fileName: asset.fileName,
    });
  }

  function openResultScreen() {
    if (!userImage) {
      Alert.alert('Add your photo', 'Please choose your photo before generating.');
      return;
    }

    if (mode === 'custom' && !referenceImage) {
      Alert.alert('Add a reference image', 'Please choose a clothing reference image first.');
      return;
    }

    if (!userImage.base64) {
      Alert.alert('Choose your photo again', 'The selected image could not be prepared for generation.');
      return;
    }

    if (mode === 'custom' && !referenceImage?.base64) {
      Alert.alert(
        'Choose the reference again',
        'The selected clothing image could not be prepared for generation.'
      );
      return;
    }

    const flowId = createWardrobeFlow({
      mode,
      presetId: selectedPreset.id,
      targetImageDataUrl: `data:${userImage.mimeType};base64,${userImage.base64}`,
      ...(mode === 'custom' && referenceImage
        ? { referenceImageDataUrl: `data:${referenceImage.mimeType};base64,${referenceImage.base64}` }
        : {}),
    });

    router.push({
      pathname: '/result',
      params: {
        mode,
        presetId: selectedPreset.id,
        userImageUri: userImage.uri,
        referenceImageUri: referenceImage?.uri ?? '',
        flowId,
      },
    });
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>VIRTUAL WARDROBE</Text>
            <Text style={styles.title}>Try on</Text>
          </View>
          <View style={styles.mark}>
            <Text style={styles.markText}>W</Text>
          </View>
        </View>

        <View style={styles.modeControl} accessibilityRole="tablist">
          {(['preset', 'custom'] as WardrobeMode[]).map((option) => {
            const isActive = mode === option;
            return (
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                key={option}
                onPress={() => setMode(option)}
                style={[styles.modeOption, isActive && styles.modeOptionActive]}>
                <Text style={[styles.modeText, isActive && styles.modeTextActive]}>
                  {option === 'preset' ? 'Preset' : 'Custom'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.photoCard}>
          <View>
            <Text style={styles.sectionTitle}>Your photo</Text>
            <Text style={styles.sectionNote}>Choose the image you want to dress.</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              pickImage(
                setUserImage,
                'Permission required',
                'Photo library access is needed to choose your image.'
              )
            }
            style={styles.uploadButton}>
            {userImage ? (
              <Image contentFit="cover" source={{ uri: userImage.uri }} style={styles.uploadPreview} />
            ) : (
              <View style={styles.uploadIcon}>
                <Text style={styles.uploadPlus}>+</Text>
              </View>
            )}
            <View style={styles.uploadCopy}>
              <Text style={styles.uploadTitle}>{userImage ? 'Photo selected' : 'Add your photo'}</Text>
              <Text numberOfLines={1} style={styles.uploadSubtitle}>
                {userImage ? 'Tap to replace image' : 'JPG, PNG or HEIC'}
              </Text>
            </View>
            <Text style={styles.chevron}>{'>'}</Text>
          </Pressable>
        </View>

        {mode === 'preset' ? (
          <View style={styles.inputSection}>
            <View style={styles.sectionHeading}>
              <View>
                <Text style={styles.sectionTitle}>Choose a look</Text>
                <Text style={styles.sectionNote}>A polished starting point, ready to wear.</Text>
              </View>
              <Text style={styles.count}>{wardrobePresets.length} PRESETS</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.presetRail}>
              {wardrobePresets.map((preset) => {
                const isSelected = preset.id === selectedPresetId;
                return (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    key={preset.id}
                    onPress={() => setSelectedPresetId(preset.id)}
                    style={[styles.presetCard, isSelected && styles.presetCardSelected]}>
                    <Image
                      cachePolicy="memory-disk"
                      contentFit="cover"
                      source={{ uri: preset.previewUri }}
                      style={[styles.presetImage, { backgroundColor: preset.tint }]}
                    />
                    <View style={styles.presetCopy}>
                      <Text style={styles.presetTitle}>{preset.name}</Text>
                    </View>
                    <View style={[styles.radio, isSelected && styles.radioSelected]}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        ) : (
          <View style={styles.photoCard}>
            <View>
              <Text style={styles.sectionTitle}>Reference clothing</Text>
              <Text style={styles.sectionNote}>Pick a clothing image to use as your reference.</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                pickImage(
                  setReferenceImage,
                  'Permission required',
                  'Photo library access is needed to choose a reference image.'
                )
              }
              style={styles.uploadButton}>
              {referenceImage ? (
                <Image
                  contentFit="cover"
                  source={{ uri: referenceImage.uri }}
                  style={styles.uploadPreview}
                />
              ) : (
                <View style={styles.uploadIcon}>
                  <Text style={styles.uploadPlus}>+</Text>
                </View>
              )}
              <View style={styles.uploadCopy}>
                <Text style={styles.uploadTitle}>
                  {referenceImage ? 'Reference selected' : 'Add clothing reference'}
                </Text>
                <Text numberOfLines={1} style={styles.uploadSubtitle}>
                  {referenceImage ? 'Tap to replace image' : 'Choose a clothing image'}
                </Text>
              </View>
              <Text style={styles.chevron}>{'>'}</Text>
            </Pressable>
          </View>
        )}

        <Pressable
          accessibilityRole="button"
          onPress={openResultScreen}
          style={({ pressed }) => [styles.generateButton, pressed && styles.pressed]}>
          <View style={styles.sparkleBadge}>
            <Text style={styles.sparkle}>*</Text>
          </View>
          <Text numberOfLines={1} style={styles.generateText}>
            Generate {mode === 'preset' ? selectedPreset.name : 'custom look'}
          </Text>
          <Text style={styles.arrow}>{'->'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F7F3' },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 34, gap: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { color: '#8E887D', fontSize: 10, fontWeight: '700', letterSpacing: 1.3 },
  title: { color: '#262520', fontSize: 38, fontWeight: '700', letterSpacing: -1.3, marginTop: 4 },
  mark: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#292A26',
  },
  markText: { color: '#F7F5EF', fontSize: 15, fontWeight: '700' },
  modeControl: {
    height: 50,
    padding: 4,
    borderRadius: 16,
    flexDirection: 'row',
    backgroundColor: '#E8E6DF',
  },
  modeOption: { flex: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  modeOptionActive: {
    backgroundColor: '#FCFBF7',
    shadowColor: '#716D64',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  modeText: { color: '#7C776E', fontSize: 14, fontWeight: '700' },
  modeTextActive: { color: '#292925' },
  photoCard: { gap: 14, borderRadius: 20, padding: 16, backgroundColor: '#EEECE6' },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  sectionTitle: { color: '#302F2A', fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  sectionNote: { color: '#888278', fontSize: 12, marginTop: 4, flexShrink: 1 },
  uploadButton: {
    minHeight: 78,
    borderRadius: 15,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDFCF9',
    borderWidth: 1,
    borderColor: '#DEDAD1',
  },
  uploadIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: '#EEEAE1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadPreview: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#DDD7CC' },
  uploadPlus: { color: '#625E56', fontSize: 22, fontWeight: '300', lineHeight: 25 },
  uploadCopy: { flex: 1, minWidth: 0, marginHorizontal: 12 },
  uploadTitle: { color: '#3A3833', fontSize: 14, fontWeight: '700' },
  uploadSubtitle: { color: '#8B857B', fontSize: 11, marginTop: 3 },
  chevron: { color: '#888278', fontSize: 17, fontWeight: '600' },
  inputSection: { gap: 13 },
  count: { color: '#8C867D', fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  presetRail: { gap: 11, paddingRight: 20 },
  presetCard: {
    width: 168,
    minHeight: 206,
    padding: 10,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: '#EEECE6',
  },
  presetCardSelected: { borderColor: '#33342F', backgroundColor: '#F6F5F0' },
  presetImage: { height: 122, borderRadius: 12 },
  presetCopy: { minWidth: 0, marginTop: 10, paddingRight: 20 },
  presetTitle: { color: '#393730', fontSize: 14, fontWeight: '700' },
  radio: {
    position: 'absolute',
    right: 10,
    bottom: 11,
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#A19B91',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: '#363631' },
  radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#363631' },
  generateButton: {
    minHeight: 61,
    borderRadius: 18,
    paddingHorizontal: 15,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#292A26',
  },
  sparkleBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#454740',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle: { color: '#E9D8B9', fontSize: 20, fontWeight: '700' },
  generateText: { color: '#FCFBF7', flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700' },
  arrow: { color: '#FCFBF7', fontSize: 17, fontWeight: '700' },
  pressed: { opacity: 0.82 },
});
