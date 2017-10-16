# robin openapi
Open API server application for Robin Service.


# Environment (환경)
개발 및 실행 환경에 대해서 설명.

- NodeJS + Express
- DynamoDB


# Installation (설치)
개발 환경 설치 및 운영에 대한 설명서.


# Demo (데모)
실제 실행 환경의 데모. 


---

# Database Schema (디비 스키마)
데이터베이스용 테이블의 스키마 정의.

## items (기본 상품 테이블)
비교 상품군을 저장하는 테이블.

필드명 | 타입 | 설명
----|-----|----
id | string(64) | \<sid>\_\<pid>\_\<oid> 형태로 구성 <br> sid: shop-id <br> pid: product-id <br> oid: *option-id <br> shop-id는 쇼핑몰별 고유아이디로 네이버쇼핑일 경우 nv 이다.
name | string | 상품 이름
image | url | 상품 대표 이미지


## malls (메타 상품 테이블)
메타 상품을 저장하는 테이블.

필드명 | 타입 | 설명
----|-----|----
id | string(64) | \<sid>\_\<pid>\_\<oid> 형태로 구성.
name | string | 상품 이름
image | url | 상품 대표 이미지
price | number | 판매가
delivery | number | 배송비


# 

