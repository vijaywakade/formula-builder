import React, { useState } from 'react';
import { Select, Input, InputNumber, Button, Space, Tooltip } from 'antd';
import { EditOutlined, CheckOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { DatePicker } from 'antd';

const { Option } = Select;

// available operators (basic)
const OPERATORS = {
  text: [
    { value: 'equals', label: 'Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'starts_with', label: 'Starts with' },
    { value: 'ends_with', label: 'Ends with' },
  ],
  number: [
    { value: 'equals', label: 'Equals' },
    { value: 'gt', label: 'Greater than' },
    { value: 'lt', label: 'Less than' },
    { value: 'between', label: 'Between' },
  ],
  date: [
    { value: 'on', label: 'On' },
    { value: 'before', label: 'Before' },
    { value: 'after', label: 'After' },
  ],
};

const uid = () => Math.random().toString(36).slice(2, 9);

export default function Rule({ data, onChange, onDelete, fields, showConnector }) {
  const [editing, setEditing] = useState(true); // new rules open in edit
  const [local, setLocal] = useState({ ...data });

  // find field metadata
  const fieldMeta = fields.find((f) => f.key === local.field) || fields[0];
  const type = fieldMeta.type || 'text';
  const operatorList = OPERATORS[type] || OPERATORS.text;

  function handleSave() {
    // keep connector as undefined if this is first in parent? parent handles it.
    onChange({ ...local, type: 'rule' });
    setEditing(false);
  }

  function handleCancel() {
    setLocal({ ...data }); // revert
    setEditing(false);
  }

  function handleFieldChange(val) {
    const newFieldMeta = fields.find((f) => f.key === val);
    const newType = newFieldMeta?.type || 'text';
    // pick a sensible operator default
    const defaultOp = OPERATORS[newType][0].value;
    setLocal({ ...local, field: val, operator: defaultOp, value: '' });
  }

  function renderValueInput() {
    if (type === 'number') {
      return (
        <InputNumber
          value={local.value === '' ? undefined : Number(local.value)}
          onChange={(v) => setLocal({ ...local, value: v })}
          style={{ width: 160 }}
        />
      );
    }
    if (type === 'date') {
      return (
        <DatePicker
          value={local.value ? dayjs(local.value) : null}
          onChange={(d, s) => setLocal({ ...local, value: s })}
        />
      );
    }
    // default text
    return (
      <Input
        placeholder="Value"
        value={local.value}
        onChange={(e) => setLocal({ ...local, value: e.target.value })}
        style={{ width: 200 }}
      />
    );
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {/* connector, only for non-first items */}
      {showConnector ? (
        <Select
          value={local.connector || 'AND'}
          onChange={(val) => {
            setLocal((prev) => ({ ...prev, connector: val }));
            onChange({ ...local, connector: val });
          }}
          size="small"
          style={{ width: 80 }}
        >
          <Option value="AND">AND</Option>
          <Option value="OR">OR</Option>
        </Select>
      ) : (
        <div style={{ width: 80 }} />
      )}

      {editing ? (
        <>
          <Select value={local.field} onChange={handleFieldChange} style={{ width: 160 }}>
            {fields.map((f) => (
              <Option key={f.key} value={f.key}>
                {f.name}
              </Option>
            ))}
          </Select>

          <Select
            value={local.operator}
            onChange={(val) => setLocal({ ...local, operator: val })}
            style={{ width: 160 }}
          >
            {operatorList.map((op) => (
              <Option key={op.value} value={op.value}>
                {op.label}
              </Option>
            ))}
          </Select>

          {renderValueInput()}

          <Space>
            <Button type="primary" icon={<CheckOutlined />} size="small" onClick={handleSave}>
              Save
            </Button>
            <Button icon={<CloseOutlined />} size="small" onClick={handleCancel}>
              Cancel
            </Button>
            <Tooltip title="Delete rule">
              <Button danger icon={<DeleteOutlined />} size="small" onClick={onDelete} />
            </Tooltip>
          </Space>
        </>
      ) : (
        <>
          <div style={{ minWidth: 180 }}>
            <strong>{fieldMeta.name}</strong> &nbsp;
            <span style={{ color: '#666' }}>{local.operator}</span>
            &nbsp; <span style={{ color: '#000' }}>{String(local.value)}</span>
          </div>

          <Space>
            <Button icon={<EditOutlined />} size="small" onClick={() => setEditing(true)}>
              Edit
            </Button>
            <Tooltip title="Delete rule">
              <Button danger icon={<DeleteOutlined />} size="small" onClick={onDelete} />
            </Tooltip>
          </Space>
        </>
      )}
    </div>
  );
}
