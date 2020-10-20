import React, { useEffect, useReducer } from 'react'
import { API, graphqlOperation, Auth } from 'aws-amplify'
import Button from 'react-bootstrap/Button'
import Accordion from 'react-bootstrap/Accordion'
import Card from 'react-bootstrap/Card'
import format from 'date-fns/format'

import { createSelection as CreateSelection } from '../graphql/mutations'
import { deleteSelection as DeleteSelection } from '../graphql/mutations'
import { listItems as ListItems } from '../graphql/custom-queries'
import { onCreateItem as OnCreateItem } from '../graphql/subscriptions'
import { onCreateSelection as OnCreateSelection } from '../graphql/subscriptions'
import { onDeleteSelection as OnDeleteSelection } from '../graphql/subscriptions'

const initialState = {
  name: '', description: '', url: '', username: '', updatingId: [], items: [], mySelections: []
}

function reducer(state, action) {
  console.log({ state, action });
  switch (action.type) {
    case 'SET_ITEMS': {
      const mySelections = [...state.mySelections]
      const groupedItems = action.items.reduce((accum, item) => {
        const list = accum[item.createdBy] || []
        list.push(item)
        accum[item.createdBy] = list
        // now add if we've already selected it
        if (item.selections.items.find(it => it.createdBy === state.username)) {
          if (!state.mySelections.includes(item.id)) {
            mySelections.push(item.id)
          }
        }
        return accum
      }, {})
      return { ...state, items: groupedItems, mySelections }
    }
    case 'ADD_ITEM': {
      if (action.item.createdBy === state.username) {
        return state
      }
      const othersItems = state.items[action.item.createdBy] || []
      othersItems.push(action.item)
      return { ...state, items: {...state.items, [action.item.createdBy]: othersItems} }
    }
    case 'ADD_SELECTION': {
      if (!state.mySelections.includes(action.item.itemId)) {
        return { ...state, mySelections: [...state.mySelections, action.item.itemId]}
      }
      return state
    }
    case 'ADD_SELECTION_TO_ITEM': {
      const itemToAddTo = Object.values(state.items).flat().find(item => item.id === action.item.itemId)
      
      const itemIdx = state.items[itemToAddTo.createdBy].findIndex(it => it.id === itemToAddTo.id)
      const newList = [
        ...state.items[itemToAddTo.createdBy].slice(0, itemIdx),
        { ...itemToAddTo, selections: { items: [...itemToAddTo.selections.items, action.item] } },
        ...state.items[itemToAddTo.createdBy].slice(itemIdx + 1)
      ]
      return { ...state, items: {...state.items, [itemToAddTo.createdBy]: newList } }
    }
    case 'DELETE_SELECTION': {
      if (action.item.createdBy === state.username) {
        const newMySelections = state.mySelections.filter(it => it !== action.item.itemId)
        console.log('myselections: ', state.mySelections, 'newmyselections', newMySelections);
        return { ...state, mySelections: newMySelections }
      }
      return state
    }
    case 'DELETE_SELECTION_FROM_ITEM': {
      const item = Object.values(state.items).flat().find(item => item.id === action.item.itemId)
      
      const itemIdx = state.items[item.createdBy].findIndex(it => it.id === item.id)
      console.log('itemIdx: ', itemIdx);
      const newList = [
        ...state.items[item.createdBy].slice(0, itemIdx),
        { ...item, selections: { items: item.selections.items.filter((selection) => selection.id !== action.item.id) } },
        ...state.items[item.createdBy].slice(itemIdx + 1)
      ]
      console.log('other items: ', state.items[item.createdBy]);
      console.log('newList: ', newList);
      return { ...state, items: {...state.items, [item.createdBy]: newList } }
    }
    case 'SET_USER':{
      return { ...state, username: action.username }
    }
    case 'SELECTION_STARTED':{
      return { ...state, updatingId: [...state.updatingId, action.id] }
    }
    case 'SELECTION_FINISHED': {
      return { ...state, updatingId: state.updatingId.filter(it => it !== action.id) }
    }
    default:
      return state
  }
}

function Selection({ user }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    console.log('useEffect: user: ', user)
    if (user) {
      dispatch({ type: 'SET_USER', username: user.username })
      getData()
    }
    const itemCreateSubscription = API.graphql(graphqlOperation(OnCreateItem)).subscribe({
      next: (eventData) => {
        const item = eventData.value.data.onCreateItem
        item.selections = { items: [] }
        dispatch({ type: 'ADD_ITEM', item })
      }
    })
    const selectionCreateSubscription = API.graphql(graphqlOperation(OnCreateSelection)).subscribe({
      next: (eventData) => {
        const item = eventData.value.data.onCreateSelection
        dispatch({ type: 'ADD_SELECTION', item })
        dispatch({ type: 'ADD_SELECTION_TO_ITEM', item })
        dispatch({ type: 'SELECTION_FINISHED', id: item.itemId })
      }
    })
    const selectionDeleteSubscription = API.graphql(graphqlOperation(OnDeleteSelection)).subscribe({
      next: (eventData) => {
        const item = eventData.value.data.onDeleteSelection
        dispatch({ type: 'DELETE_SELECTION', item })
        dispatch({ type: 'DELETE_SELECTION_FROM_ITEM', item })
        dispatch({ type: 'SELECTION_FINISHED', id: item.itemId })
      }
    })
    return () => {
      itemCreateSubscription.unsubscribe()
      selectionCreateSubscription.unsubscribe()
      selectionDeleteSubscription.unsubscribe()
    }
  }, [user])

  async function getData() {
    try {
      const itemData = await API.graphql(graphqlOperation(ListItems, {
        filter: {
          createdBy: {
            ne: user.username
          }
        }
      }))
      console.log('itemData:', itemData)
      dispatch({ type: 'SET_ITEMS', items: itemData.data.listItems.items })
    } catch (error) {
      console.log('error fetching items... ', error);
    }
  }

  async function createSelection(itemId) {
    const date = format(new Date(), 'yyyy-MM-dd')
    const selection = { itemId, date }
    dispatch({ type: 'SELECTION_STARTED', id: itemId })
    try {
      await API.graphql(graphqlOperation(CreateSelection, { input: selection }))
      console.log('selection created');
    } catch (error) {
        console.log('error creating item...', error);
        dispatch({ type: 'SELECTION_FINISHED', id: itemId })
    }
  }

  async function deleteSelection(itemId, id) {
    dispatch({ type: 'SELECTION_STARTED', id: itemId })
    try {
      await API.graphql(graphqlOperation(DeleteSelection, { input: { id } }))
      console.log('selection deleted');
    } catch (error) {
        console.log('error deleting item...', error);
        dispatch({ type: 'SELECTION_FINISHED', id: itemId })
    }
  }

  function onClick(e) {
    const itemId = e.target.name
    if (!state.mySelections.includes(itemId)) {
      return createSelection(itemId)
    }
    // we have this selected so we need to remove the selection
    // scan the items to find this user's selection in the item
    const { username } = state
    const item = Object.values(state.items).flat().find(item => item.id === itemId)
    const selection = item.selections.items.find((selection) => selection.createdBy === username)
    deleteSelection(item.id, selection.id)
    return
  }

  let count = 0
  const listOfItems = Object.keys(state.items).map(key => {
    const list = state.items[key]
    count++
    return (
      <Card key={key}>
        <Accordion.Toggle as={Card.Header} eventKey={count}>
          {key}
        </Accordion.Toggle>
        <Accordion.Collapse eventKey={count}>
          <Card.Body>
            {
              list.map(item => {
                let urlText = ''
                if (item.url) {
                  urlText = (new URL(item.url)).hostname
                }

                console.log('render: state.mySelections:', state.mySelections, 'item.id:', item.id);
                console.log('includes?', state.mySelections.includes(item.id));
      
                const buttonText = state.mySelections.includes(item.id) ? 'Deselect' : 'Select'
                const buttonDisabled = state.updatingId.includes(item.id)
                const cardColor = item.selections.items.length > 0 ? 'grey' : 'black'
                return (
                  <Card key={item.id}>
                    <Card.Body style={{ color: cardColor }}>
                      <Card.Title>{item.name}</Card.Title>
                      <Card.Subtitle><a href={item.url} target="_blank" rel="noopener noreferrer">{urlText}</a></Card.Subtitle>
                      <Card.Text>{item.description}</Card.Text>
                      <Button name={item.id} onClick={onClick} disabled={buttonDisabled}>{buttonText}</Button>
                    </Card.Body>
                  </Card>
                )
              })
            }
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    )
  })

  return (
    <Accordion>
      {
        listOfItems
      }
    </Accordion>
  );
}

export default Selection;
