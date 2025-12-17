import React from 'react';
import styles from './styles.module.css';

interface LoadingSkeletonProps {
  type?: 'answer' | 'sources' | 'source-item' | 'query-input';
  count?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type = 'answer', count = 1 }) => {
  const renderSkeleton = (index: number) => {
    const key = `${type}-${index}`;

    switch (type) {
      case 'query-input':
        return (
          <div
            key={key}
            className={`${styles.skeleton} ${styles.skeletonQueryInput}`}
            aria-label="Loading input field"
          />
        );
      case 'sources':
        return (
          <div
            key={key}
            className={`${styles.skeleton} ${styles.skeletonSources}`}
            aria-label="Loading sources section"
          />
        );
      case 'source-item':
        return (
          <div
            key={key}
            className={`${styles.skeleton} ${styles.skeletonSourceItem}`}
            aria-label="Loading source citation"
          />
        );
      case 'answer':
      default:
        return (
          <div
            key={key}
            className={`${styles.skeleton} ${styles.skeletonAnswer}`}
            aria-label="Loading answer content"
          />
        );
    }
  };

  const skeletonItems = Array.from({ length: count }, (_, index) => renderSkeleton(index));

  return <>{skeletonItems}</>;
};

export default LoadingSkeleton;