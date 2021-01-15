import React, { Component } from 'react';

import Menubar from '../common/Menubar';
import ProjectsGrid from '../common/ProjectsGrid';

export default class LabelHome extends Component {
  render() {
    return (
      <Menubar active="label">
        <ProjectsGrid
          title="라벨링 작업"
          linkPrefix="/label/"
          newButton={false}
        />
      </Menubar>
    );
  }
}
