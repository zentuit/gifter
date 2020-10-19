import React, { useEffect, useReducer } from 'react'
import { API, graphqlOperation, Auth } from 'aws-amplify'

import { createItem as CreateItem } from '../graphql/mutations'
import { listItems as ListItems } from '../graphql/queries'
import { onCreateItem as OnCreateItem } from '../graphql/subscriptions'

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
      return { ...initialState, items: state.items }
    case 'SET_USER':
      return { ...state, username: action.username }
    default:
      return state
  }
}

function Self({ user }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    console.log('use effect user: ', user);
    if (user) getData()
  }, [user])

  async function getData() {
    console.log({ username: user.username })
    try {
      const itemData = await API.graphql(graphqlOperation(ListItems, {
        filter: {
          createdBy: {
            eq: user.username
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

export default Self;
