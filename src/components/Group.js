import React from 'react';
import { Card, Select, Space, Button, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import Rule from './Rule';

const { Option } = Select;

const uid = () => Math.random().toString(36).slice(2, 9);

export default function Group({ data, onChange, onDelete, fields, isRoot }) {
  // data: { id, connector, children: [] }
  const children = data.children || [];

  function setConnector(conn) {
    onChange({ ...data, connector: conn });
  }

  function addRuleAtEnd() {
    const newRule = {
      id: uid(),
      type: 'rule',
      field: fields[0].key,
      operator: 'contains',
      value: '',
      connector: undefined,
    };
    onChange({ ...data, children: [...children, newRule] });
  }

  function addGroupAtEnd() {
    const newGroup = {
      id: uid(),
      type: 'group',
      connector: undefined,
      children: [
        {
          id: uid(),
          type: 'rule',
          field: fields[0].key,
          operator: 'contains',
          value: '',
          connector: undefined,
        },
      ],
    };
    onChange({ ...data, children: [...children, newGroup] });
  }

  function updateChild(updatedChild) {
    const newChildren = children.map((c) => (c.id === updatedChild.id ? updatedChild : c));
    onChange({ ...data, children: newChildren });
  }

  function deleteChild(childId) {
    const newChildren = children.filter((c) => c.id !== childId);
    // if first child removed, ensure the new first child has undefined connector
    const normalized = newChildren.map((c, idx) => (idx === 0 ? { ...c, connector: undefined } : c));
    onChange({ ...data, children: normalized });
  }

  // When a nested group is changed, its `connector` describes how it connects inside THIS group's children list.
  function renderChild(child, index) {
    const showConnector = index !== 0; // first child doesn't show connector dropdown
    if (child.type === 'rule') {
      return (
        <Rule
          key={child.id}
          data={child}
          showConnector={showConnector}
          fields={fields}
          onChange={(updated) => updateChild(updated)}
          onDelete={() => deleteChild(child.id)}
        />
      );
    } else {
      // nested group
      return (
        <Card
          key={child.id}
          size="small"
          style={{ marginTop: 8, background: '#fff' }}
          type="inner"
          bordered
        >
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {showConnector ? (
              <Select
                value={child.connector || 'AND'}
                onChange={(val) => updateChild({ ...child, connector: val })}
                size="small"
                style={{ width: 80 }}
              >
                <Option value="AND">AND</Option>
                <Option value="OR">OR</Option>
              </Select>
            ) : (
              <div style={{ width: 80 }} />
            )}

            <div style={{ flex: 1 }}>
              <Group
                data={child}
                onChange={(g) => updateChild(g)}
                onDelete={() => deleteChild(child.id)}
                fields={fields}
              />
            </div>
          </div>
        </Card>
      );
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* For root group, we still don't show parent-side connector selector */}
        {!isRoot && (
          <div>
            <Select
              value={data.connector || 'AND'}
              onChange={setConnector}
              size="small"
              style={{ width: 90 }}
            >
              <Option value="AND">AND</Option>
              <Option value="OR">OR</Option>
            </Select>
          </div>
        )}

        <div style={{ flex: 1 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Group</strong>
              <div>
                <Button
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={addRuleAtEnd}
                  style={{ marginRight: 8 }}
                >
                  Add Rule
                </Button>
                <Button size="small" icon={<PlusOutlined />} onClick={addGroupAtEnd} style={{ marginRight: 8 }}>
                  Add Group
                </Button>
                {!isRoot && (
                  <Tooltip title="Delete this group">
                    <Button danger size="small" icon={<DeleteOutlined />} onClick={onDelete} />
                  </Tooltip>
                )}
              </div>
            </div>

            {/* children */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {children.length === 0 && <div style={{ color: '#666' }}>No rules / groups yet</div>}
              {children.map((ch, idx) => renderChild(ch, idx))}
            </div>
          </Space>
        </div>
      </div>
    </div>
  );
}
