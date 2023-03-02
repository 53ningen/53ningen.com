import { Amplify } from 'aws-amplify'
import { addArticle, addCategory, addTag } from './graphql'
import { fetchAllArticles, fetchAllCategories, fetchAllTags } from './markdown'

const config = {
  aws_appsync_graphqlEndpoint: 'http://192.168.2.113:20002/graphql',
  aws_appsync_region: 'ap-northeast-1',
  aws_appsync_authenticationType: 'API_KEY',
  aws_appsync_apiKey: 'da2-fakeApiId123456',
  aws_appsync_dangerously_connect_to_http_endpoint_for_testing: true,
}

Amplify.configure(config)

const main = async () => {
  const categories = await fetchAllCategories()
  for (const category of categories) {
    await addCategory(category)
  }
  const tags = await fetchAllTags()
  for (const tag of tags) {
    await addTag(tag)
  }
  const articles = await fetchAllArticles()
  for (const article of articles) {
    await addArticle(article)
  }
}

main()
