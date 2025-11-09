import React, { useEffect, useState } from 'react';
import { Card, Space, Button, Divider, Select } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import Group from './Group';
import QueryPreview from './QueryPreview';

const { Option } = Select;

// Simple id generator (no external lib)
const uid = () => Math.random().toString(36).slice(2, 9);

// Example fields and operators
const FIELDS = [
  { name: 'Name', key: 'name', type: 'text' },
  { name: 'Age', key: 'age', type: 'number' },
  { name: 'Country', key: 'country', type: 'text' },
  { name: 'Joined At', key: 'joinedAt', type: 'date' },
];

const defaultRule = () => ({
  id: uid(),
  type: 'rule',
  field: 'name',
  operator: 'contains',
  value: '',
  connector: undefined,
});

const defaultGroup = () => ({
  id: uid(),
  type: 'group',
  connector: undefined,
  children: [defaultRule()],
});

export default function QueryBuilder({ onQueryChange }) {
  const [roots, setRoots] = useState([defaultGroup()]);

  useEffect(() => {
    const q = generateQueryForOutput(roots);
    if (onQueryChange) onQueryChange(q);
  }, [roots, onQueryChange]);

  function addRootGroup() {
    const newGroup = defaultGroup();
    newGroup.connector = 'AND';
    setRoots((rs) => [...rs, newGroup]);
  }

  function updateRoot(updatedGroup) {
    setRoots((rs) => rs.map((g) => (g.id === updatedGroup.id ? updatedGroup : g)));
  }

  function deleteRoot(id) {
    setRoots((rs) => rs.filter((g) => g.id !== id));
  }

  function handleRootConnectorChange(index, connector) {
    setRoots((rs) =>
      rs.map((g, i) => (i === index ? { ...g, connector } : g))
    );
  }

  function generateQueryForOutput(groups) {
    return groups.map((g, index) => {
      const cleanGroup = deepSerializeGroup(g);
      if (index === 0) cleanGroup.connector = undefined;
      return cleanGroup;
    });
  }

  function deepSerializeGroup(group) {
    const serialized = {
      id: group.id,
      connector: group.connector,
      type: 'group',
      children: group.children.map((child, index) => {
        if (child.type === 'rule') {
          const connector = index === 0 ? undefined : child.connector;
          return {
            id: child.id,
            type: 'rule',
            field: child.field,
            operator: child.operator,
            value: child.value,
            connector,
          };
        } else {
          const connector = index === 0 ? undefined : child.connector;
          const nested = deepSerializeGroup(child);
          nested.connector = connector;
          return nested;
        }
      }),
    };
    return serialized;
  }

  function generateQueryText(groups) {
    if (!groups || groups.length === 0) return '';
    return groups
      .map((group, index) => {
        const conn = index === 0 ? '' : ` ${group.connector || 'AND'} `;
        return `${conn}(${serializeGroupToText(group)})`;
      })
      .join('');
  }

  function serializeGroupToText(group) {
    const parts = group.children.map((child, index) => {
      const conn = index === 0 ? '' : ` ${child.connector || 'AND'} `;
      if (child.type === 'rule') {
        return `${conn}${child.field} ${child.operator} "${child.value}"`;
      } else {
        const inner = serializeGroupToText(child);
        return `${conn}(${inner})`;
      }
    });
    return parts.join('');
  }

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3>Query Builder</h3>
            <Button type="primary" icon={<PlusOutlined />} onClick={addRootGroup}>
              Add Root Group
            </Button>
          </div>

          {roots.map((root, idx) => (
            <Card
              key={root.id}
              size="small"
              bordered={false}
              style={{ background: '#fafafa', position: 'relative' }}
            >
              {/* Connector for 2nd+ root groups */}
              {idx > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <Select
                    value={root.connector || 'AND'}
                    onChange={(val) => handleRootConnectorChange(idx, val)}
                    style={{ width: 100 }}
                  >
                    <Option value="AND">AND</Option>
                    <Option value="OR">OR</Option>
                  </Select>
                </div>
              )}

              {/* Root Header with Delete Option */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 6,
                }}
              >
                <strong>Root Group {idx + 1}</strong>
                {idx > 0 && (
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => deleteRoot(root.id)}
                  >
                    Delete
                  </Button>
                )}
              </div>

              <Group
                data={root}
                fields={FIELDS}
                isRoot={true}
                onChange={(updated) => updateRoot(updated)}
                onDelete={() => deleteRoot(root.id)}
                parentIsRoot={true}
              />

              {idx < roots.length - 1 && <Divider />}
            </Card>
          ))}
        </Space>
      </div>

      <div style={{ width: 420 }}>
        <QueryPreview
          text={generateQueryText(roots)}
          value={generateQueryForOutput(roots)}
        />
      </div>
    </div>
  );
}
