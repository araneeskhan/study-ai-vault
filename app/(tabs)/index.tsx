import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// Mock data for demonstration
const GENRES = [
  { name: 'Programming', icon: '💻', count: 1234, color: ['#3B82F6', '#06B6D4'] },
  { name: 'Data Science', icon: '📊', count: 856, color: ['#8B5CF6', '#EC4899'] },
  { name: 'Mathematics', icon: '🔢', count: 1089, color: ['#10B981', '#34D399'] },
  { name: 'Science', icon: '🔬', count: 945, color: ['#F97316', '#EF4444'] },
  { name: 'Business', icon: '💼', count: 723, color: ['#EAB308', '#F97316'] },
  { name: 'Engineering', icon: '⚙️', count: 891, color: ['#6366F1', '#8B5CF6'] },
  { name: 'Literature', icon: '📚', count: 1456, color: ['#F43F5E', '#EC4899'] },
  { name: 'History', icon: '🏛️', count: 678, color: ['#F59E0B', '#EAB308'] },
];

const FEATURED_BOOKS = [
  {
    id: 1,
    title: 'Advanced JavaScript Patterns',
    author: 'Sarah Johnson',
    genre: 'Programming',
    rating: 4.8,
    downloads: 2345,
    cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop'
  },
  {
    id: 2,
    title: 'Machine Learning Fundamentals',
    author: 'Dr. Michael Chen',
    genre: 'Data Science',
    rating: 4.9,
    downloads: 3421,
    cover: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300&h=400&fit=crop'
  },
  {
    id: 3,
    title: 'Quantum Physics Explained',
    author: 'Prof. Emily Watson',
    genre: 'Science',
    rating: 4.7,
    downloads: 1876,
    cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=400&fit=crop'
  },
  {
    id: 4,
    title: 'Business Strategy Guide',
    author: 'James Wilson',
    genre: 'Business',
    rating: 4.6,
    downloads: 1543,
    cover: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&h=400&fit=crop'
  },
];

const TRENDING_TOPICS = [
  'AI & Machine Learning',
  'Web Development',
  'Data Structures',
  'Cloud Computing',
  'Cybersecurity',
];

export default function StudyVaultHome() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Hero Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#3B82F6', '#6366F1']}
                style={styles.logoGradient}
              >
                <Text style={styles.logoText}>📚</Text>
              </LinearGradient>
              <View style={styles.titleContainer}>
                <Text style={styles.mainTitle}>Study AI Vault</Text>
                <Text style={styles.subtitle}>Knowledge Library</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.uploadButton}>
              <LinearGradient
                colors={['#3B82F6', '#6366F1']}
                style={styles.uploadButtonGradient}
              >
                <Text style={styles.uploadButtonText}>Upload PDF</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={[styles.searchContainer, isSearchFocused && styles.searchContainerFocused]}>
            <View style={styles.searchContent}>
              <Text style={styles.searchTitle}>Discover Your Next Learning Resource</Text>
              <Text style={styles.searchSubtitle}>
                Explore 10,000+ educational PDFs from students and educators worldwide
              </Text>
              
              <View style={styles.searchInputContainer}>
                <TextInput
                  placeholder="Search for books, topics, or authors..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  style={styles.searchInput}
                />
                <LinearGradient
                  colors={['#3B82F6', '#6366F1']}
                  style={styles.filterButton}
                >
                  <Text style={styles.filterButtonText}>🔍</Text>
                </LinearGradient>
              </View>

              {/* Trending Topics */}
              <View style={styles.trendingContainer}>
                <Text style={styles.trendingLabel}>Trending:</Text>
                {TRENDING_TOPICS.map((topic, idx) => (
                  <TouchableOpacity key={idx} style={styles.trendingButton}>
                    <LinearGradient
                      colors={['#EFF6FF', '#EEF2FF']}
                      style={styles.trendingButtonGradient}
                    >
                      <Text style={styles.trendingButtonText}>{topic}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statsContainer}>
            {[
              { label: 'PDFs Available', value: '10,234', color: ['#3B82F6', '#06B6D4'], icon: '📚' },
              { label: 'Active Users', value: '5,847', color: ['#8B5CF6', '#EC4899'], icon: '👥' },
              { label: 'Daily Uploads', value: '543', color: ['#10B981', '#34D399'], icon: '📈' },
              { label: 'Top Contributors', value: '1,234', color: ['#F97316', '#EF4444'], icon: '🏆' },
            ].map((stat, idx) => (
              <View key={idx} style={styles.statCard}>
                <LinearGradient colors={stat.color} style={styles.statIcon}>
                  <Text style={styles.statIconText}>{stat.icon}</Text>
                </LinearGradient>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Featured Books */}
        <View style={styles.featuredSection}>
          <View style={styles.featuredHeader}>
            <View style={styles.featuredTitleContainer}>
              <Text style={styles.featuredTitleIcon}>✨</Text>
              <Text style={styles.featuredTitle}>Featured PDFs</Text>
            </View>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
              <Text style={styles.viewAllIcon}>→</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredBooksContainer}>
            {FEATURED_BOOKS.map((book) => (
              <TouchableOpacity key={book.id} style={styles.bookCard}>
                <View style={styles.bookCover}>
                  <LinearGradient colors={['#F3F4F6', '#E5E7EB']} style={styles.bookCoverGradient}>
                    <Text style={styles.bookCoverEmoji}>📚</Text>
                  </LinearGradient>
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>⭐ {book.rating}</Text>
                  </View>
                </View>
                <View style={styles.bookInfo}>
                  <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
                  <Text style={styles.bookAuthor}>{book.author}</Text>
                  <View style={styles.bookFooter}>
                    <View style={styles.genreBadge}>
                      <Text style={styles.genreText}>{book.genre}</Text>
                    </View>
                    <View style={styles.downloadsContainer}>
                      <Text style={styles.downloadsIcon}>📈</Text>
                      <Text style={styles.downloadsText}>{book.downloads}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Browse Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.categoriesTitle}>Browse by Category</Text>

          <View style={styles.categoriesGrid}>
            {GENRES.map((genre, idx) => (
              <TouchableOpacity key={idx} style={styles.categoryCard}>
                <LinearGradient colors={genre.color} style={styles.categoryIcon}>
                  <Text style={styles.categoryIconText}>{genre.icon}</Text>
                </LinearGradient>
                <Text style={styles.categoryName}>{genre.name}</Text>
                <Text style={styles.categoryCount}>{genre.count} PDFs</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Upload CTA */}
        <View style={styles.ctaSection}>
          <LinearGradient colors={['#3B82F6', '#6366F1']} style={styles.ctaContainer}>
            <View style={styles.ctaContent}>
              <View style={styles.ctaIconContainer}>
                <Text style={styles.ctaIcon}>📤</Text>
              </View>
              <Text style={styles.ctaTitle}>Share Your Knowledge with the World</Text>
              <Text style={styles.ctaDescription}>
                Join thousands of educators and students contributing to our growing library. Upload your study materials and make a difference in someone's education journey.
              </Text>
              <View style={styles.ctaButtons}>
                <TouchableOpacity style={styles.ctaPrimaryButton}>
                  <Text style={styles.ctaPrimaryButtonText}>Upload Your PDF</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.ctaSecondaryButton}>
                  <Text style={styles.ctaSecondaryButtonText}>Learn More</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <Text style={styles.footerText}>© 2024 Study AI Vault. Built with 💙 for learners.</Text>
            <View style={styles.footerLinks}>
              <TouchableOpacity><Text style={styles.footerLink}>About</Text></TouchableOpacity>
              <TouchableOpacity><Text style={styles.footerLink}>Community</Text></TouchableOpacity>
              <TouchableOpacity><Text style={styles.footerLink}>Support</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.5)',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoGradient: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  titleContainer: {
    justifyContent: 'center',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  uploadButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  uploadButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  searchContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    transform: [{ scale: 1 }],
  },
  searchContainerFocused: {
    transform: [{ scale: 1.05 }],
  },
  searchContent: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  searchTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  searchSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    marginRight: 8,
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  trendingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  trendingLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  trendingButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  trendingButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  trendingButtonText: {
    fontSize: 14,
    color: '#1D4ED8',
    fontWeight: '500',
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIconText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  featuredSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  featuredTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredTitleIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  featuredTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
    marginRight: 4,
  },
  viewAllIcon: {
    fontSize: 16,
    color: '#3B82F6',
  },
  featuredBooksContainer: {
    flexDirection: 'row',
  },
  bookCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginRight: 16,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  bookCover: {
    height: 240,
    position: 'relative',
  },
  bookCoverGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookCoverEmoji: {
    fontSize: 48,
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  bookInfo: {
    padding: 16,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  bookFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  genreBadge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  genreText: {
    fontSize: 12,
    color: '#1D4ED8',
    fontWeight: '500',
  },
  downloadsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadsIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  downloadsText: {
    fontSize: 12,
    color: '#6B7280',
  },
  categoriesSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  categoriesTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIconText: {
    fontSize: 28,
    color: '#FFFFFF',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  ctaSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  ctaContainer: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  ctaContent: {
    padding: 32,
    alignItems: 'center',
  },
  ctaIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  ctaIcon: {
    fontSize: 32,
    color: '#FFFFFF',
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  ctaDescription: {
    fontSize: 16,
    color: '#DBEAFE',
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 320,
  },
  ctaButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  ctaPrimaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  ctaPrimaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  ctaSecondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  ctaSecondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  footer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(229, 231, 235, 0.5)',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 16,
  },
  footerLink: {
    fontSize: 14,
    color: '#6B7280',
  },
});