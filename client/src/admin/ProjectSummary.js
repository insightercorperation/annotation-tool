import React, { Component } from 'react';
import { Grid, Segment, Header, Progress, Divider } from 'semantic-ui-react';

export default class ProjectSummary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      summary: null,
    };
  }

  async _fetchProjectsSummary() {
    const res = await fetch(`/api/summary`);

    if (!res.ok && res.status === 401) {
      alert('요약 정보를 가져오는 실패하였습니다.');
      return;
    }

    const summary = await res.json();
    return summary;
  }

  async componentDidMount() {
    const summary = await this._fetchProjectsSummary();
    if (summary) {
      this.setState({
        summary,
      });
    }
  }

  render() {
    const { summary } = this.state;

    if (!summary) {
      return <h1>loading...</h1>;
    }

    return (
      <>
        <h1>{this.props.title}</h1>
        <Header as="h3" block>
          전체
          <Divider />
          <Progress
            value={summary.total.labeled}
            total={summary.total.labeled + summary.total.unlabeled}
            color="black"
            progress="ratio"
          />
        </Header>
        <Header as="h3" block>
          완료된 프로젝트
          <Divider />
          <Progress
            value={summary.complete.labeled}
            total={summary.complete.labeled + summary.complete.unlabeled}
            color="blue"
            progress="ratio"
          />
        </Header>
        <Header as="h3" block>
          작업중인 프로젝트
          <Divider />
          <Progress
            value={summary.progress.labeled}
            total={summary.progress.labeled + summary.progress.unlabeled}
            color="green"
            progress="ratio"
          />
        </Header>
        <Header as="h3" block>
          중지된 프로젝트
          <Divider />
          <Progress
            value={summary.pause.labeled}
            total={summary.pause.labeled + summary.pause.unlabeled}
            color="red"
            progress="ratio"
          />
        </Header>
      </>
    );
  }
}
