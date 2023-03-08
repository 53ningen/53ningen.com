/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type ModelArticleFilterInput = {
  slug?: ModelIDInput | null,
  title?: ModelStringInput | null,
  body?: ModelStringInput | null,
  description?: ModelStringInput | null,
  pinned?: ModelBooleanInput | null,
  type?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelArticleFilterInput | null > | null,
  or?: Array< ModelArticleFilterInput | null > | null,
  not?: ModelArticleFilterInput | null,
  categoryArticlesId?: ModelIDInput | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type ModelBooleanInput = {
  ne?: boolean | null,
  eq?: boolean | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export enum ModelSortDirection {
  ASC = "ASC",
  DESC = "DESC",
}


export type ModelArticleConnection = {
  __typename: "ModelArticleConnection",
  items:  Array<Article | null >,
  nextToken?: string | null,
};

export type Article = {
  __typename: "Article",
  slug: string,
  title: string,
  body: string,
  description?: string | null,
  pinned: boolean,
  category: Category,
  tags?: ModelArticleTagsConnection | null,
  type: string,
  createdAt: string,
  updatedAt: string,
  categoryArticlesId?: string | null,
  owner?: string | null,
};

export type Category = {
  __typename: "Category",
  id: string,
  articles?: ModelArticleConnection | null,
  createdAt: string,
  updatedAt: string,
  owner?: string | null,
};

export type ModelArticleTagsConnection = {
  __typename: "ModelArticleTagsConnection",
  items:  Array<ArticleTags | null >,
  nextToken?: string | null,
};

export type ArticleTags = {
  __typename: "ArticleTags",
  id: string,
  articleID: string,
  tagID: string,
  article: Article,
  tag: Tag,
  createdAt: string,
  updatedAt: string,
  owner?: string | null,
};

export type Tag = {
  __typename: "Tag",
  id: string,
  articles?: ModelArticleTagsConnection | null,
  createdAt: string,
  updatedAt: string,
  owner?: string | null,
};

export type ModelCategoryConnection = {
  __typename: "ModelCategoryConnection",
  items:  Array<Category | null >,
  nextToken?: string | null,
};

export type ModelCategoryFilterInput = {
  id?: ModelIDInput | null,
  and?: Array< ModelCategoryFilterInput | null > | null,
  or?: Array< ModelCategoryFilterInput | null > | null,
  not?: ModelCategoryFilterInput | null,
};

export type ModelTagFilterInput = {
  id?: ModelIDInput | null,
  and?: Array< ModelTagFilterInput | null > | null,
  or?: Array< ModelTagFilterInput | null > | null,
  not?: ModelTagFilterInput | null,
};

export type ModelTagConnection = {
  __typename: "ModelTagConnection",
  items:  Array<Tag | null >,
  nextToken?: string | null,
};

export type ModelStringKeyConditionInput = {
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
};

export type UpdateArticleInput = {
  slug: string,
  title?: string | null,
  body?: string | null,
  description?: string | null,
  pinned?: boolean | null,
  type?: string | null,
  createdAt?: string | null,
  updatedAt?: string | null,
  categoryArticlesId?: string | null,
};

export type ModelArticleConditionInput = {
  title?: ModelStringInput | null,
  body?: ModelStringInput | null,
  description?: ModelStringInput | null,
  pinned?: ModelBooleanInput | null,
  type?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelArticleConditionInput | null > | null,
  or?: Array< ModelArticleConditionInput | null > | null,
  not?: ModelArticleConditionInput | null,
  categoryArticlesId?: ModelIDInput | null,
};

export type CreateArticleInput = {
  slug: string,
  title: string,
  body: string,
  description?: string | null,
  pinned: boolean,
  type: string,
  createdAt?: string | null,
  updatedAt?: string | null,
  categoryArticlesId?: string | null,
};

export type DeleteArticleInput = {
  slug: string,
};

export type CreateCategoryInput = {
  id?: string | null,
};

export type ModelCategoryConditionInput = {
  and?: Array< ModelCategoryConditionInput | null > | null,
  or?: Array< ModelCategoryConditionInput | null > | null,
  not?: ModelCategoryConditionInput | null,
};

export type UpdateCategoryInput = {
  id: string,
};

export type DeleteCategoryInput = {
  id: string,
};

export type CreateTagInput = {
  id?: string | null,
};

export type ModelTagConditionInput = {
  and?: Array< ModelTagConditionInput | null > | null,
  or?: Array< ModelTagConditionInput | null > | null,
  not?: ModelTagConditionInput | null,
};

export type UpdateTagInput = {
  id: string,
};

export type DeleteTagInput = {
  id: string,
};

export type CreateArticleTagsInput = {
  id?: string | null,
  articleID: string,
  tagID: string,
};

export type ModelArticleTagsConditionInput = {
  articleID?: ModelIDInput | null,
  tagID?: ModelIDInput | null,
  and?: Array< ModelArticleTagsConditionInput | null > | null,
  or?: Array< ModelArticleTagsConditionInput | null > | null,
  not?: ModelArticleTagsConditionInput | null,
};

export type UpdateArticleTagsInput = {
  id: string,
  articleID?: string | null,
  tagID?: string | null,
};

export type DeleteArticleTagsInput = {
  id: string,
};

export type ModelArticleTagsFilterInput = {
  id?: ModelIDInput | null,
  articleID?: ModelIDInput | null,
  tagID?: ModelIDInput | null,
  and?: Array< ModelArticleTagsFilterInput | null > | null,
  or?: Array< ModelArticleTagsFilterInput | null > | null,
  not?: ModelArticleTagsFilterInput | null,
};

export type ModelSubscriptionArticleTagsFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  articleID?: ModelSubscriptionIDInput | null,
  tagID?: ModelSubscriptionIDInput | null,
  and?: Array< ModelSubscriptionArticleTagsFilterInput | null > | null,
  or?: Array< ModelSubscriptionArticleTagsFilterInput | null > | null,
};

export type ModelSubscriptionIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type listSlugsQueryVariables = {
  filter?: ModelArticleFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type listSlugsQuery = {
  listArticles?:  {
    __typename: "ModelArticleConnection",
    items:  Array< {
      __typename: "Article",
      slug: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetSlugPagePropsQueryVariables = {
  slug: string,
};

export type GetSlugPagePropsQuery = {
  getArticle?:  {
    __typename: "Article",
    slug: string,
    title: string,
    body: string,
    description?: string | null,
    category:  {
      __typename: "Category",
      id: string,
    },
    tags?:  {
      __typename: "ModelArticleTagsConnection",
      items:  Array< {
        __typename: "ArticleTags",
        tagID: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    type: string,
    createdAt: string,
    updatedAt: string,
    pinned: boolean,
    categoryArticlesId?: string | null,
    owner?: string | null,
  } | null,
};

export type GetEditPagePropsQueryVariables = {
  slug: string,
};

export type GetEditPagePropsQuery = {
  getArticle?:  {
    __typename: "Article",
    slug: string,
    title: string,
    body: string,
    description?: string | null,
    category:  {
      __typename: "Category",
      id: string,
    },
    tags?:  {
      __typename: "ModelArticleTagsConnection",
      items:  Array< {
        __typename: "ArticleTags",
        id: string,
        tagID: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    type: string,
    createdAt: string,
    updatedAt: string,
    pinned: boolean,
    categoryArticlesId?: string | null,
    owner?: string | null,
  } | null,
  listCategories?:  {
    __typename: "ModelCategoryConnection",
    items:  Array< {
      __typename: "Category",
      id: string,
    } | null >,
  } | null,
};

export type ListCategoryIdsQueryVariables = {
  filter?: ModelCategoryFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListCategoryIdsQuery = {
  listCategories?:  {
    __typename: "ModelCategoryConnection",
    items:  Array< {
      __typename: "Category",
      id: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListTagIdsQueryVariables = {
  filter?: ModelTagFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListTagIdsQuery = {
  listTags?:  {
    __typename: "ModelTagConnection",
    items:  Array< {
      __typename: "Tag",
      id: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListArticleMetadataQueryVariables = {
  createdAt?: ModelStringKeyConditionInput | null,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelArticleFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListArticleMetadataQuery = {
  listArticlesOrderByCreatedAt?:  {
    __typename: "ModelArticleConnection",
    items:  Array< {
      __typename: "Article",
      slug: string,
      title: string,
      description?: string | null,
      pinned: boolean,
      category:  {
        __typename: "Category",
        id: string,
      },
      tags?:  {
        __typename: "ModelArticleTagsConnection",
        items:  Array< {
          __typename: "ArticleTags",
          tagID: string,
        } | null >,
        nextToken?: string | null,
      } | null,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type SaveArticleMutationVariables = {
  input: UpdateArticleInput,
  condition?: ModelArticleConditionInput | null,
};

export type SaveArticleMutation = {
  updateArticle?:  {
    __typename: "Article",
    slug: string,
    title: string,
    body: string,
    description?: string | null,
    pinned: boolean,
    category:  {
      __typename: "Category",
      id: string,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    },
    tags?:  {
      __typename: "ModelArticleTagsConnection",
      items:  Array< {
        __typename: "ArticleTags",
        id: string,
        articleID: string,
        tagID: string,
        createdAt: string,
        updatedAt: string,
        owner?: string | null,
      } | null >,
      nextToken?: string | null,
    } | null,
    type: string,
    createdAt: string,
    updatedAt: string,
    categoryArticlesId?: string | null,
    owner?: string | null,
  } | null,
};

export type CreateArticleMutationVariables = {
  input: CreateArticleInput,
  condition?: ModelArticleConditionInput | null,
};

export type CreateArticleMutation = {
  createArticle?:  {
    __typename: "Article",
    slug: string,
    title: string,
    body: string,
    description?: string | null,
    pinned: boolean,
    category:  {
      __typename: "Category",
      id: string,
      articles?:  {
        __typename: "ModelArticleConnection",
        nextToken?: string | null,
      } | null,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    },
    tags?:  {
      __typename: "ModelArticleTagsConnection",
      items:  Array< {
        __typename: "ArticleTags",
        id: string,
        articleID: string,
        tagID: string,
        createdAt: string,
        updatedAt: string,
        owner?: string | null,
      } | null >,
      nextToken?: string | null,
    } | null,
    type: string,
    createdAt: string,
    updatedAt: string,
    categoryArticlesId?: string | null,
    owner?: string | null,
  } | null,
};

export type UpdateArticleMutationVariables = {
  input: UpdateArticleInput,
  condition?: ModelArticleConditionInput | null,
};

export type UpdateArticleMutation = {
  updateArticle?:  {
    __typename: "Article",
    slug: string,
    title: string,
    body: string,
    description?: string | null,
    pinned: boolean,
    category:  {
      __typename: "Category",
      id: string,
      articles?:  {
        __typename: "ModelArticleConnection",
        nextToken?: string | null,
      } | null,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    },
    tags?:  {
      __typename: "ModelArticleTagsConnection",
      items:  Array< {
        __typename: "ArticleTags",
        id: string,
        articleID: string,
        tagID: string,
        createdAt: string,
        updatedAt: string,
        owner?: string | null,
      } | null >,
      nextToken?: string | null,
    } | null,
    type: string,
    createdAt: string,
    updatedAt: string,
    categoryArticlesId?: string | null,
    owner?: string | null,
  } | null,
};

export type DeleteArticleMutationVariables = {
  input: DeleteArticleInput,
  condition?: ModelArticleConditionInput | null,
};

export type DeleteArticleMutation = {
  deleteArticle?:  {
    __typename: "Article",
    slug: string,
    title: string,
    body: string,
    description?: string | null,
    pinned: boolean,
    category:  {
      __typename: "Category",
      id: string,
      articles?:  {
        __typename: "ModelArticleConnection",
        nextToken?: string | null,
      } | null,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    },
    tags?:  {
      __typename: "ModelArticleTagsConnection",
      items:  Array< {
        __typename: "ArticleTags",
        id: string,
        articleID: string,
        tagID: string,
        createdAt: string,
        updatedAt: string,
        owner?: string | null,
      } | null >,
      nextToken?: string | null,
    } | null,
    type: string,
    createdAt: string,
    updatedAt: string,
    categoryArticlesId?: string | null,
    owner?: string | null,
  } | null,
};

export type CreateCategoryMutationVariables = {
  input: CreateCategoryInput,
  condition?: ModelCategoryConditionInput | null,
};

export type CreateCategoryMutation = {
  createCategory?:  {
    __typename: "Category",
    id: string,
    articles?:  {
      __typename: "ModelArticleConnection",
      items:  Array< {
        __typename: "Article",
        slug: string,
        title: string,
        body: string,
        description?: string | null,
        pinned: boolean,
        type: string,
        createdAt: string,
        updatedAt: string,
        categoryArticlesId?: string | null,
        owner?: string | null,
      } | null >,
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type UpdateCategoryMutationVariables = {
  input: UpdateCategoryInput,
  condition?: ModelCategoryConditionInput | null,
};

export type UpdateCategoryMutation = {
  updateCategory?:  {
    __typename: "Category",
    id: string,
    articles?:  {
      __typename: "ModelArticleConnection",
      items:  Array< {
        __typename: "Article",
        slug: string,
        title: string,
        body: string,
        description?: string | null,
        pinned: boolean,
        type: string,
        createdAt: string,
        updatedAt: string,
        categoryArticlesId?: string | null,
        owner?: string | null,
      } | null >,
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type DeleteCategoryMutationVariables = {
  input: DeleteCategoryInput,
  condition?: ModelCategoryConditionInput | null,
};

export type DeleteCategoryMutation = {
  deleteCategory?:  {
    __typename: "Category",
    id: string,
    articles?:  {
      __typename: "ModelArticleConnection",
      items:  Array< {
        __typename: "Article",
        slug: string,
        title: string,
        body: string,
        description?: string | null,
        pinned: boolean,
        type: string,
        createdAt: string,
        updatedAt: string,
        categoryArticlesId?: string | null,
        owner?: string | null,
      } | null >,
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type CreateTagMutationVariables = {
  input: CreateTagInput,
  condition?: ModelTagConditionInput | null,
};

export type CreateTagMutation = {
  createTag?:  {
    __typename: "Tag",
    id: string,
    articles?:  {
      __typename: "ModelArticleTagsConnection",
      items:  Array< {
        __typename: "ArticleTags",
        id: string,
        articleID: string,
        tagID: string,
        createdAt: string,
        updatedAt: string,
        owner?: string | null,
      } | null >,
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type UpdateTagMutationVariables = {
  input: UpdateTagInput,
  condition?: ModelTagConditionInput | null,
};

export type UpdateTagMutation = {
  updateTag?:  {
    __typename: "Tag",
    id: string,
    articles?:  {
      __typename: "ModelArticleTagsConnection",
      items:  Array< {
        __typename: "ArticleTags",
        id: string,
        articleID: string,
        tagID: string,
        createdAt: string,
        updatedAt: string,
        owner?: string | null,
      } | null >,
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type DeleteTagMutationVariables = {
  input: DeleteTagInput,
  condition?: ModelTagConditionInput | null,
};

export type DeleteTagMutation = {
  deleteTag?:  {
    __typename: "Tag",
    id: string,
    articles?:  {
      __typename: "ModelArticleTagsConnection",
      items:  Array< {
        __typename: "ArticleTags",
        id: string,
        articleID: string,
        tagID: string,
        createdAt: string,
        updatedAt: string,
        owner?: string | null,
      } | null >,
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type CreateArticleTagsMutationVariables = {
  input: CreateArticleTagsInput,
  condition?: ModelArticleTagsConditionInput | null,
};

export type CreateArticleTagsMutation = {
  createArticleTags?:  {
    __typename: "ArticleTags",
    id: string,
    articleID: string,
    tagID: string,
    article:  {
      __typename: "Article",
      slug: string,
      title: string,
      body: string,
      description?: string | null,
      pinned: boolean,
      category:  {
        __typename: "Category",
        id: string,
        createdAt: string,
        updatedAt: string,
        owner?: string | null,
      },
      tags?:  {
        __typename: "ModelArticleTagsConnection",
        nextToken?: string | null,
      } | null,
      type: string,
      createdAt: string,
      updatedAt: string,
      categoryArticlesId?: string | null,
      owner?: string | null,
    },
    tag:  {
      __typename: "Tag",
      id: string,
      articles?:  {
        __typename: "ModelArticleTagsConnection",
        nextToken?: string | null,
      } | null,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    },
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type UpdateArticleTagsMutationVariables = {
  input: UpdateArticleTagsInput,
  condition?: ModelArticleTagsConditionInput | null,
};

export type UpdateArticleTagsMutation = {
  updateArticleTags?:  {
    __typename: "ArticleTags",
    id: string,
    articleID: string,
    tagID: string,
    article:  {
      __typename: "Article",
      slug: string,
      title: string,
      body: string,
      description?: string | null,
      pinned: boolean,
      category:  {
        __typename: "Category",
        id: string,
        createdAt: string,
        updatedAt: string,
        owner?: string | null,
      },
      tags?:  {
        __typename: "ModelArticleTagsConnection",
        nextToken?: string | null,
      } | null,
      type: string,
      createdAt: string,
      updatedAt: string,
      categoryArticlesId?: string | null,
      owner?: string | null,
    },
    tag:  {
      __typename: "Tag",
      id: string,
      articles?:  {
        __typename: "ModelArticleTagsConnection",
        nextToken?: string | null,
      } | null,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    },
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type DeleteArticleTagsMutationVariables = {
  input: DeleteArticleTagsInput,
  condition?: ModelArticleTagsConditionInput | null,
};

export type DeleteArticleTagsMutation = {
  deleteArticleTags?:  {
    __typename: "ArticleTags",
    id: string,
    articleID: string,
    tagID: string,
    article:  {
      __typename: "Article",
      slug: string,
      title: string,
      body: string,
      description?: string | null,
      pinned: boolean,
      category:  {
        __typename: "Category",
        id: string,
        createdAt: string,
        updatedAt: string,
        owner?: string | null,
      },
      tags?:  {
        __typename: "ModelArticleTagsConnection",
        nextToken?: string | null,
      } | null,
      type: string,
      createdAt: string,
      updatedAt: string,
      categoryArticlesId?: string | null,
      owner?: string | null,
    },
    tag:  {
      __typename: "Tag",
      id: string,
      articles?:  {
        __typename: "ModelArticleTagsConnection",
        nextToken?: string | null,
      } | null,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    },
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type GetArticleQueryVariables = {
  slug: string,
};

export type GetArticleQuery = {
  getArticle?:  {
    __typename: "Article",
    slug: string,
    title: string,
    body: string,
    description?: string | null,
    pinned: boolean,
    category:  {
      __typename: "Category",
      id: string,
      articles?:  {
        __typename: "ModelArticleConnection",
        nextToken?: string | null,
      } | null,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    },
    tags?:  {
      __typename: "ModelArticleTagsConnection",
      items:  Array< {
        __typename: "ArticleTags",
        id: string,
        articleID: string,
        tagID: string,
        createdAt: string,
        updatedAt: string,
        owner?: string | null,
      } | null >,
      nextToken?: string | null,
    } | null,
    type: string,
    createdAt: string,
    updatedAt: string,
    categoryArticlesId?: string | null,
    owner?: string | null,
  } | null,
};

export type ListArticlesQueryVariables = {
  slug?: string | null,
  filter?: ModelArticleFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListArticlesQuery = {
  listArticles?:  {
    __typename: "ModelArticleConnection",
    items:  Array< {
      __typename: "Article",
      slug: string,
      title: string,
      body: string,
      description?: string | null,
      pinned: boolean,
      category:  {
        __typename: "Category",
        id: string,
        createdAt: string,
        updatedAt: string,
        owner?: string | null,
      },
      tags?:  {
        __typename: "ModelArticleTagsConnection",
        nextToken?: string | null,
      } | null,
      type: string,
      createdAt: string,
      updatedAt: string,
      categoryArticlesId?: string | null,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListArticlesOrderByCreatedAtQueryVariables = {
  type: string,
  createdAt?: ModelStringKeyConditionInput | null,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelArticleFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListArticlesOrderByCreatedAtQuery = {
  listArticlesOrderByCreatedAt?:  {
    __typename: "ModelArticleConnection",
    items:  Array< {
      __typename: "Article",
      slug: string,
      title: string,
      body: string,
      description?: string | null,
      pinned: boolean,
      category:  {
        __typename: "Category",
        id: string,
        createdAt: string,
        updatedAt: string,
        owner?: string | null,
      },
      tags?:  {
        __typename: "ModelArticleTagsConnection",
        nextToken?: string | null,
      } | null,
      type: string,
      createdAt: string,
      updatedAt: string,
      categoryArticlesId?: string | null,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetCategoryQueryVariables = {
  id: string,
};

export type GetCategoryQuery = {
  getCategory?:  {
    __typename: "Category",
    id: string,
    articles?:  {
      __typename: "ModelArticleConnection",
      items:  Array< {
        __typename: "Article",
        slug: string,
        title: string,
        body: string,
        description?: string | null,
        pinned: boolean,
        type: string,
        createdAt: string,
        updatedAt: string,
        categoryArticlesId?: string | null,
        owner?: string | null,
      } | null >,
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type ListCategoriesQueryVariables = {
  filter?: ModelCategoryFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListCategoriesQuery = {
  listCategories?:  {
    __typename: "ModelCategoryConnection",
    items:  Array< {
      __typename: "Category",
      id: string,
      articles?:  {
        __typename: "ModelArticleConnection",
        nextToken?: string | null,
      } | null,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetTagQueryVariables = {
  id: string,
};

export type GetTagQuery = {
  getTag?:  {
    __typename: "Tag",
    id: string,
    articles?:  {
      __typename: "ModelArticleTagsConnection",
      items:  Array< {
        __typename: "ArticleTags",
        id: string,
        articleID: string,
        tagID: string,
        createdAt: string,
        updatedAt: string,
        owner?: string | null,
      } | null >,
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type ListTagsQueryVariables = {
  filter?: ModelTagFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListTagsQuery = {
  listTags?:  {
    __typename: "ModelTagConnection",
    items:  Array< {
      __typename: "Tag",
      id: string,
      articles?:  {
        __typename: "ModelArticleTagsConnection",
        nextToken?: string | null,
      } | null,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetArticleTagsQueryVariables = {
  id: string,
};

export type GetArticleTagsQuery = {
  getArticleTags?:  {
    __typename: "ArticleTags",
    id: string,
    articleID: string,
    tagID: string,
    article:  {
      __typename: "Article",
      slug: string,
      title: string,
      body: string,
      description?: string | null,
      pinned: boolean,
      category:  {
        __typename: "Category",
        id: string,
        createdAt: string,
        updatedAt: string,
        owner?: string | null,
      },
      tags?:  {
        __typename: "ModelArticleTagsConnection",
        nextToken?: string | null,
      } | null,
      type: string,
      createdAt: string,
      updatedAt: string,
      categoryArticlesId?: string | null,
      owner?: string | null,
    },
    tag:  {
      __typename: "Tag",
      id: string,
      articles?:  {
        __typename: "ModelArticleTagsConnection",
        nextToken?: string | null,
      } | null,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    },
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type ListArticleTagsQueryVariables = {
  filter?: ModelArticleTagsFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListArticleTagsQuery = {
  listArticleTags?:  {
    __typename: "ModelArticleTagsConnection",
    items:  Array< {
      __typename: "ArticleTags",
      id: string,
      articleID: string,
      tagID: string,
      article:  {
        __typename: "Article",
        slug: string,
        title: string,
        body: string,
        description?: string | null,
        pinned: boolean,
        type: string,
        createdAt: string,
        updatedAt: string,
        categoryArticlesId?: string | null,
        owner?: string | null,
      },
      tag:  {
        __typename: "Tag",
        id: string,
        createdAt: string,
        updatedAt: string,
        owner?: string | null,
      },
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type OnCreateArticleTagsSubscriptionVariables = {
  filter?: ModelSubscriptionArticleTagsFilterInput | null,
  owner?: string | null,
};

export type OnCreateArticleTagsSubscription = {
  onCreateArticleTags?:  {
    __typename: "ArticleTags",
    id: string,
    articleID: string,
    tagID: string,
    article:  {
      __typename: "Article",
      slug: string,
      title: string,
      body: string,
      description?: string | null,
      pinned: boolean,
      category:  {
        __typename: "Category",
        id: string,
        createdAt: string,
        updatedAt: string,
        owner?: string | null,
      },
      tags?:  {
        __typename: "ModelArticleTagsConnection",
        nextToken?: string | null,
      } | null,
      type: string,
      createdAt: string,
      updatedAt: string,
      categoryArticlesId?: string | null,
      owner?: string | null,
    },
    tag:  {
      __typename: "Tag",
      id: string,
      articles?:  {
        __typename: "ModelArticleTagsConnection",
        nextToken?: string | null,
      } | null,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    },
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnUpdateArticleTagsSubscriptionVariables = {
  filter?: ModelSubscriptionArticleTagsFilterInput | null,
  owner?: string | null,
};

export type OnUpdateArticleTagsSubscription = {
  onUpdateArticleTags?:  {
    __typename: "ArticleTags",
    id: string,
    articleID: string,
    tagID: string,
    article:  {
      __typename: "Article",
      slug: string,
      title: string,
      body: string,
      description?: string | null,
      pinned: boolean,
      category:  {
        __typename: "Category",
        id: string,
        createdAt: string,
        updatedAt: string,
        owner?: string | null,
      },
      tags?:  {
        __typename: "ModelArticleTagsConnection",
        nextToken?: string | null,
      } | null,
      type: string,
      createdAt: string,
      updatedAt: string,
      categoryArticlesId?: string | null,
      owner?: string | null,
    },
    tag:  {
      __typename: "Tag",
      id: string,
      articles?:  {
        __typename: "ModelArticleTagsConnection",
        nextToken?: string | null,
      } | null,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    },
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnDeleteArticleTagsSubscriptionVariables = {
  filter?: ModelSubscriptionArticleTagsFilterInput | null,
  owner?: string | null,
};

export type OnDeleteArticleTagsSubscription = {
  onDeleteArticleTags?:  {
    __typename: "ArticleTags",
    id: string,
    articleID: string,
    tagID: string,
    article:  {
      __typename: "Article",
      slug: string,
      title: string,
      body: string,
      description?: string | null,
      pinned: boolean,
      category:  {
        __typename: "Category",
        id: string,
        createdAt: string,
        updatedAt: string,
        owner?: string | null,
      },
      tags?:  {
        __typename: "ModelArticleTagsConnection",
        nextToken?: string | null,
      } | null,
      type: string,
      createdAt: string,
      updatedAt: string,
      categoryArticlesId?: string | null,
      owner?: string | null,
    },
    tag:  {
      __typename: "Tag",
      id: string,
      articles?:  {
        __typename: "ModelArticleTagsConnection",
        nextToken?: string | null,
      } | null,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    },
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};
