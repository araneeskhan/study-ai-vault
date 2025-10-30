import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { PdfUploadComponent } from '@/components/pdf/PdfUploadComponent';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';

export default function PdfUploadScreen() {
  const handleUploadComplete = () => {
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <IconSymbol 
            name="arrow.left" 
            size={24} 
            color="#0a7ea4" 
            onPress={handleCancel}
          />
          <ThemedText style={styles.headerTitle}>Upload PDF</ThemedText>
        </View>
      </View>
      
      <PdfUploadComponent 
        onUploadComplete={handleUploadComplete}
        onCancel={handleCancel}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 15,
  },
});