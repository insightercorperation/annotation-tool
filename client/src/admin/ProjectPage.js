import React, { Component } from 'react';
import * as config from '../config';

import {
  Header,
  Button,
  Loader,
  Input,
  List,
  Segment,
} from 'semantic-ui-react';

import DocumentMeta from 'react-document-meta';

import { sortableContainer, sortableElement } from 'react-sortable-hoc';

import update from 'immutability-helper';
import arrayMove from 'array-move';

import Status from '../common/Status';
import ProjectImages from './ProjectImages';
import UploadImages from './UploadImages';
import LabelFormItem from './LabelFormItem';
import ImportData from './ImportData';
import UploadReference from './UploadReference';

export default class ProjectPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      project: null,
    };

    this.onSortEnd = this.onSortEnd.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleNew = this.handleNew.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleReferenceChange = this.handleReferenceChange.bind(this);
    this.pushStatusUpdate = this.pushStatusUpdate.bind(this);
  }

  async componentDidMount() {
    const { match } = this.props;
    const { projectId } = match.params;
    try {
      const response = await fetch('/api/projects/' + projectId);

      if (!response.ok) {
        this.setState({
          isLoaded: true,
          error: { message: response.statusText },
        });
      }

      const project = await response.json();

      this.setState({
        isLoaded: true,
        project,
      });
    } catch (error) {
      this.setState({
        isLoaded: true,
        error,
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { project } = this.state;
    if (!project) return;
    const { projectId } = this.props.match.params;

    if (prevState.project !== project) {
      fetch('/api/projects/' + projectId, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
        body: JSON.stringify({ project }),
      });
    }
  }

  onSortEnd({ oldIndex, newIndex }) {
    this.setState(({ project }) => ({
      project: update(project, {
        form: {
          formParts: {
            $set: arrayMove(project.form.formParts, oldIndex, newIndex),
          },
        },
      }),
    }));
  }

  handleChange(oldValue, newValue) {
    const { project } = this.state;
    const edit = newValue ? [1, newValue] : [1];
    this.setState({
      project: update(project, {
        form: {
          formParts: {
            $splice: [
              [
                project.form.formParts.findIndex(x => x.id === oldValue.id),
                ...edit,
              ],
            ],
          },
        },
      }),
    });
  }

  handleNew() {
    const { project } = this.state;
    this.setState({
      project: update(project, {
        form: {
          formParts: {
            $push: [newFormPart()],
          },
        },
      }),
    });
  }

  async handleDelete() {
    const confirmed = window.confirm(
      '프로젝트를 삭제 시, 프로젝트의 이미지와 라벨 정보 모두가 삭제됩니다. 정말 삭제하시겠습니까?'
    );

    if (confirmed) {
      const { match, history } = this.props;
      const { projectId } = match.params;
      await fetch('/api/projects/' + projectId, {
        method: 'DELETE',
      });

      history.push('/admin/');
    }
  }

  handleNameChange(e) {
    const { value } = e.target;
    const { project } = this.state;
    this.setState({
      project: update(project, {
        name: {
          $set: value,
        },
      }),
    });
  }

  handleReferenceChange({ referenceLink, referenceText }) {
    const { project } = this.state;
    this.setState({
      project: update(project, {
        referenceText: {
          $set: referenceText,
        },
        referenceLink: {
          $set: referenceLink,
        },
      }),
    });
  }

  handleStatusChange(status) {
    const { project } = this.state;

    this.setState({
      project: update(project, {
        status: {
          $set: status,
        },
      }),
    });
  }

  async pushStatusUpdate(status) {
    const { projectId } = this.props.match.params;

    await fetch('/api/status/' + projectId, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    this.handleStatusChange(status);
  }

  render() {
    const { match } = this.props;
    const { projectId, projectHash } = match.params;

    const { error, isLoaded, project } = this.state;

    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <Loader active inline="centered" />;
    }

    const items = project.form.formParts;
    const renderedItems = items.length ? (
      items.map((value, index) => (
        <SortableItem
          key={value.id}
          index={index}
          value={value}
          onChange={this.handleChange}
        />
      ))
    ) : (
      <Header className="centered" as="h5">
        라벨이 없습니다. 아래의 플러스 버튼을 통해 추가해 주세요.
      </Header>
    );

    return (
      <DocumentMeta title={`Edit project ${project.name}`}>
        <div style={{ display: 'flex' }}>
          <div className="ui" style={{ paddingBottom: 200, flex: 1 }}>
            <Input
              placeholder="Project name"
              readOnly={!config.ALLOW_DELETE}
              control="input"
              defaultValue={project.name}
              style={{ fontSize: 24, width: '100%', marginTop: 10 }}
              onChange={this.handleNameChange}
            />
            <Status
              onChange={this.pushStatusUpdate}
              status={this.state.project.status}
            />
            <div
              style={{
                display: 'flex',
                flexDirection: 'row-reverse',
                marginTop: 5,
              }}
            >
              <Input
                style={{ width: '100%' }}
                label="라벨링 주소"
                value={`${
                  window.location.origin
                }/label/${projectId}/${projectHash}`}
                onClick={e => e.target.select()}
              />
            </div>
            <div id="labels" style={{ padding: '2em 0 110px 0' }}>
              <Header disabled>라벨</Header>
              <SortableContainer onSortEnd={this.onSortEnd} useDragHandle>
                {renderedItems}
              </SortableContainer>
              {config.ALLOW_EDIT ? (
                <Button
                  circular
                  icon="plus"
                  size="massive"
                  style={{ float: 'right', marginTop: '2em' }}
                  onClick={this.handleNew}
                />
              ) : null}
            </div>
            <div id="images" style={{ padding: '2em 0', overflowY: 'auto' }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingBottom: '10px',
                }}
              >
                <Header disabled>이미지 목록</Header>
                <div style={{ display: 'inline' }}>
                  <button
                    style={{
                      cursor: 'pointer',
                      padding: 8,
                      backgroundColor: 'grey',
                      color: 'white',
                      borderRadius: 4,
                      fontWeight: 'bold',
                      border: 0,
                      width: 126,
                    }}
                    onClick={() => {
                      window.location = `/admin/inspection/${projectId}/${projectHash}`;
                    }}
                  >
                    라벨링 검수
                  </button>
                </div>
              </div>
              <ProjectImages
                projectId={projectId}
                projectHash={project.hash}
                refetchRef={f => this.setState({ handleImagesChange: f })}
              />
            </div>
            {config.ALLOW_EDIT ? (
              <div id="upload-images" style={{ padding: '2em 0' }}>
                <Header disabled>이미지 업로드</Header>
                <UploadImages
                  projectId={projectId}
                  onChange={this.state.handleImagesChange}
                />
              </div>
            ) : null}

            <div id="export-data" style={{ padding: '2em 0' }}>
              <Header disabled>데이터 다운로드</Header>
              <a href={`/api/projects/${projectId}/publish`}>
                <Button icon="download" label="배포용 Json 파일 다운로드" />
              </a>
            </div>

            {config.ALLOW_DELETE ? (
              <div id="delete-project" style={{ padding: '2em 0' }}>
                <Header disabled>프로젝트 삭제</Header>
                <p>해당 프로젝트의 라벨 및 이미지 모두를 삭제합니다.</p>
                <Button negative onClick={this.handleDelete}>
                  삭제하기
                </Button>
              </div>
            ) : null}
          </div>
          <Segment
            style={{
              flex: '0 0 auto',
              width: 200,
              position: 'sticky',
              top: 65,
              alignSelf: 'flex-start',
              marginTop: 0,
              marginLeft: 30,
              boxShadow: '0 0 #FFFFFF',
            }}
          >
            <Header as="h3">현재 페이지:</Header>
            <List>
              <List.Item as="h4" style={{ marginBottom: 16 }}>
                <a href="#labels">라벨</a>
              </List.Item>
              <List.Item as="h4" style={{ marginBottom: 16 }}>
                <a href="#images">이미지 리스트</a>
              </List.Item>
              <List.Item>
                <a href="#upload-images">Upload Images</a>
              </List.Item>
              <List.Item as="h4" style={{ marginBottom: 16 }}>
                <a href="#export-data">데이터 다운로드</a>
              </List.Item>
              {config.ALLOW_DELETE ? (
                <List.Item>
                  <a href="#delete-project">Delete Project</a>
                </List.Item>
              ) : null}
            </List>
          </Segment>
        </div>
      </DocumentMeta>
    );
  }
}

const SortableItem = sortableElement(LabelFormItem);

const SortableContainer = sortableContainer(({ children }) => {
  return <div>{children}</div>;
});

const newFormPart = () => {
  const id = Math.random()
    .toString(36)
    .substr(2, 9);
  return {
    id,
    name: 'New label',
    type: 'bbox',
  };
};
