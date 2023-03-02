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
        category {
          id
          createdAt
          updatedAt
          owner
        }
        tags {
          nextToken
        }
        type
        createdAt
        updatedAt
        categoryArticlesId
        owner
      }
      tag {
        id
        articles {
          nextToken
        }
        createdAt
        updatedAt
        owner
      }
      createdAt
      updatedAt
      owner
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
        category {
          id
          createdAt
          updatedAt
          owner
        }
        tags {
          nextToken
        }
        type
        createdAt
        updatedAt
        categoryArticlesId
        owner
      }
      tag {
        id
        articles {
          nextToken
        }
        createdAt
        updatedAt
        owner
      }
      createdAt
      updatedAt
      owner
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
        category {
          id
          createdAt
          updatedAt
          owner
        }
        tags {
          nextToken
        }
        type
        createdAt
        updatedAt
        categoryArticlesId
        owner
      }
      tag {
        id
        articles {
          nextToken
        }
        createdAt
        updatedAt
        owner
      }
      createdAt
      updatedAt
      owner
    }
  }
`;
