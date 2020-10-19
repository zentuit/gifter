import React, { useEffect, useState } from 'react'
import { API, graphqlOperation, Auth } from 'aws-amplify'
import { withAuthenticator } from 'aws-amplify-react'

import { createItem as CreateItem } from './graphql/mutations'
import { listItems as ListItems } from './graphql/queries'
import { onCreateItem as OnCreateItem } from './graphql/subscriptions'
import Self from './pages/Self'
import Selection from './pages/Selection'


function App() {
  const [page, updatePage] = useState('self')
  const [user, updateUser] = useState(null)

  useEffect(() => {
    getUser()
  }, [])

  async function getUser() {
    try {
      const user = await Auth.currentAuthenticatedUser()
      console.log('user: ', user)
      updateUser(user)
    } catch (error) {
      console.log('error finding user: ', error)
      return null
    }
  }

  function onMyList(e) {
    updatePage('self')
  }

  function onOthers(e) {
    updatePage('selections')
  }

  return (
    <div>
      <div className='header'>
        <button onClick={onMyList}>My list</button>
        <button onClick={onOthers}>Others' lists</button>
      </div>
      {
        page === 'self' && (<Self user={user} />)
      }
      {
        page === 'selections' && (<Selection user={user} />)
      }
    </div>
  );
}

export default withAuthenticator(App, { includeGreetings: true });
