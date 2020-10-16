import React, { useEffect, useReducer } from 'react'
import { API, graphqlOperation, Auth } from 'aws-amplify'
import { withAuthenticator } from 'aws-amplify-react'

import { createItem as CreateItem } from './graphql/mutations'
import { listItems as ListItems } from './graphql/queries'
import { onCreateItem as OnCreateItem } from './graphql/subscriptions'

const initialState = {
  name: '', description: '', url: '', username: '', items: []
}

function reducer(state, action) {
  console.log({ state, action });
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.items }
    case 'SET_INPUT':
      return { ...state,  [action.key]: action.value }
    case 'CLEAR_INPUT':
      return { ...initialState, items: state.items, username: state.username }
    case 'ADD_ITEM':
      if (action.item.createdBy === state.username) return state
      return { ...state, items: [...state.items, action.item] }
    case 'SET_USER':
      return { ...state, username: action.username }
    default:
      return state
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    getUser()
    getData()
    const subscription = API.graphql(graphqlOperation(OnCreateItem)).subscribe({
      next: (eventData) => {
        const item = eventData.value.data.onCreateItem
        dispatch({ type: 'ADD_ITEM', item })
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function getData() {
    try {
      const itemData = await API.graphql(graphqlOperation(ListItems))
      console.log('itemData:', itemData)
      dispatch({ type: 'SET_ITEMS', items: itemData.data.listItems.items })
    } catch (error) {
      console.log('error fetching items... ', error);
    }
  }

  async function getUser() {
    try {
      const user = await Auth.currentAuthenticatedUser()
      console.log('user: ', user)
      dispatch({ type: 'SET_USER', username: user.username })
      return user.username
    } catch (error) {
      console.log('error finding user: ', error)
      return null
    }
  }

  async function createItem() {
    const { name, description, url, username } = state
    if (name === '') return

    const item = { name, description, url, createdBy: username }
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
      <input
        name='name'
        onChange={onChange}
        value={state.name}
        placeholder='name' />
      <input
        name='description'
        onChange={onChange}
        value={state.description}
        placeholder='description' />
      <input
        name='url'
        onChange={onChange}
        value={state.url}
        placeholder='url' />
      <button onClick={createItem}>Create Gift Item</button>
      <div>
      {
        state.items.map((item, index) => (
          <div key={index}>
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <h5>{item.url}</h5>
          </div>
        ))
      }
      </div>
    </div>
  );
}

export default withAuthenticator(App, { includeGreetings: true });
