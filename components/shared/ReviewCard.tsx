import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useTheme } from '@/hooks/useTheme';
import { Avatar } from '@/components/ui/Avatar';
import { Review } from '@/types';

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const { colors } = useTheme();

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Ionicons
        key={index}
        name={index < rating ? 'star' : 'star-outline'}
        size={14}
        color={index < rating ? '#facc15' : colors.textTertiary}
      />
    ));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Avatar uri={review.userAvatar} name={review.userName} size={40} />
        <View style={styles.headerInfo}>
          <Text style={[styles.userName, { color: colors.text }]}>
            {review.userName}
          </Text>
          <View style={styles.ratingRow}>
            {renderStars(review.rating)}
            <Text style={[styles.date, { color: colors.textTertiary }]}>
              • {format(review.createdAt, 'MMM d, yyyy')}
            </Text>
          </View>
        </View>
      </View>
      {review.comment && (
        <Text style={[styles.comment, { color: colors.textSecondary }]}>
          {review.comment}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  date: {
    fontSize: 12,
    marginLeft: 6,
  },
  comment: {
    fontSize: 14,
    lineHeight: 20,
  },
});