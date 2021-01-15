import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Loader,
  Header,
  Table,
  Pagination,
  Dropdown,
} from 'semantic-ui-react';
import * as config from '../config';

export default class ProjectsGrid extends Component {
  defaultPageOffset = 0;
  defaultPageCount = 10;

  filterOptions = {
    ALL: {
      key: 'ALL',
      text: '전체',
    },
    PAUSE: {
      key: 'PAUSE',
      text: '중지',
      color: 'rgba(240, 52, 52, 1)',
      background: 'rgba(253, 234, 234, 1)',
    },
    PROGRESS: {
      key: 'PROGRESS',
      text: '작업중',
      color: 'rgba(3, 166, 120, 1)',
      background: 'rgba(229, 246, 241, 1)',
    },
    INSPECT: {
      key: 'INSPECT',
      text: '검수중',
      color: 'rgba(248, 148, 6, 1)',
      background: 'rgba(254, 244, 230, 1)',
    },
    INSPECTCOMPLETE: {
      key: 'INSPECTCOMPLETE',
      text: '검수완료',
      color: 'rgba(134, 200, 60, 1)',
      background: 'rgba(233, 249, 236, 1)',
    },
    COMPLETE: {
      key: 'COMPLETE',
      text: '완료',
      color: 'rgba(44, 130, 201, 1)',
      background: 'rgba(233, 242, 249, 1)',
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      projects: [],
      pageOffset: this.defaultPageOffset,
      numOfPostPerPage: this.defaultPageCount,
      boundaryRange: 0,
      siblingRange: 2,
      count: 0,
      filter: this.filterOptions.ALL,
    };

    this.handleNewProject = this.handleNewProject.bind(this);
    this.handlePaginationChange = this.handlePaginationChange.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
  }

  async _fetchProjects(pageOffset, numOfPostPerPage, filterKey) {
    if (filterKey === this.filterOptions.ALL.key) {
      return await fetch(
        `/api/projects?index=${pageOffset}&size=${numOfPostPerPage}`
      );
    }
    return await fetch(
      `/api/projects?index=${pageOffset}&size=${numOfPostPerPage}&status=${filterKey}`
    );
  }

  async _fetchProjectCount(filterKey) {
    if (filterKey === this.filterOptions.ALL.key) {
      return await fetch(`/api/projects/count`);
    }
    return await fetch(`/api/projects/count?status=${filterKey}`);
  }

  async _postNewProject() {
    return await fetch('/api/projects', { method: 'POST' });
  }

  async componentDidMount() {
    const { pageOffset, numOfPostPerPage, filter } = this.state;

    try {
      const resProjects = await this._fetchProjects(
        pageOffset,
        numOfPostPerPage,
        filter.key
      );
      const resCount = await this._fetchProjectCount(filter.key);

      if (!resProjects.ok && resProjects.status === 401) {
        window.location = '/admin/login/';
        return;
      }

      if (!resCount.ok && resCount.status === 401) {
        window.location = '/admin/login/';
        return;
      }

      const projects = await resProjects.json();
      const { count } = await resCount.json();

      this.setState({
        isLoaded: true,
        projects,
        count,
      });
    } catch (error) {
      this.setState({
        isLoaded: true,
        error,
      });
    }
  }

  async handleNewProject() {
    const res = await this._postNewProject();
    if (!res.ok && res.status === 401) {
      alert('프로젝트 생성에 실패하였습니다.');
      return;
    }

    const { pageOffset, numOfPostPerPage, filter } = this.state;

    const resProjects = await this._fetchProjects(
      pageOffset,
      numOfPostPerPage,
      filter.key
    );
    const resCount = await this._fetchProjectCount(filter.key);

    if (!resProjects.ok && resProjects.status === 401) {
      alert('프로젝트 목록을 가져오는데 실패하였습니다.');
      return;
    }

    if (!resCount.ok && resCount.status === 401) {
      alert('프로젝트 개수를 가져오는데 실패하였습니다.');
      return;
    }

    const projects = await resProjects.json();
    const { count } = await resCount.json();

    this.setState({
      projects,
      count,
    });
  }

  async handlePaginationChange(e, { activePage }) {
    const { numOfPostPerPage, filter } = this.state;
    const newpageOffset = numOfPostPerPage * (activePage - 1);

    const resProjects = await this._fetchProjects(
      newpageOffset,
      numOfPostPerPage,
      filter.key
    );
    const resCount = await this._fetchProjectCount(filter.key);

    if (!resProjects.ok && resProjects.status === 401) {
      alert('프로젝트 목록을 가져오는데 실패하였습니다.');
      return;
    }

    if (!resCount.ok && resCount.status === 401) {
      alert('프로젝트 개수를 가져오는데 실패하였습니다.');
      return;
    }

    const projects = await resProjects.json();
    const { count } = await resCount.json();

    this.setState({
      projects,
      count,
      pageOffset: newpageOffset,
    });
  }

  async handleFilterChange(filterKey) {
    const { numOfPostPerPage } = this.state;

    const resProjects = await this._fetchProjects(
      this.defaultPageOffset,
      numOfPostPerPage,
      filterKey
    );
    const resCount = await this._fetchProjectCount(filterKey);

    if (!resProjects.ok && resProjects.status === 401) {
      alert('프로젝트 목록을 가져오는데 실패하였습니다.');
      return;
    }

    if (!resCount.ok && resCount.status === 401) {
      alert('프로젝트 개수를 가져오는데 실패하였습니다.');
      return;
    }

    const projects = await resProjects.json();
    const { count } = await resCount.json();

    this.setState({
      filter: this.filterOptions[filterKey],
      projects,
      count,
      pageOffset: this.defaultPageOffset,
    });
  }

  async handlePostPerChange(numOfPostPerPage) {
    const { filter } = this.state;

    const resProjects = await this._fetchProjects(
      this.defaultPageOffset,
      numOfPostPerPage,
      filter.key
    );
    const resCount = await this._fetchProjectCount(filter.key);

    if (!resProjects.ok && resProjects.status === 401) {
      alert('프로젝트 목록을 가져오는데 실패하였습니다.');
      return;
    }

    if (!resCount.ok && resCount.status === 401) {
      alert('프로젝트 개수를 가져오는데 실패하였습니다.');
      return;
    }

    const projects = await resProjects.json();
    const { count } = await resCount.json();

    this.setState({
      projects,
      count,
      pageOffset: this.defaultPageOffset,
      numOfPostPerPage,
    });
  }

  render() {
    const {
      error,
      isLoaded,
      projects,
      pageOffset,
      numOfPostPerPage,
      boundaryRange,
      siblingRange,
      count,
      filter,
    } = this.state;

    const { linkPrefix, showCreateButton, title } = this.props;

    // 에러 및 로딩
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <Loader active inline="centered" />;
    }

    // 프로젝트 추가 버튼
    const CreationButton = showCreateButton ? (
      <Button onClick={this.handleNewProject}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 32, marginRight: 16 }}>+</span>
          <span>프로젝트 추가</span>
        </div>
      </Button>
    ) : null;

    const ProjectRow = project => {
      const {
        id,
        hash,
        status,
        name,
        imagesCount,
        labelsCount,
        form,
      } = project;
      const desc = form.formParts.map(part => part.name).join(', ');

      return (
        <Table.Row key={id} style={{ textAlign: 'center', fontWeight: 'bold' }}>
          <Table.Cell>{id}</Table.Cell>
          <Table.Cell style={{ width: '30%' }}>
            {name.length > 100 ? name.slice(0, 100) + '...' : name}
          </Table.Cell>
          <Table.Cell>{imagesCount}</Table.Cell>
          <Table.Cell>{labelsCount}</Table.Cell>
          <Table.Cell style={{ width: '20%' }}>
            {desc.length > 35 ? desc.slice(0, 35) + '...' : desc}
          </Table.Cell>
          <Table.Cell>
            <Button
              style={{
                width: 70,
                padding: 8,
                cursor: 'auto',
                backgroundColor: this.filterOptions[status].background,
                color: this.filterOptions[status].color,
              }}
            >
              {this.filterOptions[status].text}
            </Button>
          </Table.Cell>
          <Table.Cell>
            <Link to={`${linkPrefix}${id}/${hash}`}>
              <Button
                style={{
                  width: 64,
                  padding: 8,
                  backgroundColor: 'teal',
                  color: 'white',
                }}
              >
                수정
              </Button>
            </Link>
          </Table.Cell>
        </Table.Row>
      );
    };

    // 페이지네이션
    const paginationNumber = () => {
      if (pageOffset === 0) return 1;
      return pageOffset / numOfPostPerPage + 1;
    };

    const ProjectPagination = projects ? (
      <Pagination
        boundaryRange={boundaryRange}
        activePage={paginationNumber()}
        onPageChange={this.handlePaginationChange}
        siblingRange={siblingRange}
        totalPages={Math.ceil(count / numOfPostPerPage)}
        ellipsisItem={null}
      />
    ) : null;

    return (
      <div style={{ position: 'relative', paddingBottom: 32 }}>
        <Header as="h1" style={{ marginTop: 32, marginBottom: 32 }}>
          {title}
        </Header>
        <div style={{ display: 'flex' }}>
          {CreationButton}
          <Dropdown
            text={`${numOfPostPerPage}개씩 보기`}
            icon="list ul"
            floating
            labeled
            button
            className="icon"
            style={{
              backgroundColor: '#38388F',
              padding: 16,
              marginBottom: 16,
              marginLeft: 'auto',
              borderRadius: 4,
              border: '1px solid #38388F',
              fontWeight: 'bold',
              color: 'white',
              width: 180,
            }}
          >
            <Dropdown.Menu style={{ width: '100%' }}>
              <Dropdown.Item
                text="10개씩 보기"
                onClick={() => this.handlePostPerChange(10)}
              />
              <Dropdown.Item
                text="50개씩 보기"
                onClick={() => this.handlePostPerChange(50)}
              />
              <Dropdown.Item
                text="100개씩 보기"
                onClick={() => this.handlePostPerChange(100)}
              />
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown
            text={`${filter.text} ( ${count} )`}
            icon="filter"
            floating
            labeled
            button
            className="icon"
            style={{
              backgroundColor: '#AA8637',
              padding: 16,
              marginBottom: 16,
              marginLeft: 1,
              borderRadius: 4,
              border: '1px solid #AA8637',
              fontWeight: 'bold',
              color: 'white',
              width: 180,
            }}
          >
            <Dropdown.Menu style={{ width: '100%' }}>
              <Dropdown.Item
                text={this.filterOptions.ALL.text}
                onClick={() =>
                  this.handleFilterChange(this.filterOptions.ALL.key)
                }
              />
              <Dropdown.Item
                text={this.filterOptions.PAUSE.text}
                onClick={() =>
                  this.handleFilterChange(this.filterOptions.PAUSE.key)
                }
              />
              <Dropdown.Item
                text={this.filterOptions.PROGRESS.text}
                onClick={() =>
                  this.handleFilterChange(this.filterOptions.PROGRESS.key)
                }
              />
              <Dropdown.Item
                text={this.filterOptions.INSPECT.text}
                onClick={() =>
                  this.handleFilterChange(this.filterOptions.INSPECT.key)
                }
              />
              <Dropdown.Item
                text={this.filterOptions.INSPECTCOMPLETE.text}
                onClick={() =>
                  this.handleFilterChange(
                    this.filterOptions.INSPECTCOMPLETE.key
                  )
                }
              />
              <Dropdown.Item
                text={this.filterOptions.COMPLETE.text}
                onClick={() =>
                  this.handleFilterChange(this.filterOptions.COMPLETE.key)
                }
              />
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <Table>
          <Table.Header>
            <Table.Row style={{ textAlign: 'center' }}>
              <Table.HeaderCell>아이디</Table.HeaderCell>
              <Table.HeaderCell>프로젝트이름</Table.HeaderCell>
              <Table.HeaderCell>이미지갯수</Table.HeaderCell>
              <Table.HeaderCell>완료된 라벨개수</Table.HeaderCell>
              <Table.HeaderCell>태그</Table.HeaderCell>
              <Table.HeaderCell>상태</Table.HeaderCell>
              <Table.HeaderCell>프로젝트로 이동</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>{projects.map(ProjectRow)}</Table.Body>
        </Table>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div>{ProjectPagination}</div>
        </div>
      </div>
    );
  }
}
