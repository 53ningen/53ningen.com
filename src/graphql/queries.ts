/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getDocument = /* GraphQL */ `
  query GetDocument($slug: ID!) {
    getDocument(slug: $slug) {
      slug
      title
      kana
      body
      type
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listDocuments = /* GraphQL */ `
  query ListDocuments(
    $slug: ID
    $filter: ModelDocumentFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listDocuments(
      slug: $slug
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        slug
        title
        kana
        body
        type
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const listDocumentsOrderByKana = /* GraphQL */ `
  query ListDocumentsOrderByKana(
    $type: String!
    $kana: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelDocumentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listDocumentsOrderByKana(
      type: $type
      kana: $kana
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        slug
        title
        kana
        body
        type
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getArticle = /* GraphQL */ `
  query GetArticle($slug: ID!) {
    getArticle(slug: $slug) {
      slug
      title
      body
      description
      pinned
      draft
      category {
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
      tags {
        items {
          id
          articleID
          tagID
          createdAt
          updatedAt
          owner
          __typename
        }
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
  }
`;
export const listArticles = /* GraphQL */ `
  query ListArticles(
    $slug: ID
    $filter: ModelArticleFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listArticles(
      slug: $slug
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const listArticlesOrderByCreatedAt = /* GraphQL */ `
  query ListArticlesOrderByCreatedAt(
    $type: String!
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelArticleFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listArticlesOrderByCreatedAt(
      type: $type
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getCategory = /* GraphQL */ `
  query GetCategory($id: ID!) {
    getCategory(id: $id) {
      id
      articles {
        items {
          slug
          title
          body
          description
          pinned
          draft
          type
          createdAt
          updatedAt
          categoryArticlesId
          owner
          __typename
        }
        nextToken
        __typename
      }
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listCategories = /* GraphQL */ `
  query ListCategories(
    $filter: ModelCategoryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCategories(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getTag = /* GraphQL */ `
  query GetTag($id: ID!) {
    getTag(id: $id) {
      id
      articles {
        items {
          id
          articleID
          tagID
          createdAt
          updatedAt
          owner
          __typename
        }
        nextToken
        __typename
      }
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listTags = /* GraphQL */ `
  query ListTags(
    $filter: ModelTagFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTags(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getArticleTags = /* GraphQL */ `
  query GetArticleTags($id: ID!) {
    getArticleTags(id: $id) {
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
export const listArticleTags = /* GraphQL */ `
  query ListArticleTags(
    $filter: ModelArticleTagsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listArticleTags(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
          type
          createdAt
          updatedAt
          categoryArticlesId
          owner
          __typename
        }
        tag {
          id
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
      nextToken
      __typename
    }
  }
`;
