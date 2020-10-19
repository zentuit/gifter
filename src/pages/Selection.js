import React, { useEffect, useReducer } from 'react'
import { API, graphqlOperation, Auth } from 'aws-amplify'

import { createItem as CreateItem } from '../graphql/mutations'
import { listItems as ListItems } from '../graphql/custom-queries'
import { onCreateItem as OnCreateItem } from '../graphql/subscriptions'

const initialState = {
  name: '', description: '', url: '', items: []
}

function reducer(state, action) {
  console.log({ state, action });
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.items }
    case 'SET_INPUT':
      return { ...state,  [action.key]: action.value }
    case 'CLEAR_INPUT':
      return { ...initialState, items: state.items }
    case 'ADD_ITEM':
      console.log('Auth.user?.username: ', Auth.user?.username);
      if (action.item.createdBy === Auth.user?.username) return state
      return { ...state, items: [...state.items, action.item] }
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
    const subscription = API.graphql(graphqlOperation(OnCreateItem)).subscribe({
      next: (eventData) => {
        const item = eventData.value.data.onCreateItem
        dispatch({ type: 'ADD_ITEM', item })
      }
    })
    return () => subscription.unsubscribe()
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

  async function createItem() {
    const { name, description, url } = state
    if (name === '') return

    const item = { name, description, url }
    const items = [...state.items, item]
    dispatch({ type: 'SET_ITEMS', items })
    dispatch({ type: 'CLEAR_INPUT' })

    try {
      await API.graphql(graphqlOperation(CreateItem, { input: item }))
      console.log('item created');
    } catch (error) {
      console.log('error creating item...', error);
    }
  }

  function onChange(e) {
    dispatch({ type: 'SET_INPUT', key: e.target.name, value: e.target.value })
  }

  return (
    <div>
      <div>
      {
        state.items.map((item, index) => (
          <div key={index}>
            <h2>{item.createdBy}</h2>
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <h5>{item.url}</h5>
            <button>Select</button>
          </div>
        ))
      }
      </div>
    </div>
  );
}

export default Selection;
