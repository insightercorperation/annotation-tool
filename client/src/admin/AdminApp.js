import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

import './AdminApp.css';
import Menubar from '../common/Menubar';
import ProjectsGrid from '../common/ProjectsGrid';
import ProjectSummary from './ProjectSummary';
import ProjectPage from './ProjectPage';
import InspectionPage from './InspectionPage';
import LoginPage from './LoginPage';

import * as config from '../config';
export default class AdminApp extends Component {
  render() {
    return (
      <Menubar active="admin">
        <Switch>
          <Route
            exact
            path="/admin/"
            render={() => (
              <>
                <ProjectSummary title="이미지 라벨링 현황" />
                <ProjectsGrid
                  linkPrefix="/admin/"
                  title="프로젝트 목록"
                  showCreateButton={config.ALLOW_EDIT}
                />
              </>
            )}
          />
          <Route exact path="/admin/login" component={LoginPage} />
          <Route
            exact
            path="/admin/inspection/:projectId/:projectHash"
            component={InspectionPage}
          />
          <Route
            path="/admin/:projectId/:projectHash"
            component={ProjectPage}
          />
        </Switch>
      </Menubar>
    );
  }
}
