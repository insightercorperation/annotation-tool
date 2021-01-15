import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { Container, Menu, Icon } from 'semantic-ui-react';

export default class Menubar extends Component {
  render() {
    const { active } = this.props;
    return (
      <div style={{ background: '#f7f7f7', minHeight: '100vh' }}>
        <Menu>
          <Container>
            <Link to="/">
              <Menu.Item header>Image Annotation Tool</Menu.Item>
            </Link>
            <Link to="/admin/">
              <Menu.Item active={active === 'admin'}>
                <Icon name="pencil" style={{ marginRight: '5px' }} />
                프로젝트 목록
              </Menu.Item>
            </Link>
          </Container>
        </Menu>

        <Container>{this.props.children}</Container>
      </div>
    );
  }
}
