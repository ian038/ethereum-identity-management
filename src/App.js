import { useState } from 'react'
import CeramicClient from '@ceramicnetwork/http-client'
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver'
import { EthereumAuthProvider, ThreeIdConnect } from '@3id/connect';
import { DID } from 'dids';
import { IDX } from '@ceramicstudio/idx';
import './App.css';

const endpoint = "https://ceramic-clay.3boxlabs.com"

function App() {
  const [username, setUsername] = useState('')
  const [image, setImage] = useState('')
  const [loaded, setLoaded] = useState(false)

  const connect = async () => {
    // fetch user profile using ethereum wallet request
    const addresses = await window.ethereum.request({
      method: 'eth_requestAccounts'
    })
    return addresses
  }

  const readProfile = async () => {
    const [address] = await connect()
    const ceramic = new CeramicClient(endpoint)
    const idx = new IDX({ ceramic })

    try {
      const data = await idx.get(
        'basicProfile',
        `${address}@eip155:1` 
      )
      console.log('Data: ', data)
      if(data.name) setUsername(data.name)
      if(data.avatar) setImage(data.avatar)
    } catch(error) {
      console.log('error: ', error)
      setLoaded(true)
    }
  }

  const updateProfile = async () => {
    const [address] = await connect()
    const ceramic = new CeramicClient(endpoint)
    const threeIdConnect = new ThreeIdConnect()
    const provider = new EthereumAuthProvider(window.ethereum, address)

    await threeIdConnect.connect(provider)

    // interact with decentralized identifier
    // if they already have a did, reference that
    // else, we give them a new one
    const did = new DID({
      provider: threeIdConnect.getDidProvider(),
      resolver: {
        ...ThreeIdResolver.getResolver(ceramic)
      }
    })
    ceramic.setDID(did)
    await ceramic.did.authenticate()

    const idx = new IDX({ ceramic })
    idx.set('basicProfile', {
      name: username, 
      avatar: image
    })
    alert('Profile updated!')
  }

  return (
    <div className="App">
      <input placeholder="Username" onChange={e => setUsername(e.target.value)} />
      <input placeholder="Profile Image" onChange={e => setImage(e.target.value)} />
      <button onClick={updateProfile}>Set Profile</button>
      <button onClick={readProfile}>Read Profile</button>

      { username && <h3>{username}</h3> }
      { image && <img style={{ width: '400px' }} src={image} alt="User Avatar" /> }
      {!image && !username && !loaded &&<h4>No profile, plase create one.</h4>}
    </div>
  );
}

export default App;
