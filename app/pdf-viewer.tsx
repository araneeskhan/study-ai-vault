import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { PdfViewer } from '@/components/pdf/PdfViewer';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router, useLocalSearchParams } from 'expo-router';

export default function PdfViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const handleBack = () => {
    router.back();
  };

  if (!id) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <IconSymbol 
            name="arrow.left" 
            size={24} 
            color="#0a7ea4" 
            onPress={handleBack}
          />
          <ThemedText style={styles.headerTitle}>PDF Not Found</ThemedText>
        </View>
        <ThemedText style={styles.errorText}>No PDF ID provided</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <IconSymbol 
          name="arrow.left" 
          size={24} 
          color="#0a7ea4" 
          onPress={handleBack}
        />
        <ThemedText style={styles.headerTitle}>PDF Viewer</ThemedText>
      </View>
      
      <PdfViewer pdfId={id} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 15,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    opacity: 0.7,
  },
});