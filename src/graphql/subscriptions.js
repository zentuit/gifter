/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateItem = /* GraphQL */ `
  subscription OnCreateItem {
    onCreateItem {
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
export const onUpdateItem = /* GraphQL */ `
  subscription OnUpdateItem {
    onUpdateItem {
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
export const onDeleteItem = /* GraphQL */ `
  subscription OnDeleteItem {
    onDeleteItem {
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
export const onCreateSelection = /* GraphQL */ `
  subscription OnCreateSelection($createdBy: String!) {
    onCreateSelection(createdBy: $createdBy) {
      id
      createdBy
      itemId
      date
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateSelection = /* GraphQL */ `
  subscription OnUpdateSelection($createdBy: String!) {
    onUpdateSelection(createdBy: $createdBy) {
      id
      createdBy
      itemId
      date
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteSelection = /* GraphQL */ `
  subscription OnDeleteSelection($createdBy: String!) {
    onDeleteSelection(createdBy: $createdBy) {
      id
      createdBy
      itemId
      date
      createdAt
      updatedAt
    }
  }
`;
