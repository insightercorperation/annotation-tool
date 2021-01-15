import React, { Component } from 'react';
import { Message } from 'semantic-ui-react';

export default class OverScreen extends Component {
  async componentDidMount() {
    const { projectId } = this.props.match.params;
    const status = 'COMPLETE';

    await fetch('/api/status/' + projectId, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
  }

  render() {
    return (
      <Message style={{ maxWidth: 600, margin: '100px auto' }}>
        <Message.Header>
          더이상 작업할 이미지가 없거나 유효하지 않은 URL입니다.
        </Message.Header>
      </Message>
    );
  }
}
