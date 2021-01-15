import React, { Component } from 'react';

import { Message } from 'semantic-ui-react';

export default class Description extends Component {
  render() {
    return (
      <Message color='olive' negative>
        <Message.Header>{this.props.desc}</Message.Header>
      </Message>
    );
  }
}
