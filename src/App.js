import React, { useEffect, useState } from 'react'
import { Auth } from 'aws-amplify'
import { withAuthenticator } from 'aws-amplify-react'

import Self from './pages/Self'
import Selection from './pages/Selection'

import Container from 'react-bootstrap/Container'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tabs'


function App() {
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

  return (
    <Container fluid>
      <Tabs defaultActiveKey="self" id="tabs">
        <Tab eventKey="self" title="My List">
          <Self user={user} />
        </Tab>
        <Tab eventKey="selections" title="Other' Lists">
          <Selection user={user} />
        </Tab>
      </Tabs>
    </Container>
  );
}

export default withAuthenticator(App, { includeGreetings: true });
