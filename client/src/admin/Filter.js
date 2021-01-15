import React, { Component } from 'react';

import { Dropdown } from 'semantic-ui-react';

export default class Filter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dropDownText: '전체보기',
    };

    this.handleFilterClicked = this.handleFilterClicked.bind(this);
  }

  handleFilterClicked(e, result) {
    const { onFilter } = this.props;
    this.setState({
      dropDownText: result.text,
    });
    onFilter(result.value);
  }

  render() {
    const { filteredImagesNum } = this.props;
    const { dropDownText } = this.state;
    return (
      <Dropdown
        text={`${dropDownText} ( ${filteredImagesNum} )`}
        icon="filter"
        floating
        labeled
        button
        className="icon"
        style={{
          width: 240,
          marginRight: 0,
          marginBottom: 16,
          background: 'teal',
          color: 'white',
        }}
      >
        <Dropdown.Menu style={{ left: 'auto', right: 0 }}>
          <Dropdown.Header icon="tags" content="필터 목록" />
          <Dropdown.Divider />
          <Dropdown.Item
            label={{ color: 'black', empty: true, circular: true }}
            value="ALL"
            text="전체보기"
            onClick={this.handleFilterClicked}
          />
          <Dropdown.Item
            label={{ color: 'blue', empty: true, circular: true }}
            value="LABELED"
            text="라벨링 완료"
            onClick={this.handleFilterClicked}
          />
          <Dropdown.Item
            label={{ color: 'red', empty: true, circular: true }}
            value="UNLABELED"
            text="라벨링 미완료"
            onClick={this.handleFilterClicked}
          />
          <Dropdown.Item
            label={{ color: 'blue', empty: true, circular: true }}
            value="INSPECTED"
            text="검수 완료"
            onClick={this.handleFilterClicked}
          />
          <Dropdown.Item
            label={{ color: 'red', empty: true, circular: true }}
            value="UNINSPECTED"
            text="검수 미완료"
            onClick={this.handleFilterClicked}
          />
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}
