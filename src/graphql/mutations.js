/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createItem = /* GraphQL */ `
  mutation CreateItem(
    $input: CreateItemInput!
    $condition: ModelItemConditionInput
  ) {
    createItem(input: $input, condition: $condition) {
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
export const updateItem = /* GraphQL */ `
  mutation UpdateItem(
    $input: UpdateItemInput!
    $condition: ModelItemConditionInput
  ) {
    updateItem(input: $input, condition: $condition) {
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
export const deleteItem = /* GraphQL */ `
  mutation DeleteItem(
    $input: DeleteItemInput!
    $condition: ModelItemConditionInput
  ) {
    deleteItem(input: $input, condition: $condition) {
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
export const createSelection = /* GraphQL */ `
  mutation CreateSelection(
    $input: CreateSelectionInput!
    $condition: ModelSelectionConditionInput
  ) {
    createSelection(input: $input, condition: $condition) {
      id
      createdBy
      itemId
      date
      createdAt
      updatedAt
    }
  }
`;
export const updateSelection = /* GraphQL */ `
  mutation UpdateSelection(
    $input: UpdateSelectionInput!
    $condition: ModelSelectionConditionInput
  ) {
    updateSelection(input: $input, condition: $condition) {
      id
      createdBy
      itemId
      date
      createdAt
      updatedAt
    }
  }
`;
export const deleteSelection = /* GraphQL */ `
  mutation DeleteSelection(
    $input: DeleteSelectionInput!
    $condition: ModelSelectionConditionInput
  ) {
    deleteSelection(input: $input, condition: $condition) {
      id
      createdBy
      itemId
      date
      createdAt
      updatedAt
    }
  }
`;
