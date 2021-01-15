import React, { Component } from 'react';

import { Header, List, Input, Button } from 'semantic-ui-react';

export default class Comment extends Component {
  constructor(props) {
    super(props);

    this.state = {
      comment: '',
    };

    this.handleCommentChange = this.handleCommentChange.bind(this);
    this.handleCommentAdd = this.handleCommentAdd.bind(this);
  }

  handleCommentChange(e) {
    this.setState({ comment: e.target.value });
  }

  handleCommentAdd() {
    const { comment } = this.state;
    const { onSubmit } = this.props;

    onSubmit(comment);
  }

  convertTime(date) {
    let dateData = new Date(date);

    const year = dateData.getFullYear();
    const month = dateData.getMonth() + 1;
    const day = dateData.getDate();
    const hour = dateData.getHours();
    const min = dateData.getMinutes();
    const sec = dateData.getSeconds();

    function checkDate(value) {
      return value < 10 ? `0${value}` : value;
    }

    const setDate = `${year}-${checkDate(month)}-${checkDate(day)}`;
    const setTime = `${checkDate(hour)}:${checkDate(min)}:${checkDate(sec)}`;

    return `${setDate} ${setTime}`;
  }

  render() {
    const { comment } = this.state;
    const { comments } = this.props;

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '1em 0.5em',
          borderRight: '1px solid #ccc',
          height: '100%',
          maxWidth: '300px',
        }}
      >
        <Header size="large" style={{ flex: '0 0 auto' }}>
          피드백 목록
        </Header>

        <List divided selection style={{ flex: 1, overflowY: 'auto' }}>
          {comments.map((cmt, i) => {
            const formattedDate = this.convertTime(cmt.createdAt);

            return (
              <List.Item key={i}>
                <List.Content style={{ color: '#000' }}>
                  {cmt.comment}
                </List.Content>
                <List.Description
                  style={{
                    textAlign: 'right',
                    color: '#CCC',
                    marginTop: 8,
                  }}
                >
                  {formattedDate}
                </List.Description>
              </List.Item>
            );
          })}
        </List>

        <footer>
          <Input
            placeholder="피드백을 남겨주세요."
            control="input"
            value={comment}
            style={{ fontSize: 12, width: '100%', marginTop: 10 }}
            onChange={this.handleCommentChange}
            onFocus={e => {
              e.preventDefault();
              this.props.focus();
            }}
            onBlur={e => {
              e.preventDefault();
              this.props.blur();
            }}
          />
          <Button
            primary
            style={{ float: 'right', marginTop: '2em' }}
            onClick={this.handleCommentAdd}
          >
            추가
          </Button>
        </footer>
      </div>
    );
  }
}
