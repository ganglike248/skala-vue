# skala-vue

# 과제

- 배운 것 정리
- 커스터마이즈 한 것 정리

# day1

## 파일 구조

- index.html: 앱 진입점, 브라우저가 최초로 읽는 단 하나의 HTML
- main.js: 뷰 어플리케이션을 초기화하고 구성하는 역할
- App.vue: 루트 컴포넌트
  - HelloWorld처럼 PascalCase로 작성

## 뷰의 3단 구조(SFC)

- script setup
- template
- style

## 반응형 데이터

- 그냥 선언한 변수는 화면이 새로고침 되어야만 반영됨
- ref(): 반응형 변수, 값이 바뀌면 바로 반영됨
- 버튼을 누르면 화면을 새로 고침함 -> 일반 변수(ref로 감싸지 않은 변수)도 같이 반영

## Vue Directive

- 'v-'접두사가 붙은 특수한 HTML 속성
- v-bind: Elements의 Attributes에 표현식(변수, 함수, 객체 등)을 동적 바인딩(:)
- v-model: 폼 입력'input'과 vue 인스턴스 데이터 간에 양방향 데이터 바인딩(인풋 값 할당)
- v-on: 클릭 또는 키 입력과 같은 사용자 이벤트에 응답하고자 지정 메서드 실행(@)

### v-bind

- HTML 태그 내부의 Attribute에 js 값을 동적으로 연결(binding)하는 지시자
- 실무에서는 앞에 콜론(:) 기호만 남김
- :href="URL"처럼 변수를 사용함(URL은 변수)
- class 바인딩
  - 값의 true/false에 따라 적용되는 스타일이 다름

### v-for, if

- 일반적인 사용법 동일

### v-show

- v-show가 붙은 해당 태그를 보여줄지 말지 결정

# day2

### v-pre

- 아무런 연산(해석)없이 그대로 출력

### v-cloak

- vue가 로딩되기 전까지 해당 구역을 물리적으로 숨김

### v-once

- 해당 요소와 하위 요소는 최초에 한 번만 반응형으로 렌더링
- 데이터가 변경되어도 DOM 갱신 X

### v-memo

- 지정한 조건(변수)이 바뀔 때만 태그 내부 업대이트
- 아니면 이전에 그린 화면(캐시) 그대로 재사용
