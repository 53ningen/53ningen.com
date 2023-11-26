/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createDocument = /* GraphQL */ `
  mutation CreateDocument(
    $input: CreateDocumentInput!
    $condition: ModelDocumentConditionInput
  ) {
    createDocument(input: $input, condition: $condition) {
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
export const updateDocument = /* GraphQL */ `
  mutation UpdateDocument(
    $input: UpdateDocumentInput!
    $condition: ModelDocumentConditionInput
  ) {
    updateDocument(input: $input, condition: $condition) {
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
export const deleteDocument = /* GraphQL */ `
  mutation DeleteDocument(
    $input: DeleteDocumentInput!
    $condition: ModelDocumentConditionInput
  ) {
    deleteDocument(input: $input, condition: $condition) {
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
export const createArticle = /* GraphQL */ `
  mutation CreateArticle(
    $input: CreateArticleInput!
    $condition: ModelArticleConditionInput
  ) {
    createArticle(input: $input, condition: $condition) {
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
export const updateArticle = /* GraphQL */ `
  mutation UpdateArticle(
    $input: UpdateArticleInput!
    $condition: ModelArticleConditionInput
  ) {
    updateArticle(input: $input, condition: $condition) {
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
export const deleteArticle = /* GraphQL */ `
  mutation DeleteArticle(
    $input: DeleteArticleInput!
    $condition: ModelArticleConditionInput
  ) {
    deleteArticle(input: $input, condition: $condition) {
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
export const createCategory = /* GraphQL */ `
  mutation CreateCategory(
    $input: CreateCategoryInput!
    $condition: ModelCategoryConditionInput
  ) {
    createCategory(input: $input, condition: $condition) {
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
export const updateCategory = /* GraphQL */ `
  mutation UpdateCategory(
    $input: UpdateCategoryInput!
    $condition: ModelCategoryConditionInput
  ) {
    updateCategory(input: $input, condition: $condition) {
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
export const deleteCategory = /* GraphQL */ `
  mutation DeleteCategory(
    $input: DeleteCategoryInput!
    $condition: ModelCategoryConditionInput
  ) {
    deleteCategory(input: $input, condition: $condition) {
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
export const createTag = /* GraphQL */ `
  mutation CreateTag(
    $input: CreateTagInput!
    $condition: ModelTagConditionInput
  ) {
    createTag(input: $input, condition: $condition) {
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
export const updateTag = /* GraphQL */ `
  mutation UpdateTag(
    $input: UpdateTagInput!
    $condition: ModelTagConditionInput
  ) {
    updateTag(input: $input, condition: $condition) {
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
export const deleteTag = /* GraphQL */ `
  mutation DeleteTag(
    $input: DeleteTagInput!
    $condition: ModelTagConditionInput
  ) {
    deleteTag(input: $input, condition: $condition) {
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
export const createArticleTags = /* GraphQL */ `
  mutation CreateArticleTags(
    $input: CreateArticleTagsInput!
    $condition: ModelArticleTagsConditionInput
  ) {
    createArticleTags(input: $input, condition: $condition) {
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
export const updateArticleTags = /* GraphQL */ `
  mutation UpdateArticleTags(
    $input: UpdateArticleTagsInput!
    $condition: ModelArticleTagsConditionInput
  ) {
    updateArticleTags(input: $input, condition: $condition) {
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
export const deleteArticleTags = /* GraphQL */ `
  mutation DeleteArticleTags(
    $input: DeleteArticleTagsInput!
    $condition: ModelArticleTagsConditionInput
  ) {
    deleteArticleTags(input: $input, condition: $condition) {
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
