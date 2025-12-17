import React, { useState } from 'react';
import { AgentResponse, SourceReference } from '../../services/api';
import LoadingSkeleton from './LoadingSkeleton';
import styles from './styles.module.css';

interface AnswerDisplayProps {
  response: AgentResponse | null;
  loading: boolean;
}

const AnswerDisplayComponent: React.FC<AnswerDisplayProps> = ({ response, loading }) => {
  const [expandedSources, setExpandedSources] = useState<Record<number, boolean>>({});

  if (loading) {
    return (
      <div className={styles.answerContainer} role="status" aria-live="polite">
        <div className={styles.answerContent}>
          <div className={styles.answerText}>
            <LoadingSkeleton type="answer" count={4} />
          </div>
          <div className={styles.sourcesSection}>
            <LoadingSkeleton type="sources" />
            <div className={styles.sourcesList}>
              <LoadingSkeleton type="source-item" count={3} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!response) {
    return null;
  }

  const renderConfidenceIndicator = (confidence: number | undefined) => {
    if (confidence === undefined) return null;

    let confidenceLevel = 'low';
    let confidenceColor = '#ef4444'; // red

    if (confidence >= 0.7) {
      confidenceLevel = 'high';
      confidenceColor = '#22c55e'; // green
    } else if (confidence >= 0.4) {
      confidenceLevel = 'medium';
      confidenceColor = '#f59e0b'; // yellow
    }

    return (
      <div className={styles.confidenceIndicator} role="status" aria-live="polite">
        <span
          className={styles.confidenceDot}
          style={{ backgroundColor: confidenceColor }}
          title={`Confidence: ${confidenceLevel}`}
          aria-label={`Confidence level: ${confidenceLevel} (${Math.round(confidence * 100)}%)`}
        ></span>
        <span className={styles.confidenceText}>
          {Math.round(confidence * 100)}% confidence
        </span>
      </div>
    );
  };

  const handleCitationClick = (index: number) => {
    setExpandedSources(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const renderSourceCitation = (source: SourceReference, index: number) => {
    const isExpanded = expandedSources[index] || false;
    const excerptLength = isExpanded ? source.excerpt.length : 150;

    return (
      <div key={source.chunk_id} className={styles.sourceReference} role="listitem">
        <span
          className={styles.citationNumber}
          onClick={() => handleCitationClick(index)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleCitationClick(index);
            }
          }}
          style={{ cursor: 'pointer' }}
          title="Click to expand/collapse source"
          tabIndex={0}
          role="button"
          aria-expanded={isExpanded}
          aria-controls={`source-excerpt-${index}`}
        >
          [{index + 1}]
        </span>
        <div className={styles.sourceContent}>
          <div
            className={styles.sourceExcerpt}
            id={`source-excerpt-${index}`}
            aria-expanded={isExpanded}
          >
            "{source.excerpt.substring(0, excerptLength)}{source.excerpt.length > excerptLength ? '...' : ''}"
            {source.excerpt.length > 150 && (
              <button
                className={styles.expandButton}
                onClick={() => handleCitationClick(index)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleCitationClick(index);
                  }
                }}
                style={{ marginLeft: '0.25rem', fontSize: '0.8em', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}
                aria-label={isExpanded ? `Collapse source ${index + 1}` : `Expand source ${index + 1}`}
                tabIndex={0}
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
          <div className={styles.sourceMetadata}>
            {source.metadata.section_title && (
              <span className={styles.metadataItem}>
                <strong>Section:</strong> {source.metadata.section_title}
              </span>
            )}
            {source.metadata.chapter && (
              <span className={styles.metadataItem}>
                <strong>Chapter:</strong> {source.metadata.chapter}
              </span>
            )}
            {source.metadata.url && (
              <a
                href={source.metadata.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.sourceLink}
                aria-label={`View source for citation ${index + 1}`}
              >
                View Source
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (response.status === 'error' || response.status === 'insufficient_context') {
    return (
      <div className={styles.answerContainer} role="alert" aria-live="polite">
        <div className={styles.errorMessage} role="alertdialog">
          <h3 className={styles.errorTitle}>Unable to answer your question</h3>
          <p className={styles.errorText}>
            {response.error_message || 'The system could not find sufficient information to answer your question.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.answerContainer}>
      <div className={styles.answerContent} role="region" aria-labelledby="answer-text">
        <div className={styles.answerText} id="answer-text">
          {response.answer}
        </div>

        {response.confidence && renderConfidenceIndicator(response.confidence.overall)}

        {response.sources && response.sources.length > 0 && (
          <div className={styles.sourcesSection} role="region" aria-labelledby="sources-title">
            <h4 className={styles.sourcesTitle} id="sources-title">Sources:</h4>
            <div className={styles.sourcesList} role="list">
              {response.sources.map((source, index) => renderSourceCitation(source, index))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AnswerDisplay = React.memo(AnswerDisplayComponent);
export default AnswerDisplay;