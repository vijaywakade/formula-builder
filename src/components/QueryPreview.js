import React from 'react';
import { Card, Button, Tooltip, Typography } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

const { Text } = Typography;

export default function QueryPreview({ text }) {
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Copied query to clipboard');
    });
  }

  return (
    <Card title="Query Preview" size="small" style={{ position: 'sticky', top: 24 }}>
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text type="secondary">Readable Query</Text>
        <Tooltip title="Copy query text">
          <Button icon={<CopyOutlined />} size="small" onClick={handleCopy} />
        </Tooltip>
      </div>

      <div
        style={{
          maxHeight: '70vh',
          overflow: 'auto',
          background: '#111',
          color: '#00e676',
          padding: 12,
          borderRadius: 6,
          fontFamily: 'monospace',
          fontSize: 13,
          whiteSpace: 'pre-wrap',
        }}
      >
        {text && text.trim() ? text : '(Query will appear here...)'}
      </div>
    </Card>
  );
}
