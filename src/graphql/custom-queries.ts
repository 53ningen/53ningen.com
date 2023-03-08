export const listSlugs = /* GraphQL */ `
  query listSlugs(
    $filter: ModelArticleFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listArticles(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        slug
      }
      nextToken
    }
  }
`

export const getSlugPageProps = /* GraphQL */ `
  query GetSlugPageProps($slug: ID!) {
    getArticle(slug: $slug) {
      slug
      title
      body
      description
      category {
        id
      }
      tags {
        items {
          tagID
        }
        nextToken
      }
      type
      createdAt
      updatedAt
      pinned
      categoryArticlesId
      owner
    }
  }
`

export const getEditPageProps = /* GraphQL */ `
  query GetEditPageProps($slug: ID!) {
    getArticle(slug: $slug) {
      slug
      title
      body
      description
      category {
        id
      }
      tags {
        items {
          id
          tagID
        }
        nextToken
      }
      type
      createdAt
      updatedAt
      pinned
      categoryArticlesId
      owner
    }
    listCategories {
      items {
        id
      }
    }
  }
`

export const listCategoryIds = /* GraphQL */ `
  query ListCategoryIds(
    $filter: ModelCategoryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCategories(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
      }
      nextToken
    }
  }
`

export const listTagIds = /* GraphQL */ `
  query ListTagIds($filter: ModelTagFilterInput, $limit: Int, $nextToken: String) {
    listTags(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
      }
      nextToken
    }
  }
`

export const listArticleMetadata = /* GraphQL */ `
  query ListArticleMetadata(
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelArticleFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listArticlesOrderByCreatedAt(
      type: "Article"
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        slug
        title
        description
        pinned
        category {
          id
        }
        tags {
          items {
            tagID
          }
          nextToken
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`

export const saveArticle = /* GraphQL */ `
  mutation SaveArticle(
    $input: UpdateArticleInput!
    $condition: ModelArticleConditionInput
  ) {
    updateArticle(input: $input, condition: $condition) {
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
        items {
          id
          articleID
          tagID
          createdAt
          updatedAt
          owner
        }
        nextToken
      }
      type
      createdAt
      updatedAt
      categoryArticlesId
      owner
    }
  }
`
