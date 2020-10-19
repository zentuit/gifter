/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getItem = /* GraphQL */ `
  query GetItem($id: ID!) {
    getItem(id: $id) {
      id
      name
      description
      url
      createdBy
      selections {
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
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
      }
      nextToken
    }
  }
`;
export const getSelection = /* GraphQL */ `
  query GetSelection($id: ID!) {
    getSelection(id: $id) {
      id
      createdBy
      itemId
      date
      createdAt
      updatedAt
    }
  }
`;
export const listSelections = /* GraphQL */ `
  query ListSelections(
    $filter: ModelSelectionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listSelections(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        createdBy
        itemId
        date
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
