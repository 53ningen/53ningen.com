/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateArticleTags = /* GraphQL */ `
  subscription OnCreateArticleTags(
    $filter: ModelSubscriptionArticleTagsFilterInput
    $owner: String
  ) {
    onCreateArticleTags(filter: $filter, owner: $owner) {
      id
      articleID
      tagID
      article {
        slug
        title
        body
        description
        pinned
        draft
        category {
          id
          createdAt
          updatedAt
          owner
          __typename
        }
        tags {
          nextToken
          __typename
        }
        type
        createdAt
        updatedAt
        categoryArticlesId
        owner
        __typename
      }
      tag {
        id
        articles {
          nextToken
          __typename
        }
        createdAt
        updatedAt
        owner
        __typename
      }
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const onUpdateArticleTags = /* GraphQL */ `
  subscription OnUpdateArticleTags(
    $filter: ModelSubscriptionArticleTagsFilterInput
    $owner: String
  ) {
    onUpdateArticleTags(filter: $filter, owner: $owner) {
      id
      articleID
      tagID
      article {
        slug
        title
        body
        description
        pinned
        draft
        category {
          id
          createdAt
          updatedAt
          owner
          __typename
        }
        tags {
          nextToken
          __typename
        }
        type
        createdAt
        updatedAt
        categoryArticlesId
        owner
        __typename
      }
      tag {
        id
        articles {
          nextToken
          __typename
        }
        createdAt
        updatedAt
        owner
        __typename
      }
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const onDeleteArticleTags = /* GraphQL */ `
  subscription OnDeleteArticleTags(
    $filter: ModelSubscriptionArticleTagsFilterInput
    $owner: String
  ) {
    onDeleteArticleTags(filter: $filter, owner: $owner) {
      id
      articleID
      tagID
      article {
        slug
        title
        body
        description
        pinned
        draft
        category {
          id
          createdAt
          updatedAt
          owner
          __typename
        }
        tags {
          nextToken
          __typename
        }
        type
        createdAt
        updatedAt
        categoryArticlesId
        owner
        __typename
      }
      tag {
        id
        articles {
          nextToken
          __typename
        }
        createdAt
        updatedAt
        owner
        __typename
      }
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
