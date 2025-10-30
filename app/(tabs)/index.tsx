import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PdfGallery } from '@/components/pdf/PdfGallery';
import { useTheme } from '@/hooks/use-theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';

export default function HomeScreen() {
  const theme = useTheme();
  const [selectedGenre, setSelectedGenre] = useState<string>('All');

  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre);
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surfaceElevated }]}>
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Study AI Vault</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Discover and share educational PDFs
          </ThemedText>
        </View>
        
        <View style={styles.headerActions}>
          <View style={[styles.searchButton, { backgroundColor: theme.colors.primary + '20' }]}>
            <IconSymbol name="magnifyingglass" size={20} color={theme.colors.primary} />
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={styles.content}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <ThemedText style={styles.welcomeTitle}>
            Welcome to Study AI Vault
          </ThemedText>
          <ThemedText style={styles.welcomeDescription}>
            Explore a vast collection of educational PDFs shared by students and educators worldwide. 
            Upload your own study materials and help build the ultimate learning community.
          </ThemedText>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.surfaceElevated }]}>
            <IconSymbol name="doc.text" size={24} color={theme.colors.primary} />
            <ThemedText style={styles.statNumber}>10K+</ThemedText>
            <ThemedText style={styles.statLabel}>PDFs Available</ThemedText>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.colors.surfaceElevated }]}>
            <IconSymbol name="person.2" size={24} color={theme.colors.secondary} />
            <ThemedText style={styles.statNumber}>5K+</ThemedText>
            <ThemedText style={styles.statLabel}>Active Users</ThemedText>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.colors.surfaceElevated }]}>
            <IconSymbol name="arrow.up.circle" size={24} color={theme.colors.success} />
            <ThemedText style={styles.statNumber}>500+</ThemedText>
            <ThemedText style={styles.statLabel}>New Uploads Daily</ThemedText>
          </View>
        </View>

        {/* Featured Section */}
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Featured PDFs</ThemedText>
            <ThemedText style={styles.sectionSubtitle}>
              Handpicked educational resources
            </ThemedText>
          </View>
          
          <PdfGallery 
            genre="Technology"
            showUploadButton={false}
          />
        </View>

        {/* Popular Genres */}
        <View style={styles.genresSection}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Browse by Category</ThemedText>
            <ThemedText style={styles.sectionSubtitle}>
              Find PDFs in your area of interest
            </ThemedText>
          </View>
          
          <View style={styles.genreGrid}>
            {[
              { name: 'Programming', icon: 'chevron.left.forwardslash.chevron.right', color: theme.colors.primary },
              { name: 'Data Science', icon: 'chart.bar', color: theme.colors.secondary },
              { name: 'Mathematics', icon: 'function', color: theme.colors.success },
              { name: 'Science', icon: 'flask', color: theme.colors.warning },
              { name: 'Business', icon: 'briefcase', color: theme.colors.error },
              { name: 'Engineering', icon: 'gearshape', color: theme.colors.info },
            ].map((genre) => (
              <View 
                key={genre.name}
                style={[styles.genreCard, { backgroundColor: theme.colors.surfaceElevated }]}
              >
                <View style={[styles.genreIcon, { backgroundColor: genre.color + '20' }]}>
                  <IconSymbol name={genre.icon} size={24} color={genre.color} />
                </View>
                <ThemedText style={styles.genreName}>{genre.name}</ThemedText>
                <ThemedText style={styles.genreCount}>100+ PDFs</ThemedText>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Uploads */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Recent Uploads</ThemedText>
            <ThemedText style={styles.sectionSubtitle}>
              Latest additions to our collection
            </ThemedText>
          </View>
          
          <PdfGallery showUploadButton={false} />
        </View>

        {/* Upload CTA */}
        <View style={[styles.uploadCTA, { backgroundColor: theme.colors.primary + '10' }]}>
          <IconSymbol name="cloud.upload" size={48} color={theme.colors.primary} />
          <ThemedText style={styles.uploadCTATitle}>Share Your Knowledge</ThemedText>
          <ThemedText style={styles.uploadCTADescription}>
            Upload your study materials and help other students learn. 
            Join thousands of educators sharing their expertise.
          </ThemedText>
          <View 
            style={[styles.uploadButton, { backgroundColor: theme.colors.primary }]}
            onTouchEnd={() => router.push('/pdf-upload')}
          >
            <IconSymbol name="plus" size={20} color="white" />
            <ThemedText style={styles.uploadButtonText}>Upload PDF</ThemedText>
          </View>
        </View>
      </ScrollView>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
    lineHeight: 34,
  },
  welcomeDescription: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
  featuredSection: {
    marginBottom: 30,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  genresSection: {
    marginBottom: 30,
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  genreCard: {
    width: '48%',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  genreIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  genreName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  genreCount: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
  },
  recentSection: {
    marginBottom: 30,
  },
  uploadCTA: {
    margin: 20,
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  uploadCTATitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
  },
  uploadCTADescription: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 25,
    opacity: 0.8,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
});
