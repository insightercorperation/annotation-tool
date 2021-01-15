import React, { Component } from 'react';
import { Progress } from 'semantic-ui-react';

export default class LabelingProgress extends Component {
  render() {
    const { imagesCount, labelsCount } = this.props;
    // TODO: 라벨링 된 갯수와 전체 갯수를 직관적인 메시지 필요
    const label = `${labelsCount} / ${imagesCount}`;
    const percent = ((labelsCount / imagesCount) * 100).toFixed();

    return (
      <Progress
        percent={percent}
        label={label}
        active
        progress
        color="blue"
        size="small"
      />
    );
  }
}
