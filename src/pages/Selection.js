import React, { useEffect, useReducer } from 'react'
import { API, graphqlOperation, Auth } from 'aws-amplify'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import format from 'date-fns/format'


import { createSelection as CreateSelection } from '../graphql/mutations'
import { listItems as ListItems } from '../graphql/custom-queries'
import { onCreateItem as OnCreateItem } from '../graphql/subscriptions'
import { onCreateSelection as OnCreateSelection } from '../graphql/subscriptions'

const initialState = {
  name: '', description: '', url: '', username: '', items: [], mySelections: []
}

function reducer(state, action) {
  console.log({ state, action });
  switch (action.type) {
    case 'SET_ITEMS':
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
    case 'SET_INPUT':
      return { ...state,  [action.key]: action.value }
    case 'CLEAR_INPUT':
      return { ...initialState, items: state.items }
    case 'ADD_ITEM':
      const othersItems = state.items[action.item.createdBy] || []
      othersItems.push(action.item)
      return { ...state, items: {...state.items, [action.item.createdBy]: othersItems} }
    case 'ADD_SELECTION':
      console.log({ action })
      if (!state.mySelections.includes(action.item.itemId)) {
        return { ...state, mySelections: [...state.mySelections, action.item.itemId]}
      }
      return state
    case 'SET_USER':
      return { ...state, username: action.username }
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
    const itemSubscription = API.graphql(graphqlOperation(OnCreateItem)).subscribe({
      next: (eventData) => {
        const item = eventData.value.data.onCreateItem
        dispatch({ type: 'ADD_ITEM', item })
      }
    })
    const selectionSubscription = API.graphql(graphqlOperation(OnCreateSelection)).subscribe({
      next: (eventData) => {
        const item = eventData.value.data.onCreateSelection
        dispatch({ type: 'ADD_SELECTION', item })
      }
    })
    return () => {
      itemSubscription.unsubscribe()
      selectionSubscription.unsubscribe()
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
    try {
      await API.graphql(graphqlOperation(CreateSelection, { input: selection }))
      console.log('selection created');
    } catch (error) {
        console.log('error creating item...', error);
    }
  }

  async function updateSelection(itemId) {

  }

  function onClick(e) {
    console.log(e)
    console.log(e.target.name)
    const itemId = e.target.name
    if (state.mySelections.includes(itemId)) {
      updateSelection(itemId)
    } else {
      createSelection(itemId)
    }
  }

  const listOfItems = Object.keys(state.items).map(key => {
    const list = state.items[key]
    return (
      <Container fluid key={key}>
        <h2>{key}</h2>
        {
          list.map(item => {
            let urlText = ''
            if (item.url) {
              urlText = (new URL(item.url)).hostname
            }
  
            const buttonText = state.mySelections.includes(item.id) ? 'Deselect' : 'Select'
            return (
              <Container fluid key={item.id}>
                <Row>
                  <Col xs={8}><h3>{item.name}</h3></Col>
                  <Col xs={4}><Button name={item.id} onClick={onClick}>{buttonText}</Button></Col>
                </Row>
                <Row>
                  <p>{item.description}</p>
                </Row>            
                <Row>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">{urlText}</a>
                </Row>            
                
              </Container>
            )
          })
        }
      </Container>
    )
  })

  return (
    <Container fluid>
      {
        listOfItems
      }
    </Container>
  );
}

export default Selection;
