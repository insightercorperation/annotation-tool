import React, { Component } from 'react';
import { Form } from 'semantic-ui-react';

export default class Status extends Component {
  constructor(props) {
    super(props);

    this.handleStatusChange = this.handleStatusChange.bind(this);
  }

  handleStatusChange(event, result) {
    const status = result.value;
    const { onChange } = this.props;

    onChange(status);
  }

  render() {
    const options = [
      { key: 'PROGRESS', text: '작업중', value: 'PROGRESS' },
      { key: 'PAUSE', text: '중지', value: 'PAUSE' },
      { key: 'INSPECT', text: '검수중', value: 'INSPECT' },
      { key: 'INSPECTCOMPLETE', text: '검수완료', value: 'INSPECTCOMPLETE' },
      { key: 'COMPLETE', text: '완료', value: 'COMPLETE' },
    ];

    const { status } = this.props;

    return (
      <Form style={{ margin: '0 auto', marginBottom: 16 }}>
        <Form.Dropdown
          selection
          value={status}
          options={options}
          onChange={this.handleStatusChange}
          placeholder="Choose an option"
        />
      </Form>
    );
  }
}
