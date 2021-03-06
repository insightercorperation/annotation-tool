import React, { Component } from 'react';
import Menubar from '../common/Menubar';

export default class Home extends Component {
  render() {
    return (
      <Menubar active="admin">
        <h1>사용법</h1>
        <h3>프로젝트 추가 및 라벨 추가</h3>
        <p>
          프로젝트를 추가합니다. 프로젝트를 통해 연관성 있는 라벨링 작업을
          관리할 수 있습니다. 각 프로젝트마다 다른 종류의 라벨을 가질 수
          있습니다. 라벨의 이름에 제약은 없지만, <b>"제거"</b> 이름의 라벨은
          특별한 역할을 합니다. 해당 라벨은 모든 라벨에 대해 "제거"라벨과 중복된
          부분을 잘라냅니다.
        </p>
        <h3>프로젝트 진행</h3>
        <p>
          각 프로젝트 별로 고유의 링크가 있습니다. 외부 사람 누구나 해당 라벨에
          접속해서 라벨링 작업을 진행할 수 있습니다. 프로젝트 관리는
          관리자(비밀번호 설정 가능)만 가능하지만 라벨 링크는 누구나 접속할 수
          있음으로, 만약 내부에서만 사용하시려면 내부 네트워크를 구성하여
          사용하시길 바랍니다.
          <b>프로젝트 상태</b>를 이용하여 진행사항을 파악할 수 있습니다.
        </p>
        <h3>어노테이션 데이터 다운로드</h3>
        <p>
          <b>프로젝트 수정</b>에 들어가시면 <b>배포용 Json 파일 다운로드</b>
          버튼이 있습니다. 해당 버튼을 이용해 어노테이션 데이터를 다운로드 할 수
          있습니다. 해당 파일은 ai hub에 올라간 파일 형태에서 crop된 이미지만
          제외된 형태이며, 다른 시스템을 이용해 이미지를 크롭할 수 있습니다.
        </p>
      </Menubar>
    );
  }
}
