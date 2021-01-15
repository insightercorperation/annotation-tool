import React, { Component } from 'react';
import LabelingApp from './LabelingApp';

import { Loader, Message, Grid } from 'semantic-ui-react';
import DocumentMeta from 'react-document-meta';

import { demoMocks } from './demo';

export default class LabelingLoader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      project: null,
      image: null,
      comments: null,
      isLoaded: false,
      error: null,
      notice: null,
    };
  }

  async fetch(...args) {
    const { projectId } = this.props.match.params;

    if (projectId === 'demo') {
      const path = typeof args[0] === 'string' ? args[0] : args[0].pathname;
      return demoMocks[path](...args);
    }

    return await fetch(...args);
  }

  componentDidMount() {
    this.refetch();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.imageId !== this.props.match.params.imageId) {
      this.refetch();
    }
  }

  componentWillUnmount() {
    this.setState = (state, callback) => {
      return;
    };
  }

  async refetch() {
    this.setState({
      isLoaded: false,
      error: null,
      project: null,
      image: null,
      comments: null,
      notice: null,
    });

    // Notice
    // kipris plus 정지 기간에만 화면이 뜨지 않도록 하는 코드임.
    // 추후 제거 필요함.
    // state의 notice를 제거하고
    let inProgressPeriod = () => {
      const start = new Date(2020, 9, 8, 12, 0, 0);
      const end = new Date(2020, 9, 12, 0, 0, 0);
      const now = new Date();

      if (now <= end && now >= start) {
        return true;
      } else {
        return false;
      }
    };

    if (inProgressPeriod()) {
      const firstContent =
        '안녕하세요 인사이터입니다. 현재 대부분의 이미지를 kiprisPlus(특허정보 활용 서비스)에서 가져오고 있습니다.' +
        ' 2020.10.8 ~ 2020.10.11 (약 4일간) kiprisPlus 서비스의 노후장비 교체 작업이 예정되어 있어서 부득이 하게 해당 기간동안 ' +
        '라벨링 서비스 또한 중단될 예정입니다.';

      const secondContent =
        'kiprisPlus에서 이미지를 가져오다 보니 kiprisPlus 서버에서 병목현상이 발생합니다. 이 때문에 저희 서비스에도 끊김현상이 발생합니다. ' +
        '현재 이 문제에 대해 인지하고 있으며 약 300만 건에 대한 이미지를 자체 데이터베이스에 이전하는 작업을 진행하고 있습니다. ' +
        '하루 빨리 해결하여 라벨링 작업에 불편함이 없도록 하겠습니다. 감사합니다.';

      this.setState({
        notice: [
          {
            header: '서비스 일시중단 공지 (2020.10.8 ~ 2020. 10.11, 약 4일)',
            content: firstContent,
          },
          {
            header: '서비스 개선 공지',
            content: secondContent,
          },
        ],
      });
      return;
    }

    const { match, history } = this.props;
    let { projectId, projectHash, imageId, embedded } = match.params;

    try {
      const a = document.createElement('a');
      a.setAttribute('href', '/api/getLabelingInfo');
      const url = new URL(a.href);

      url.searchParams.append('projectId', projectId);
      url.searchParams.append('projectHash', projectHash);
      if (imageId) {
        url.searchParams.append('imageId', imageId);
      }

      const { project, image, comments } = await (await this.fetch(url)).json();

      if (!project) {
        history.replace(`/label/${projectId}/${projectHash}/over`);
        return;
      }

      history.replace(
        `/label/${project.id}/${project.hash}/${image.id}/${
          embedded === 'embedded' ? 'embedded' : ''
        }`
      );

      this.setState({
        isLoaded: true,
        project,
        image,
        comments,
      });
    } catch (error) {
      this.setState({
        isLoaded: true,
        error,
      });
    }
  }

  async pushUpdate(labelData) {
    const { imageId } = this.props.match.params;
    const result = await this.fetch('/api/images/' + imageId, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ labelData }),
    });

    const { code } = await result.json();
    if (code === 400) {
      alert('서버에 오류가 있습니다. 다시 시도해 주세요');
    }
  }

  async pushCommentUpdate(comment) {
    // 이미지 아이디 어디서?
    const { imageId } = this.props.match.params;

    await this.fetch('/api/comments/' + imageId, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ comment }),
    });

    this.refetch();
  }

  async pushStatusUpdate(status) {
    const { projectId } = this.props.match.params;
    const result = await this.fetch('/api/status/' + projectId, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (result.status === 400) {
      alert('서버 오류. 다시 시도해 주세요');
    }
    this.refetch();
  }

  async markComplete() {
    const { imageId, userId } = this.props.match.params;
    const result = await this.fetch('/api/images/' + imageId, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ labeled: true, userId: `${userId}` }),
    });
    const { success, code } = await result.json();
    return {
      success,
      code,
    };
  }

  render() {
    const { history, embedded } = this.props;
    const { project, image, isLoaded, error, comments, notice } = this.state;

    if (notice) {
      return (
        <Grid
          centered
          verticalAlign="middle"
          columns={2}
          style={{ height: '100vh' }}
        >
          <Grid.Column>
            <Message
              warning
              header={notice[0].header}
              content={notice[0].content}
            />
            <Message
              positive
              header={notice[1].header}
              content={notice[1].content}
            />
          </Grid.Column>
        </Grid>
      );
    } else if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <Loader active inline="centered" />;
    }

    const title = `Image ${image.id} for project ${project.name} -- Label Tool`;
    const props = {
      onBack: () => {
        history.goBack();
      },
      onSkip: () => {
        history.push(`/label/${project.id}/${project.hash}`);
      },
      onSubmit: async () => {
        const res = await this.markComplete();
        if (res.success) {
          history.push(`/label/${project.id}/${project.hash}`);
        } else {
          alert('서버 오류. 다시 시도해 주세요.');
        }
      },
      onCommentSubmit: this.pushCommentUpdate.bind(this),
      onStatusChange: this.pushStatusUpdate.bind(this),
      onLabelChange: this.pushUpdate.bind(this),
    };

    const { referenceLink, referenceText } = project;
    return (
      <DocumentMeta title={title}>
        <LabelingApp
          labels={project.form.formParts}
          projectTitle={project.name}
          status={project.status}
          projectStatus={project.status}
          reference={{ referenceLink, referenceText }}
          labelData={image.labelData.labels || {}}
          imagesCount={project.imagesCount}
          labelsCount={project.labelsCount}
          imageUrl={image.link}
          imageLabeled={image.labeled}
          desc={image.desc}
          comments={comments}
          fetch={this.fetch.bind(this)}
          demo={project.id === 'demo'}
          embedded={embedded}
          {...props}
        />
      </DocumentMeta>
    );
  }
}
