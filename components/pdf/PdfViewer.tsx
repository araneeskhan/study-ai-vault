import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/use-theme';
import { ApiService } from '@/services/api.service';
import * as FileSystem from 'expo-file-system';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

interface PdfDetails {
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
  fileUrl: string;
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
  isLiked: boolean;
  userRating?: number;
  comments: Comment[];
}

interface Comment {
  _id: string;
  user: {
    _id: string;
    fullName: string;
    avatar?: string;
  };
  text: string;
  createdAt: string;
}

interface PdfViewerProps {
  pdfId: string;
}

export function PdfViewer({ pdfId }: PdfViewerProps) {
  const { token, user } = useAuth();
  const theme = useTheme();
  const [pdf, setPdf] = useState<PdfDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);

  // Add safety check for theme - use light theme as fallback
  const safeTheme = theme || {
    colors: {
      primary: '#0a7ea4',
      secondary: '#f0f9ff',
      text: '#0f172a',
      textSecondary: '#475569',
      surface: '#f8fafc',
      surfaceElevated: '#ffffff',
      border: '#e2e8f0',
      background: '#ffffff'
    }
  };

  // Use safeTheme throughout the component
  const themeColors = safeTheme.colors;

  useEffect(() => {
    loadPdfDetails();
  }, [pdfId]);

  const loadPdfDetails = async () => {
    try {
      if (!token || !pdfId) return;

      const response = await ApiService.getPdfById(token, pdfId);
      
      if (response.success) {
        setPdf(response.data);
        // Increment view count
        await ApiService.incrementViewCount(token, pdfId);
      } else {
        Alert.alert('Error', 'Failed to load PDF details');
        router.back();
      }
    } catch (error) {
      console.error('Error loading PDF:', error);
      Alert.alert('Error', 'Failed to load PDF');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!token || !pdf) return;

    try {
      const response = await ApiService.toggleLike(token, pdf._id);
      if (response.success) {
        setPdf(prev => prev ? {
          ...prev,
          isLiked: !prev.isLiked,
          likeCount: prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1
        } : null);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleRating = async (ratingValue: number) => {
    if (!token || !pdf) return;

    try {
      const response = await ApiService.addRating(token, pdf._id, ratingValue);
      if (response.success) {
        setRating(ratingValue);
        // Refresh PDF details to update rating
        loadPdfDetails();
      }
    } catch (error) {
      console.error('Error adding rating:', error);
    }
  };

  const handleComment = async () => {
    if (!token || !pdf || !newComment.trim()) return;

    try {
      const response = await ApiService.addComment(token, pdf._id, newComment.trim());
      if (response.success) {
        setNewComment('');
        loadPdfDetails(); // Refresh to get new comment
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDownload = async () => {
    if (!pdf) return;

    try {
      // Download the PDF file
      const fileUri = FileSystem.documentDirectory + pdf.fileName;
      const downloadResumable = FileSystem.createDownloadResumable(
        pdf.fileUrl,
        fileUri
      );

      const { uri } = await downloadResumable.downloadAsync();
      
      // Share or open the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }

      // Increment download count
      if (token) {
        await ApiService.downloadPdf(token, pdf._id);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      Alert.alert('Error', 'Failed to download PDF');
    }
  };

  const handleShare = async () => {
    if (!pdf) return;

    try {
      await Share.share({
        message: `Check out this PDF: ${pdf.title} by ${pdf.author || pdf.uploader.fullName}`,
        url: pdf.fileUrl,
        title: pdf.title,
      });
    } catch (error) {
      console.error('Error sharing PDF:', error);
    }
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </ThemedView>
    );
  }

  if (!pdf) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ThemedText>PDF not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColors.surfaceElevated }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="arrow.left" size={24} color={themeColors.text} />
        </TouchableOpacity>
        
        <ThemedText style={styles.headerTitle} numberOfLines={1}>
          {pdf.title}
        </ThemedText>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
            <IconSymbol name="square.and.arrow.up" size={20} color={themeColors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleDownload} style={styles.headerButton}>
            <IconSymbol name="arrow.down.circle" size={20} color={themeColors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Info Section */}
        <View style={[styles.infoSection, { backgroundColor: themeColors.surfaceElevated }]}>
          <ThemedText style={styles.title}>{pdf.title}</ThemedText>
          
          {pdf.author && (
            <ThemedText style={styles.author}>by {pdf.author}</ThemedText>
          )}

          {pdf.description && (
            <ThemedText style={styles.description}>{pdf.description}</ThemedText>
          )}

          {/* Genre and Tags */}
          <View style={styles.genreContainer}>
            <View style={[styles.genreBadge, { backgroundColor: themeColors.primary + '20' }]}>
              <ThemedText style={[styles.genreText, { color: themeColors.primary }]}>
                {pdf.genre}
              </ThemedText>
            </View>
            {pdf.subGenre && (
              <View style={[styles.genreBadge, { backgroundColor: themeColors.secondary + '20' }]}>
                <ThemedText style={[styles.genreText, { color: themeColors.secondary }]}>
                  {pdf.subGenre}
                </ThemedText>
              </View>
            )}
          </View>

          {pdf.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {pdf.tags.map((tag, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: themeColors.border }]}>
                  <ThemedText style={styles.tagText}>{tag}</ThemedText>
                </View>
              ))}
            </View>
          )}

          {/* Uploader Info */}
          <View style={styles.uploaderSection}>
            <ThemedText style={styles.sectionTitle}>Uploaded by</ThemedText>
            <View style={styles.uploaderInfo}>
              <View style={[styles.uploaderAvatar, { backgroundColor: themeColors.primary + '30' }]}>
                <ThemedText style={styles.uploaderAvatarText}>
                  {pdf.uploader.fullName.charAt(0).toUpperCase()}
                </ThemedText>
              </View>
              <View style={styles.uploaderDetails}>
                <ThemedText style={styles.uploaderName}>{pdf.uploader.fullName}</ThemedText>
                <ThemedText style={styles.uploadDate}>
                  {new Date(pdf.createdAt).toLocaleDateString()}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsSection}>
            <View style={styles.statItem}>
              <IconSymbol name="eye" size={20} color={themeColors.text} />
              <ThemedText style={styles.statText}>{pdf.viewCount} views</ThemedText>
            </View>
            
            <View style={styles.statItem}>
              <IconSymbol name="arrow.down.circle" size={20} color={themeColors.text} />
              <ThemedText style={styles.statText}>{pdf.downloadCount} downloads</ThemedText>
            </View>
            
            <View style={styles.statItem}>
              <IconSymbol name="doc" size={20} color={themeColors.text} />
              <ThemedText style={styles.statText}>
                {pdf.pageCount > 0 ? `${pdf.pageCount} pages` : 'Unknown pages'}
              </ThemedText>
            </View>
          </View>

          {/* Actions Section */}
        <View style={[styles.actionsSection, { backgroundColor: themeColors.surfaceElevated }]}>
          <TouchableOpacity 
            style={[styles.actionButton, pdf.isLiked && styles.actionButtonActive]}
            onPress={handleLike}
          >
            <IconSymbol 
              name={pdf.isLiked ? "heart.fill" : "heart"} 
              size={24} 
              color={pdf.isLiked ? "#FF0000" : themeColors.text} 
            />
            <ThemedText style={[styles.actionButtonText, pdf.isLiked && styles.actionButtonTextActive]}>
              {pdf.likeCount}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowComments(!showComments)}
          >
            <IconSymbol name="bubble.left.and.bubble.right" size={24} color={themeColors.text} />
            <ThemedText style={styles.actionButtonText}>
              {pdf.comments.length}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleDownload}
          >
            <IconSymbol name="arrow.down.circle" size={24} color={themeColors.text} />
            <ThemedText style={styles.actionButtonText}>
              {pdf.downloadCount}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Rating Section */}
        <View style={[styles.ratingSection, { backgroundColor: themeColors.surfaceElevated }]}>
          <ThemedText style={styles.sectionTitle}>Rate this PDF</ThemedText>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => handleRating(star)}
                style={styles.starButton}
              >
                <IconSymbol
                  name={star <= (pdf.userRating || rating) ? "star.fill" : "star"}
                  size={30}
                  color="#FFD700"
                />
              </TouchableOpacity>
            ))}
          </View>
          {pdf.rating.count > 0 && (
            <ThemedText style={styles.ratingText}>
              Average: {pdf.rating.average.toFixed(1)} ({pdf.rating.count} ratings)
            </ThemedText>
          )}
        </View>

        {/* Comments Section */}
        {showComments && (
          <View style={[styles.commentsSection, { backgroundColor: themeColors.surfaceElevated }]}>
            <ThemedText style={styles.sectionTitle}>Comments</ThemedText>
            
            {/* Add Comment */}
            <View style={styles.addComment}>
              <TextInput
                placeholder="Add a comment..."
                value={newComment}
                onChangeText={setNewComment}
                style={[styles.commentInput, { 
                  backgroundColor: themeColors.surface,
                  borderColor: themeColors.border 
                }]}
                multiline
              />
              <Button onPress={handleComment} style={styles.commentButton}>
                <ThemedText>Post</ThemedText>
              </Button>
            </View>

            {/* Comments List */}
            {pdf.comments.map((comment) => (
              <View key={comment._id} style={styles.comment}>
                <View style={styles.commentHeader}>
                  <ThemedText style={styles.commentAuthor}>
                    {comment.user.fullName}
                  </ThemedText>
                  <ThemedText style={styles.commentDate}>
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </ThemedText>
                </View>
                <ThemedText style={styles.commentText}>
                  {comment.text}
                </ThemedText>
              </View>
            ))}
          </View>
        )}

        {/* PDF Viewer Section */}
        <View style={[styles.pdfSection, { backgroundColor: themeColors.surfaceElevated }]}>
          <ThemedText style={styles.sectionTitle}>PDF Content</ThemedText>
          
          <View style={styles.pdfContainer}>
            {pdfLoading && (
              <View style={styles.pdfLoading}>
                <ActivityIndicator size="large" color={themeColors.primary} />
              </View>
            )}
            
            {pdf.fileUrl ? (
            <WebView
              source={{ uri: pdf.fileUrl }}
              style={styles.pdf}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.pdfLoading}>
                  <ActivityIndicator size="large" color={themeColors.primary} />
                </View>
              )}
              onLoad={() => setPdfLoading(false)}
              onError={(error) => {
                console.error('PDF Error:', error);
                setPdfLoading(false);
                Alert.alert(
                  'PDF Viewer Error',
                  'Unable to load PDF in viewer. Would you like to open it in an external app?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Open Externally',
                      onPress: () => Linking.openURL(pdf.fileUrl)
                    }
                  ]
                );
              }}
            />
          ) : (
            <View style={styles.pdfLoading}>
              <ActivityIndicator size="large" color={themeColors.primary} />
            </View>
          )}
          </View>

          <View style={styles.pdfControls}>
            <ThemedText style={styles.pageInfo}>
              Page {currentPage} of {totalPages}
            </ThemedText>
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 10,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 10,
  },
  infoSection: {
    margin: 15,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  author: {
    fontSize: 18,
    marginBottom: 15,
    opacity: 0.8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  genreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  genreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
  },
  uploaderSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  uploaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  uploaderAvatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  uploaderDetails: {
    flex: 1,
  },
  uploaderName: {
    fontSize: 16,
    fontWeight: '600',
  },
  uploadDate: {
    fontSize: 14,
    opacity: 0.7,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statText: {
    marginTop: 5,
    fontSize: 14,
  },
  metaSection: {
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionsSection: {
    margin: 15,
    padding: 20,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
  },
  actionButtonActive: {
    backgroundColor: '#FF000010',
  },
  actionButtonText: {
    marginTop: 5,
    fontSize: 12,
  },
  actionButtonTextActive: {
    color: '#FF0000',
  },
  ratingSection: {
    margin: 15,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  starButton: {
    padding: 5,
  },
  ratingText: {
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.7,
  },
  commentsSection: {
    margin: 15,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addComment: {
    marginBottom: 20,
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    minHeight: 80,
  },
  commentButton: {
    alignSelf: 'flex-end',
  },
  comment: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
  },
  commentDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  pdfSection: {
    margin: 15,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pdfContainer: {
    height: 400,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
  },
  pdf: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    opacity: 0.7,
  },
  pdfLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  pdfControls: {
    alignItems: 'center',
  },
  pageInfo: {
    fontSize: 14,
    opacity: 0.7,
  },
});