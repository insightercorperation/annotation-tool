import React from 'react';
import { Header, Icon, Segment, Table } from 'semantic-ui-react';

const style = {
  height: '100vh',
  overflowY: 'auto',
  overflowX: 'hidden',
  borderRight: '1px solid #ccc',
};
const headerIconStyle = { fontSize: '0.8em', float: 'right' };

export default function HotkeysPanel({ labels, onClose }) {
  const labelHotkeys = labels.map((label, i) => (
    <Table.Row key={label}>
      <Table.Cell>{label}</Table.Cell>
      <Table.Cell>{++i}</Table.Cell>
    </Table.Row>
  ));

  return (
    <div style={style}>
      <Header as="h2" attached="top">
        단축키
        <Icon link name="close" style={headerIconStyle} onClick={onClose} />
      </Header>
      <Segment attached>
        <Header as="h3"> 라벨 </Header>
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>기능</Table.HeaderCell>
              <Table.HeaderCell>단축키</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>{labelHotkeys}</Table.Body>
        </Table>
        <Header as="h3"> 기본 </Header>
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>기능</Table.HeaderCell>
              <Table.HeaderCell>단축키</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            <Table.Row>
              <Table.Cell>완성</Table.Cell>
              <Table.Cell>f</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>삭제</Table.Cell>
              <Table.Cell>Delete</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>선택 취소</Table.Cell>
              <Table.Cell>Escape</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
        <Header as="h3"> 화면 </Header>
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>기능</Table.HeaderCell>
              <Table.HeaderCell>단축키</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            <Table.Row>
              <Table.Cell>확대</Table.Cell>
              <Table.Cell>+/=</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>축소</Table.Cell>
              <Table.Cell>-</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>이미지 이동</Table.Cell>
              <Table.Cell>←→↑↓</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>스킵</Table.Cell>
              <Table.Cell>Space</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>제출</Table.Cell>
              <Table.Cell>Enter</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </Segment>
    </div>
  );
}
