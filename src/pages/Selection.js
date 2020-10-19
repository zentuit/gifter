import React, { useEffect, useReducer } from 'react'
import { API, graphqlOperation, Auth } from 'aws-amplify'

import { createSelection as CreateSelection } from '../graphql/mutations'
import { listItems as ListItems } from '../graphql/custom-queries'
import { onCreateItem as OnCreateItem } from '../graphql/subscriptions'
import { onCreateSelection as OnCreateSelection } from '../graphql/subscriptions'

const initialState = {
  name: '', description: '', url: '', items: []
}

function reducer(state, action) {
  console.log({ state, action });
  switch (action.type) {
    case 'SET_ITEMS':
      const groupedItems = action.items.reduce((accum, item) => {
        const list = accum[item.createdBy] || []
        list.push(item)
        accum[item.createdBy] = list
        return accum
      }, {})
      return { ...state, items: groupedItems }
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
      if (action.item.createdBy === Auth.user?.username) return state

      // return { ...state, items: [...state.items, action.item] }
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
    if (user) getData()
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

  async function createSelection() {
    // const { name, description, url } = state
    // if (name === '') return

    // const item = { name, description, url }
    // const items = [...state.items, item]
    // dispatch({ type: 'SET_ITEMS', items })
    // dispatch({ type: 'CLEAR_INPUT' })

    // try {
    //   await API.graphql(graphqlOperation(CreateSelection, { input: item }))
    //   console.log('item created');
    // } catch (error) {
    //   console.log('error creating item...', error);
    // }
  }

  function onClick(e) {
    console.log(e)
    // dispatch({ type: 'SET_INPUT', key: e.target.name, value: e.target.value })
  }

  const listOfItems = Object.keys(state.items).map(key => {
    const list = state.items[key]
    return (
      <div key={key}>
        <h2>{key}</h2>
        {
          list.map(item => (
            <div key={item.id}>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <h5>{item.url}</h5>
              <button>Select</button>
            </div>
          ))
        }
      </div>
    )
  })

  return (
    <div>
      <div>
      {
        listOfItems
      }
      </div>
    </div>
  );
}

export default Selection;
