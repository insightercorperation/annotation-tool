import React, { Component } from 'react';
import * as config from '../config';
import {
  Loader,
  Checkbox,
  Button,
  Input,
  Image,
  Table,
  Dropdown,
  Pagination,
} from 'semantic-ui-react';

import update from 'immutability-helper';
import shallowEqualObjects from 'shallow-equal/objects';

export default class ProjectImages extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      images: [],
      filter: 'ALL',
      currentPage: 1,
      postPerPage: 5,
      boundaryRange: 0,
      siblingRange: 2,
      showEllipsis: false,
      count: 0,
      dropDownText: '전체',
    };

    this.handleLabeled = this.handleLabeled.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.markAllLabeled = this.markAllLabeled.bind(this);
    this.markAllInspected = this.markAllInspected.bind(this);
    this.handleAsyncComment = this.handleAsyncComment.bind(this);
    this.handlePaginationChange = this.handlePaginationChange.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { projectId } = this.props;
    if (
      projectId === nextProps.projectId &&
      shallowEqualObjects(this.state, nextState)
    ) {
      return false;
    }
    return true;
  }

  async componentDidMount() {
    this.props.refetchRef(this.refetch.bind(this));
    await this.refetch();
  }

  async refetch() {
    const { projectId } = this.props;
    const { postPerPage } = this.state;
    try {
      let images = await (await fetch(
        `/api/images/?projectId=${projectId}&size=${postPerPage}&index=0`
      )).json();

      const { count } = await (await fetch(
        `/api/images/count?projectId=${projectId}`
      )).json();

      for (let i = 0; i < images.length; i++) {
        images[i]['comment'] = await this.handleAsyncComment(images[i].id);
      }

      this.setState({
        isLoaded: true,
        images,
        count,
      });
    } catch (error) {
      this.setState({
        isLoaded: true,
        error,
      });
    }
  }

  handleLabeled(imageId, labeled) {
    const { images } = this.state;
    const idx = images.findIndex(x => x.id === imageId);
    this.setState(state => ({
      images: update(state.images, {
        $splice: [[idx, 1, { ...state.images[idx], labeled }]],
      }),
    }));

    fetch('/api/images/' + imageId, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ labeled }),
    });
  }

  handleInspected(imageId, inspected) {
    const { images } = this.state;
    const idx = images.findIndex(x => x.id === imageId);
    this.setState(state => ({
      images: update(state.images, {
        $splice: [[idx, 1, { ...state.images[idx], inspected }]],
      }),
    }));

    fetch('/api/images/' + imageId, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inspected }),
    });
  }

  handleDelete(imageId) {
    const { images } = this.state;
    const idx = images.findIndex(x => x.id === imageId);
    this.setState(state => ({
      images: update(state.images, {
        $splice: [[idx, 1]],
      }),
    }));

    fetch('/api/images/' + imageId, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }

  handleDescChange(imageId, desc) {
    const { images } = this.state;
    const idx = images.findIndex(x => x.id === imageId);

    this.setState(state => ({
      images: update(state.images, {
        $splice: [[idx, 1, { ...state.images[idx], desc }]],
      }),
    }));

    fetch('/api/images/' + imageId, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ desc }),
    });
  }

  async markAllLabeled(labeled) {
    const { projectId } = this.props;

    const result = await fetch('/api/projects/images/label', {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId, labeled: labeled }),
    });

    const message = labeled ? '확인' : '제거';
    if (result.ok) {
      alert(`모든 라벨 ${message} 완료`);
      this.refetch();
    } else {
      alert('라벨 변경 실패');
      this.refetch();
    }
  }

  async markAllInspected(inspected) {
    const { projectId } = this.props;

    const result = await fetch('/api/projects/images/inspect', {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId, inspected: inspected }),
    });

    const message = inspected ? '확인' : '제거';
    if (result.ok) {
      alert(`모든 검토여부 ${message} 완료`);
      this.refetch();
    } else {
      alert('검토여부 변경 실패');
      this.refetch();
    }
  }

  // TODO: 리팩토링 필요
  async handleFilterChange(filter, text) {
    const { projectId } = this.props;
    const { postPerPage } = this.state;
    this.setState({
      isLoaded: false,
    });

    if (filter === 'ALL') {
      const images = await (await fetch(
        `/api/images/?projectId=${projectId}&size=${postPerPage}&index=0`
      )).json();

      const { count } = await (await fetch(
        `/api/images/count?projectId=${projectId}`
      )).json();

      for (let i = 0; i < images.length; i++) {
        images[i]['comment'] = await this.handleAsyncComment(images[i].id);
      }

      this.setState({
        images,
        count,
        currentPage: 1,
        filter,
        dropDownText: text,
      });
    } else if (filter === 'LABELED') {
      const images = await (await fetch(
        `/api/images/?projectId=${projectId}&size=${postPerPage}&index=0&labeled=1`
      )).json();

      const { count } = await (await fetch(
        `/api/images/count?projectId=${projectId}&labeled=1`
      )).json();

      for (let i = 0; i < images.length; i++) {
        images[i]['comment'] = await this.handleAsyncComment(images[i].id);
      }

      this.setState({
        images,
        count,
        currentPage: 1,
        filter,
        dropDownText: text,
      });
    } else if (filter === 'UNLABELED') {
      const images = await (await fetch(
        `/api/images/?projectId=${projectId}&size=${postPerPage}&index=0&labeled=0`
      )).json();

      const { count } = await (await fetch(
        `/api/images/count?projectId=${projectId}&labeled=0`
      )).json();

      for (let i = 0; i < images.length; i++) {
        images[i]['comment'] = await this.handleAsyncComment(images[i].id);
      }

      this.setState({
        images,
        count,
        currentPage: 1,
        filter,
        dropDownText: text,
      });
    }
    this.setState({
      isLoaded: true,
    });
  }

  // TODO: 리팩토링 필요
  async handlePaginationChange(e, { activePage }) {
    const { projectId } = this.props;
    const { postPerPage, filter } = this.state;
    const indexOfLastImage = activePage * postPerPage;
    const indexOfFirstImage = indexOfLastImage - postPerPage;
    this.setState({
      isLoaded: false,
    });

    if (filter === 'ALL') {
      const images = await (await fetch(
        `/api/images/?projectId=${projectId}&size=${postPerPage}&index=${indexOfFirstImage}`
      )).json();

      const { count } = await (await fetch(
        `/api/images/count?projectId=${projectId}`
      )).json();

      for (let i = 0; i < images.length; i++) {
        images[i]['comment'] = await this.handleAsyncComment(images[i].id);
      }

      this.setState({ images, count });
    } else if (filter === 'LABELED') {
      const images = await (await fetch(
        `/api/images/?projectId=${projectId}&size=${postPerPage}&index=${indexOfFirstImage}&labeled=1`
      )).json();

      const { count } = await (await fetch(
        `/api/images/count?projectId=${projectId}&labeled=1`
      )).json();

      for (let i = 0; i < images.length; i++) {
        images[i]['comment'] = await this.handleAsyncComment(images[i].id);
      }

      this.setState({ images, count });
    } else if (filter === 'UNLABELED') {
      const images = await (await fetch(
        `/api/images/?projectId=${projectId}&size=${postPerPage}&index=${indexOfFirstImage}&labeled=0`
      )).json();

      const { count } = await (await fetch(
        `/api/images/count?projectId=${projectId}&labeled=0`
      )).json();

      for (let i = 0; i < images.length; i++) {
        images[i]['comment'] = await this.handleAsyncComment(images[i].id);
      }

      this.setState({ images, count });
    }

    this.setState({
      currentPage: activePage,
      isLoaded: true,
    });
  }

  async handleAsyncComment(imageId) {
    const cmts = await (await fetch(`/api/comments/${imageId}`)).json();
    return cmts.comments.map(comment => comment.comment).slice(0, 3);
  }

  render() {
    const { projectId, projectHash } = this.props;
    const {
      error,
      isLoaded,
      images,
      count,
      currentPage,
      postPerPage,
      boundaryRange,
      siblingRange,
      showEllipsis,
      dropDownText,
    } = this.state;

    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <Loader active inline="centered" />;
    }
    const pageNumbers = [];
    for (let i = 0; i < Math.ceil(count / postPerPage); i++) {
      pageNumbers.push(i);
    }

    const renderDropdown = projectId ? (
      <div style={{ display: 'flex' }}>
        <Dropdown
          text={`${dropDownText} ( ${count} )`}
          icon="filter"
          floating
          labeled
          button
          className="icon"
          style={{
            backgroundColor: 'teal',
            padding: 8,
            marginBottom: 16,
            marginLeft: 'auto',
            borderRadius: 4,
            border: '1px solid teal',
            fontWeight: 'bold',
            color: 'white',
            width: 200,
          }}
        >
          <Dropdown.Menu style={{ width: '100%' }}>
            <Dropdown.Item
              text="전체"
              onClick={() => this.handleFilterChange('ALL', '전체')}
            />
            <Dropdown.Item
              text="라벨링 완료"
              onClick={() => this.handleFilterChange('LABELED', '라벨링 완료')}
            />
            <Dropdown.Item
              text="라벨링 필요"
              onClick={() =>
                this.handleFilterChange('UNLABELED', '라벨링 필요')
              }
            />
          </Dropdown.Menu>
        </Dropdown>
      </div>
    ) : null;

    return (
      <div className="project-images">
        {renderDropdown}
        <div>
          <Table columns={6}>
            <Table.Header>
              <Table.Row style={{ textAlign: 'center' }}>
                <Table.HeaderCell>아이디</Table.HeaderCell>
                <Table.HeaderCell>이미지</Table.HeaderCell>
                <Table.HeaderCell>이미지설명</Table.HeaderCell>
                <Table.HeaderCell>라벨여부</Table.HeaderCell>
                <Table.HeaderCell>검토여부</Table.HeaderCell>
                <Table.HeaderCell>버튼</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {images.map((image, i) => (
                <Table.Row
                  key={image.id}
                  style={{
                    backgroundColor: image.labeled
                      ? 'rgba(233, 242, 249, 1)'
                      : null,
                  }}
                >
                  <Table.Cell
                    style={{ textAlign: 'center', fontWeight: 'bold' }}
                  >
                    {image.id}
                  </Table.Cell>
                  <Table.Cell>
                    <a href={image.link}>
                      <Image
                        style={{
                          width: '100%',
                          height: '100px',
                          objectFit: 'scale-down',
                        }}
                        src={image.link}
                      />
                    </a>
                  </Table.Cell>
                  <Table.Cell>
                    <Input
                      placeholder="이미지 설명 입력"
                      readOnly={!config.ALLOW_EDIT}
                      control="input"
                      defaultValue={image.desc}
                      style={{ fontSize: 16, width: '100%' }}
                      onChange={(e, { value }) =>
                        this.handleDescChange(image.id, value)
                      }
                    />
                  </Table.Cell>
                  <Table.Cell style={{ textAlign: 'center' }}>
                    <Checkbox
                      checked={!!image.labeled}
                      onChange={(e, { checked }) =>
                        this.handleLabeled(image.id, checked)
                      }
                    />
                  </Table.Cell>
                  <Table.Cell style={{ textAlign: 'center' }}>
                    <Checkbox
                      checked={!!image.inspected}
                      onChange={(e, { checked }) =>
                        this.handleInspected(image.id, checked)
                      }
                    />
                  </Table.Cell>
                  <Table.Cell style={{ textAlign: 'center' }}>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`/label/${projectId}/${projectHash}/${image.id}`}
                    >
                      <Button icon="pencil" label="수정" size="tiny" />
                    </a>
                    {config.ALLOW_DELETE ? (
                      <Button
                        icon="trash"
                        label="삭제"
                        size="tiny"
                        style={{ marginTop: 8 }}
                        onClick={() => this.handleDelete(image.id)}
                      />
                    ) : null}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          <div style={{ textAlign: 'center' }}>
            <Pagination
              boundaryRange={boundaryRange}
              activePage={currentPage}
              onPageChange={this.handlePaginationChange}
              siblingRange={siblingRange}
              totalPages={pageNumbers.length}
              ellipsisItem={showEllipsis ? undefined : null}
            />
          </div>
        </div>
        <div style={{ marginTop: '50px' }} />
        <h3>주의. 아래의 버튼을 누르면 바로 적용됩니다.</h3>
        {config.ALLOW_EDIT ? (
          <Button
            icon="cancel"
            label="모든 라벨여부 제거"
            onClick={() => {
              this.markAllLabeled(false);
            }}
          />
        ) : null}
        {config.ALLOW_EDIT ? (
          <Button
            icon="check"
            label="모든 라벨여부 확인"
            onClick={() => {
              this.markAllLabeled(true);
            }}
          />
        ) : null}
        {config.ALLOW_EDIT ? (
          <Button
            icon="cancel"
            label="모든 검토여부 제거"
            onClick={() => {
              this.markAllInspected(false);
            }}
          />
        ) : null}
        {config.ALLOW_EDIT ? (
          <Button
            icon="check"
            label="모든 검토여부 확인"
            onClick={() => {
              this.markAllInspected(true);
            }}
          />
        ) : null}
      </div>
    );
  }
}
