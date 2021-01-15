## Domain

**키프리스 (kipris)**

- 키프리스에서 받은 데이터를 가공한 파일
- 비엔나코드, 출원번호, 이미지 링크가 있음
- 항상 고정된 입력값으로 사용됨

**비엔나 코드 (vienna code)**

- 비엔나 코드 세분류별 설명 파일
- 고정된 입력값으로 사용됨

**메타프로젝트 (Meta Project)**

- 비엔나 코드 세분류별 이미지 모음
- 아이디가 부과되지 않음
- 여러개의 프로젝트로 나누어 져야 함

**프로젝트 컬렉션 (Project Collection)**

- 비엔나 코드 세분류별 프로젝트 모음
- 경우에 따라 여개의 프로젝트가 포함될 수 있음
- 각 프로젝트의 아이디가 순서대로 부과됨
- 서버에 그대로 업로드 할 수 있음

**이미지 컬렉션 (Image Collection)**

- 프로젝트별 이미지 모음
- 서버에 그대로 업로드 할 수 있음

## 사용법

**0) input 파일 다운로드**

`{project_root}/output`아래에서 키프리스 데이터와 비엔나 코드 파일을 다운받고 압축을 풉니다.

```bash
curl https://www.dropbox.com/s/uu81shyl3yznbhd/kipris.zip\?dl\=0 -L -o kipris.zip
curl https://www.dropbox.com/s/pndkyopq5y2svvs/vienna.zip?dl=0 -L -o vienna.zip
unzip kipris.zip
unzip vienna.zip
```

**1) 메타프로젝트 만들기**

```bash
yarn dev src/createMetaProject.ts --kipris {상표데이터경로} --vienna {비엔나코드설명}  --outputDir {출력파일위치} --main{메인비엔나코드}

# 혹은 한번에 작업하려면
./generate_meta_project.sh
```

**2) 프로젝트 & 이미지 컬렉션 만들기**

```bash
yarn dev src/createCollection.ts  --metaproject {메타프로젝트경로} --size {프로젝트크기} --initialId {프로젝트시작아이디} --outputDir {파일디렉토리}

# 예시
yarn dev src/createCollection.ts  --metaproject $(pwd)/sample/meta_project_010101.json --size 2 --initialId 10 --outputDir $(pwd)/sample
```

TODO: 폴더에 있는 모든 파일에 대해 프로젝트 컬렉션과 이미지 컬렉션 생성 스크립트 만들기

**3) 프로젝트 업로드**

```bash
yarn dev src/uploadProject.ts --project {프로젝트컬렉션경로} --url {프로젝트업로드API_URL}

# 예시
yarn dev src/uploadProject.ts --project $(pwd)/sample/project_collection_010101.json --url "http://server:3002/api/projects"
```

**4) 이미지 업로드**
TODO: 이미지 업로드 하는 스크립트 추가

TODO: 모든 프로젝트 컬렉션과 거기에 해당하는 이미지 파일 업로드 스크립트 만들기

**5) 크롭된 이미지 생성 및 업로드 요청**

```bash
yarn dev src/requestImageCropTask.ts --annotaion $(pwd)/sample/4019780006191.json  --url "http://cropapi:5000/api/crop"
```
