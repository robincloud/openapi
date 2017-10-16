# Robin OpenAPI
Open API server application for Robin Service.


# Environment (환경)
The required Basic Development Environment (개발 및 실행 환경에 대해서 설명).

- NodeJS + Express : [설치 참고 문서](http://webframeworks.kr/getstarted/expressjs/).
- DynamoDB : [로컬 설치 참고 문서](http://docs.aws.amazon.com/ko_kr/amazondynamodb/latest/developerguide/DynamoDBLocal.html).


# Installation (설치)
How to install development server environment locally (개발 환경 설치 및 운영에 대한 설명서).


```bash
$ git clone https://github.com/robincloud/openapi
$ cd openapi
$ npm install
$ npm test
```


# Document (문서)
see [wiki](/robincloud/openapi/wiki) 


# Demo (데모)
실제 실행 환경의 데모. 


---

# Database Schema (디비 스키마)
데이터베이스용 테이블의 스키마 정의.

## items (기본 상품 테이블)
비교 상품군을 저장하는 테이블.

필드명   | 타입        | 설명
--------|-----------|----------
id      | string(64)| \<sid>\_\<pid>\_\<oid> 형태로 구성 <br> sid: shop-id 쇼핑몰별 고유아이디 (네이버쇼핑일 경우 nv)  <br> pid: product-id 제품 ID <br> oid: *option-id 옵션ID값으로 선택사항 <br> 자세한 내용은 [아래 참고](#TBD).
name    | string    | 상품 이름
option  | string    | 옵션 이름 (선택 사항. oid가 있을 경우)
image   | url       | 상품 대표 이미지
malls   | array     | 연관된 메타 상품의 리스트로, malls.id 를 리스트로 저장함.
refId   | string    | 참조되는 items.id의 연결 값.
*cat    | string    | 카테고리
*maker  | string    | 제조사
*brand  | string    | 브랜드.

 \* 필수 항목이 아닌 선택 입력 사항.


## malls (메타 상품 테이블)
메타 상품을 저장하는 테이블.

필드명    | 타입       | 설명
--------|-----------|----------
id      | string(64)| \<sid>\_\<pid>\_\<oid> 형태로 구성.
name    | string    | 상품 판매 이름
option  | string    | 옵션 이름 (선택 사항. oid가 있을 경우)
image   | url       | 상품 판매 대표 이미지
price   | number    | 판매가
delivery | number   | 배송비
invalid | boolean   | 판매 여부.


# TBD


