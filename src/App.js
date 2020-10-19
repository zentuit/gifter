import React, { useEffect, useState } from 'react'
import { Auth } from 'aws-amplify'
import { withAuthenticator } from 'aws-amplify-react'

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
