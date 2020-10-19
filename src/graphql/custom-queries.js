export const listItems = /* GraphQL */ `
  query ListItems(
    $filter: ModelItemFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listItems(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        description
        url
        createdBy
        createdAt
        updatedAt
        selections {
            items {
              id
              createdBy
            }
            nextToken
        }
      }
      nextToken
    }
  }
  `

