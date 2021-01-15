import React from 'react';
import * as config from '../config';
import {
  Form,
  Input,
  Icon,
  Button,
  Checkbox,
  Radio,
  Header,
} from 'semantic-ui-react';

import { sortableHandle } from 'react-sortable-hoc';

import update from 'immutability-helper';

function renderExtraConfig({ value, onChange }) {
  if (value.type === 'text') {
    return (
      <Input
        label="입력란"
        className="visible"
        readOnly={!config.ALLOW_EDIT}
        placeholder="라벨을 입력해주세요."
        onChange={(e, data) =>
          onChange(value, { ...value, prompt: data.value })
        }
      />
    );
  }

  if (value.type === 'select' || value.type === 'select-one') {
    const options = value.options || [];
    const Comp = value.type === 'select' ? Checkbox : Radio;

    const renderedOptions = options.map((optionText, index) => (
      <div key={index} className="form-checkbox">
        <Comp checked={false} tabIndex="-1" />
        <Input
          style={{ top: '-3px' }}
          value={optionText}
          size="small"
          onChange={(e, data) =>
            onChange(value, {
              ...value,
              options: update(options, { $splice: [[index, 1, data.value]] }),
            })
          }
        />
        <Button
          type="button"
          icon="trash"
          style={{ background: 'transparent' }}
          onClick={() =>
            onChange(value, {
              ...value,
              options: update(options, { $splice: [[index, 1]] }),
            })
          }
        />
      </div>
    ));

    return (
      <div>
        <Header as="h5">Options:</Header>
        {renderedOptions}
        <Button
          type="button"
          size="mini"
          circular
          icon="plus"
          onClick={() =>
            onChange(value, {
              ...value,
              options: update(options, { $push: ['Option'] }),
            })
          }
        />
      </div>
    );
  }
  return null;
}

const dragHandleStyle = {
  background:
    'linear-gradient(180deg,#000,#000 20%,#fff 0,#fff 40%,#000 0,#000 60%,#fff 0,#fff 80%,#000 0,#000)',
  width: 25,
  minWidth: 25,
  height: 20,
  opacity: 0.25,
  cursor: 'move',
};

const DragHandle = sortableHandle(({ style }) => (
  <div style={{ ...dragHandleStyle, ...style }} />
));

export default function LabelFormItem({ value, onChange }) {
  const options = [
    { key: 'bbox', text: '경계 상자 그리기', value: 'bbox' },
    { key: 'polygon', text: '다각형 그리기', value: 'polygon' },
    { key: 'text', text: '텍스트 라벨 입력', value: 'text' },
    { key: 'select', text: '적용되는 모든 태그 선택', value: 'select' },
    {
      key: 'select-one',
      text: '적용되는 태그 하나 선택',
      value: 'select-one',
    },
  ];

  const extraConfig = renderExtraConfig({ value, onChange });

  return (
    <div
      style={{
        marginTop: '0.7em',
        padding: '1em',
        border: 'solid 1px #efefef',
        background: 'white',
        shadow: 'rgb(204, 204, 204) 0px 1px 2px',
      }}
    >
      <Form className="form-card" style={{ display: 'flex' }}>
        {config.ALLOW_EDIT ? (
          <DragHandle style={{ flex: 0, marginTop: 9 }} />
        ) : (
          <div
            style={{
              ...dragHandleStyle,
              cursor: 'default',
              flex: 0,
              marginTop: 9,
            }}
          />
        )}
        <div style={{ flex: 1, padding: '0 0.5em' }}>
          <Form.Field
            placeholder="Label name"
            readOnly={!config.ALLOW_EDIT}
            control="input"
            defaultValue={value.name}
            style={{ padding: 3, fontSize: 24, cursor: 'default' }}
            onChange={e => onChange(value, { ...value, name: e.target.value })}
          />
          <Form.Select
            label="라벨 타입"
            options={options}
            defaultValue={value.type}
            onChange={(e, change) =>
              onChange(value, { ...value, type: change.value })
            }
            style={{ maxWidth: 400 }}
          />
          {extraConfig}
        </div>
        {config.ALLOW_DELETE ? (
          <div style={{ flex: '0 0 auto' }}>
            <Button
              type="button"
              style={{ background: 'transparent', padding: 0 }}
              onClick={() => onChange(value, null)}
            >
              <Icon name="trash" />
            </Button>
          </div>
        ) : null}
      </Form>
    </div>
  );
}
