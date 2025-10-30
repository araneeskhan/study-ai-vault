import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/use-theme';
import { ApiService } from '@/services/api.service';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 40) / 2; // 2 columns with 20px padding

interface Pdf {
  _id: string;
  title: string;
  description: string;
  genre: string;
  subGenre: string;
  tags: string[];
  uploader: {
    _id: string;
    fullName: string;
    avatar?: string;
  };
  fileName: string;
  fileSize: number;
  viewCount: number;
  downloadCount: number;
  likeCount: number;
  rating: {
    average: number;
    count: number;
  };
  isPublic: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  coverImage?: string;
  author: string;
  language: string;
  pageCount: number;
}

interface PdfGalleryProps {
  genre?: string;
  userId?: string;
  showUploadButton?: boolean;
}

export function PdfGallery({ genre, userId, showUploadButton = true }: PdfGalleryProps) {
  const { token } = useAuth();
  const theme = useTheme();
  const [pdfs, setPdfs] = useState<Pdf[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<string>('');

  const genres = [
    'All',
    'Academic',
    'Technology',
    'Business',
    'Science',
    'Mathematics',
    'History',
    'Literature',
    'Art & Design',
    'Engineering',
    'Medicine',
    'Programming',
    'Data Science',
    'Other'
  ];

  const fetchPdfs = async (isRefresh = false) => {
    try {
      if (!token) return;

      const currentPage = isRefresh ? 1 : page;
      const filters: any = {
        page: currentPage,
        limit: 20,
        sort: '-createdAt',
      };

      if (genre && genre !== 'All') {
        filters.genre = genre;
      }

      if (userId) {
        filters.uploader = userId;
      }

      const response = await ApiService.getPdfs(token, filters);

      if (response.success) {
        const newPdfs = response.data.pdfs;
        
        if (isRefresh) {
          setPdfs(newPdfs);
          setPage(1);
        } else {
          setPdfs(prev => [...prev, ...newPdfs]);
        }
        
        setHasMore(newPdfs.length === 20);
      }
    } catch (error) {
      console.error('Error fetching PDFs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPdfs(true);
  }, [token, genre, userId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPdfs(true);
  };

  const loadMore = () => {
    if (!loading && hasMore && !refreshing) {
      setPage(prev => prev + 1);
      fetchPdfs();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderPdfCard = ({ item }: { item: Pdf }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.surfaceElevated }]}
      onPress={() => router.push(`/pdf-viewer?id=${item._id}`)}
    >
      {/* Cover Image */}
      <View style={styles.coverContainer}>
        {item.coverImage ? (
          <Image source={{ uri: item.coverImage }} style={styles.coverImage} />
        ) : (
          <View style={[styles.coverPlaceholder, { backgroundColor: theme.colors.primary + '20' }]}>
            <IconSymbol name="doc.text" size={40} color={theme.colors.primary} />
          </View>
        )}
        
        {/* Genre Badge */}
        <View style={[styles.genreBadge, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.genreText}>{item.genre}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        
        {item.author && (
          <Text style={styles.author} numberOfLines={1}>by {item.author}</Text>
        )}

        {/* Uploader Info */}
        <View style={styles.uploaderInfo}>
          {item.uploader.avatar ? (
            <Image source={{ uri: item.uploader.avatar }} style={styles.uploaderAvatar} />
          ) : (
            <View style={[styles.uploaderAvatarPlaceholder, { backgroundColor: theme.colors.primary + '30' }]}>
              <ThemedText style={styles.uploaderAvatarText}>
                {item.uploader.fullName.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
          )}
          <Text style={styles.uploaderName} numberOfLines={1}>
            {item.uploader.fullName}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.stat}>
            <IconSymbol name="eye" size={14} color="#666" />
            <Text style={styles.statText}>{item.viewCount}</Text>
          </View>
          
          <View style={styles.stat}>
            <IconSymbol name="heart" size={14} color="#666" />
            <Text style={styles.statText}>{item.likeCount}</Text>
          </View>
          
          {item.rating.count > 0 && (
            <View style={styles.stat}>
              <IconSymbol name="star.fill" size={14} color="#FFD700" />
              <Text style={styles.statText}>
                {item.rating.average.toFixed(1)} ({item.rating.count})
              </Text>
            </View>
          )}
          
          <Text style={styles.fileSize}>{formatFileSize(item.fileSize)}</Text>
        </View>

        {/* Language and Pages */}
        <View style={styles.metaInfo}>
          <Text style={styles.metaText}>{item.language}</Text>
          {item.pageCount > 0 && (
            <Text style={styles.metaText}>{item.pageCount} pages</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderGenreFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.genreFilter}
      contentContainerStyle={styles.genreFilterContent}
    >
      {genres.map((g) => (
        <TouchableOpacity
          key={g}
          style={[
            styles.genreChip,
            selectedGenre === g && [styles.genreChipActive, { backgroundColor: theme.colors.primary }]
          ]}
          onPress={() => {
            setSelectedGenre(g);
            // You can add genre filtering logic here
          }}
        >
          <Text style={[
            styles.genreChipText,
            selectedGenre === g && styles.genreChipTextActive
          ]}>
            {g}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  if (loading && pdfs.length === 0) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Genre Filter */}
      {renderGenreFilter()}

      {/* Upload Button */}
        {showUploadButton && (
          <TouchableOpacity
            style={[styles.uploadButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.push('/pdf-upload')}
          >
            <IconSymbol name="plus" size={20} color="white" />
            <Text style={styles.uploadButtonText}>Upload PDF</Text>
          </TouchableOpacity>
        )}

      {/* PDF Grid */}
      <FlatList
        data={pdfs}
        renderItem={renderPdfCard}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.column}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => (
          loading && pdfs.length > 0 ? (
            <ActivityIndicator size="small" color={theme.colors.primary} style={styles.loadMore} />
          ) : null
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <IconSymbol name="doc.text" size={60} color="#999" />
            <ThemedText style={styles.emptyText}>No PDFs found</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              {showUploadButton ? "Upload your first PDF to get started!" : "No PDFs available in this category"}
            </ThemedText>
          </View>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  genreFilter: {
    maxHeight: 50,
    marginBottom: 15,
  },
  genreFilterContent: {
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  genreChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
  },
  genreChipActive: {
    backgroundColor: '#007AFF',
  },
  genreChipText: {
    fontSize: 14,
    color: '#666',
  },
  genreChipTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginHorizontal: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  grid: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  column: {
    justifyContent: 'space-between',
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coverContainer: {
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  genreBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  genreText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  cardContent: {
    padding: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 20,
  },
  author: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  uploaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  uploaderAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  uploaderAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploaderAvatarText: {
    fontSize: 12,
    fontWeight: '600',
  },
  uploaderName: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 11,
    color: '#999',
  },
  loadMore: {
    paddingVertical: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});