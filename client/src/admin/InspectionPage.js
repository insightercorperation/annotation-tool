import React, { Component } from 'react';

import {
  Loader,
  Checkbox,
  Segment,
  Header,
  Button,
  Pagination,
  Table,
  Popup,
} from 'semantic-ui-react';
import update from 'immutability-helper';

import SideBar from './SideBar';
import Hotkeys from 'react-hot-keys';

class InspectionPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoaded: false,
      images: null,
      currentImage: null,
      filter: 'ALL',
      currentPage: 1,
      postPerPage: 10,
      boundaryRange: 0,
      siblingRange: 2,
      error: null,
    };

    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleImageChange = this.handleImageChange.bind(this);
    this.handleLabeled = this.handleLabeled.bind(this);
  }

  async componentDidMount() {
    try {
      const { projectId } = this.props.match.params;

      const images = await (
        await fetch('/api/images/?projectId=' + projectId)
      ).json();

      this.setState({
        isLoaded: true,
        images,
        currentImage: images[0], // 초기값
      });
    } catch (error) {
      this.setState({
        isLoaded: true,
        error,
      });
    }
  }

  handleFilterChange(filter) {
    const { images } = this.state;

    var filteredImages = null;

    switch (filter) {
      case 'ALL':
        filteredImages = images;
        break;

      case 'LABELED':
        filteredImages = images.filter(image => image.labeled === 1);
        break;

      case 'UNLABELED':
        filteredImages = images.filter(image => image.labeled === 0);
        break;

      case 'INSPECTED':
        filteredImages = images.filter(image => image.inspected === 1);
        break;

      case 'UNINSPECTED':
        filteredImages = images.filter(image => image.inspected === 0);
        break;

      default:
    }

    this.setState({
      currentImage: filteredImages.length !== 0 ? filteredImages[0] : images[0],
      currentPage: 1,
      filter,
    });
  }

  handleImageChange(currentImage) {
    this.setState({ currentImage });
  }

  handleLabeled(imageId, labeled) {
    const { images } = this.state;
    const idx = images.findIndex(x => x.id === imageId);

    this.setState(state => ({
      images: update(state.images, {
        $splice: [[idx, 1, { ...state.images[idx], labeled }]],
      }),
      currentImage: {
        ...state.currentImage,
        labeled,
      },
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
      currentImage: {
        ...state.currentImage,
        inspected,
      },
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

  handlePaginationChange = (e, { activePage }) =>
    this.setState({
      currentPage: activePage,
    });

  render() {
    const { projectId, projectHash } = this.props.match.params;
    const {
      images,
      isLoaded,
      currentImage,
      filter,
      currentPage,
      postPerPage,
      boundaryRange,
      siblingRange,
    } = this.state;

    if (!isLoaded) {
      return <Loader active inline="centered" />;
    }

    const indexOfLastImage = currentPage * postPerPage;
    const indexOfFirstImage = indexOfLastImage - postPerPage;
    let currentImages = null;
    let filteredImages = null;
    const pageNumbers = [];

    function setCurrentImages(filteredImages) {
      return filteredImages.slice(indexOfFirstImage, indexOfLastImage);
    }

    switch (filter) {
      case 'ALL':
        filteredImages = images;
        currentImages = setCurrentImages(images);
        break;
      case 'LABELED':
        filteredImages = images.filter(image => image.labeled === 1);
        currentImages = setCurrentImages(filteredImages);
        break;
      case 'UNLABELED':
        filteredImages = images.filter(image => image.labeled === 0);
        currentImages = setCurrentImages(filteredImages);
        break;
      case 'INSPECTED':
        filteredImages = images.filter(image => image.inspected === 1);
        currentImages = setCurrentImages(filteredImages);
        break;
      case 'UNINSPECTED':
        filteredImages = images.filter(image => image.inspected === 0);
        currentImages = setCurrentImages(filteredImages);
        break;
      default:
    }

    for (let i = 0; i < Math.ceil(filteredImages.length / postPerPage); i++) {
      pageNumbers.push(i);
    }

    return (
      <div style={{ height: 'auto', position: 'relative' }}>
        <Header
          size="large"
          style={{
            flex: '0 0 auto',
            textAlign: 'center',
            marginTop: 32,
          }}
        >
          이미지 라벨링 검수
        </Header>

        <div style={{ textAlign: 'right' }}>
          <Popup
            position="bottom right"
            content={
              <div>
                <Header as="h3"> 단축키 </Header>
                <Table celled>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>기능</Table.HeaderCell>
                      <Table.HeaderCell>키</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>

                  <Table.Body>
                    <Table.Row>
                      <Table.Cell>이전 아이탬</Table.Cell>
                      <Table.Cell>←</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>다음 아이탬</Table.Cell>
                      <Table.Cell>→</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>이전 페이지</Table.Cell>
                      <Table.Cell>Shift + ←</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>다음 페이지</Table.Cell>
                      <Table.Cell>Shift + →</Table.Cell>
                    </Table.Row>
                  </Table.Body>
                </Table>

                <Header as="h3"> 라벨링 </Header>
                <Table celled>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>색</Table.HeaderCell>
                      <Table.HeaderCell>의미</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>

                  <Table.Body>
                    <Table.Row>
                      <Table.Cell>빨강</Table.Cell>
                      <Table.Cell>라벨링 안됨</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>파랑</Table.Cell>
                      <Table.Cell>라벨링 됨</Table.Cell>
                    </Table.Row>
                  </Table.Body>
                </Table>

                <Header as="h3"> 검수 </Header>
                <Table celled>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>색</Table.HeaderCell>
                      <Table.HeaderCell>의미</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>

                  <Table.Body>
                    <Table.Row>
                      <Table.Cell>빨강</Table.Cell>
                      <Table.Cell>검수 안됨</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>파랑</Table.Cell>
                      <Table.Cell>검수 됨</Table.Cell>
                    </Table.Row>
                  </Table.Body>
                </Table>
              </div>
            }
            on="click"
            pinne="true"
            trigger={
              <Button
                primary
                content="도움말"
                style={{
                  width: 72,
                  height: 36,
                  marginRight: 0,
                  padding: 8,
                }}
              />
            }
          />
        </div>

        <div id="images" style={{ display: 'flex', padding: '2em 0' }}>
          <Hotkeys
            keyName="left,right,Shift+left,Shift+right,space,enter"
            onKeyDown={key => {
              var idx = currentImages.findIndex(x => x.id === currentImage.id);
              var pageNumber = currentPage;

              if (key === 'left') {
                --idx;
              } else if (key === 'right') {
                ++idx;
              } else if (key === 'Shift+right') {
                ++pageNumber;
              } else if (key === 'Shift+left') {
                --pageNumber;
              } else if (key === 'space') {
              } else if (key === 'enter') {
              }

              if (1 <= pageNumber && pageNumber <= pageNumbers.length) {
                this.setState({ currentPage: pageNumber });
              }

              if (0 <= idx && idx < currentImages.length) {
                this.setState({ currentImage: currentImages[idx] });
              }

              if (idx === currentImages.length) {
                this.setState({
                  currentPage: ++pageNumber,
                });
              }
            }}
          />
          <Segment
            style={{
              width: '30%',
              maxHeight: 700,
              marginRight: 32,
              marginBottom: 0,
              padding: 16,
            }}
          >
            <SideBar
              images={currentImages}
              currentImage={currentImage}
              filteredImagesNum={filteredImages.length}
              onImageClicked={this.handleImageChange}
              onLabelingFilterd={this.handleLablingFilter}
              onChange={this.handleInspectedFilter}
              onFilter={this.handleFilterChange}
            />
          </Segment>
          <div style={{ width: '70%', height: 700, margin: '0 auto' }}>
            <iframe
              title="현재 작업중인 라벨링 상태"
              src={`/label/${projectId}/${projectHash}/${currentImage.id}/embedded`}
              style={{ width: '100%', height: '100%' }}
            />
            <div>
              <div
                style={{
                  textAlign: 'right',
                  marginTop: 16,
                }}
              >
                <Checkbox
                  checked={!!currentImage.labeled}
                  label="라벨링"
                  style={{ margin: 8, fontSize: 16 }}
                  onChange={(e, { checked }) =>
                    this.handleLabeled(currentImage.id, checked ? 1 : 0)
                  }
                />
                <Checkbox
                  checked={!!currentImage.inspected}
                  label="검수"
                  style={{ margin: 8, fontSize: 16 }}
                  onChange={(e, { checked }) =>
                    this.handleInspected(currentImage.id, checked ? 1 : 0)
                  }
                />
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`/label/${projectId}/${projectHash}/${currentImage.id}`}
                >
                  <Button
                    style={{
                      width: 72,
                      height: 36,
                      padding: 8,
                      marginRight: 0,
                      marginLeft: 16,
                      backgroundColor: 'teal',
                      color: 'white',
                    }}
                  >
                    수정
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'left' }}>
          <Pagination
            boundaryRange={boundaryRange}
            activePage={currentPage}
            onPageChange={this.handlePaginationChange}
            siblingRange={siblingRange}
            totalPages={pageNumbers.length}
            ellipsisItem={null}
            firstItem={null}
            lastItem={null}
          />
        </div>
      </div>
    );
  }
}

export default InspectionPage;
