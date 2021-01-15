import React, { Component } from 'react';

import { Header, List, Label } from 'semantic-ui-react';

import Filter from './Filter';

export default class SideBar extends Component {
  render() {
    const {
      images,
      onImageClicked,
      onFilter,
      currentImage,
      filteredImagesNum,
    } = this.props;

    return (
      <div>
        <div
          style={{
            position: 'absolute',
            top: '-105px',
            left: 0,
          }}
        >
          <Header size="large">이미지 라벨링 목록</Header>
          <Filter onFilter={onFilter} filteredImagesNum={filteredImagesNum} />
        </div>

        <List
          divided
          selection
          style={{
            margin: '0 auto',
            overflow: 'auto',
            maxHeight: 650,
            padding: 5,
          }}
        >
          {images.map((image, i) => {
            const checkLabeledText =
              image.labeled === 1 ? '라벨링 O' : '라벨링 X';
            const checkLabeledColor = image.labeled === 1 ? 'blue' : 'red';
            const checkInspectedText =
              image.inspected === 1 ? '검수 O' : '검수 X';

            const checkInspectedColor = image.inspected === 1 ? 'blue' : 'red';

            const currentImageColor =
              image.id === currentImage.id ? 'rgba(44, 130, 201, 0.2)' : null;

            return (
              <List.Item
                key={image.id}
                onClick={() => {
                  onImageClicked(image);
                }}
                style={{
                  backgroundColor: currentImageColor,
                }}
                ref={i}
              >
                <List.Content
                  style={{
                    width: '100%',
                    wordBreak: 'break-all',
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: '#000',
                  }}
                >
                  {image.originalName}
                </List.Content>
                <div style={{ textAlign: 'right', marginTop: 8 }}>
                  <Label color={checkLabeledColor} horizontal>
                    {checkLabeledText}
                  </Label>
                  <Label color={checkInspectedColor} horizontal>
                    {checkInspectedText}
                  </Label>
                </div>
              </List.Item>
            );
          })}
        </List>
      </div>
    );
  }
}
