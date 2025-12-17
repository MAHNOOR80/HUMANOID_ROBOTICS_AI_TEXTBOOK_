import React from 'react';
import RAGQueryWidget from './index';

const TestComponent: React.FC = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>RAG Query Widget Test Page</h1>
      <p>This is a test page to verify the RAG Query Widget functionality.</p>
      <p>You can ask questions about the textbook content using the widget.</p>

      <div style={{ marginTop: '2rem' }}>
        <RAGQueryWidget />
      </div>
    </div>
  );
};

export default TestComponent;