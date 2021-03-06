import { useState, useRef } from 'react'
import { client, getProfile } from './utils/identity';
import './App.css';

function App() {
  const [bio, setBio] = useState('')
  const [linkedIn, setLinkedIn] = useState('')
  const [username, setUsername] = useState('')
  const [profile, setProfile] = useState({})
  const [showGreeting, setShowGreeting] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [idxInstance, setIdxInstance] = useState(null)
  const [localDid, setLocalDid] = useState(null)
  const idxRef = useRef(null)
  const didRef = useRef(null)
  idxRef.current = idxInstance
  didRef.current = localDid

  const signIn = async () => {
    const cdata = await client()
    const { did, idx, error } = cdata
    if (error) {
      console.log('error: ', error)
      return
    }
    setLocalDid(did)
    setIdxInstance(idx)
    const data = await idx.get('basicProfile', did.id)
    if (data) {
      setProfile(data)
    } else {
      setShowGreeting(true)
    }
    setLoaded(true)
  }

  const updateProfile = async () => {
    if (!username && !bio && !linkedIn) {
      alert('All fields are required')
      return
    }
    if (!idxInstance) {
      await signIn()
    }
    const user = { ...profile }
    if (username) user.name = username
    if (bio) user.bio = bio
    if (linkedIn) user.linkedIn = linkedIn
    await idxRef.current.set('basicProfile', user)
    setLocalProfileData()
    alert('Profile updated!')
  }

  const readProfile = async () => {
    try {
      const { record } = await getProfile()
      if (record) {
        setProfile(record)
      }
    } catch (error) {
      setShowGreeting(true)
    }
    setLoaded(true)
  }

  const setLocalProfileData = async () => {
    try {
      const data = await idxRef.current.get('basicProfile', didRef.current.id)
      if (!data) return
      setProfile(data)
      setShowGreeting(false)
    } catch (error) {
      console.log('error', error)
    }
  }

  return (
    <div style={{ paddingTop: 50, width: 500, margin: '0 auto', display: 'flex', flex: 1 }}>
      <div className="flex flex-1 flex-col justify-center">
        <h1 className="text-5xl text-center">
          Ethereum Identity Management
        </h1>
        <p className="text-xl text-center mt-2 text-gray-400">An authentication flow example using blockchain technology</p>
        {
          Object.keys(profile).length ? (
            <div className="mb-4">
              <h2 className="text-2xl font-semibold mt-6">{profile.name}</h2>
              <p className="text-gray-500 text-sm my-1">{profile.bio}</p>
              <p className="text-lg	text-gray-900">Here is my LinkedIn: {profile.linkedIn}. Let's connect.</p>
            </div>
          ) : null
        }
        {
          !loaded && (
            <>
            <button
            onClick={signIn}
            className="pt-4 shadow-md bg-green-300 mt-4 mb-2 text-white font-bold py-2 px-4 rounded"
            >Sign In</button>
            <button className="pt-4 shadow-md bg-blue-500 mb-2 text-white font-bold py-2 px-4 rounded" onClick={readProfile}>Read Profile</button>
            </>
          )
        }      
        {
          loaded && showGreeting && (
            <p className="my-4 font-bold text-center">You have no profile yet, please create one.</p>
          )
        }
        {
          loaded && (
            <>
              <input className="pt-4 rounded bg-gray-100 px-3 py-2" placeholder="Username" onChange={e => setUsername(e.target.value)} />
              <input className="pt-4 rounded bg-gray-100 px-3 py-2" placeholder="Bio" onChange={e => setBio(e.target.value)} />
              <input className="pt-4 rounded bg-gray-100 px-3 py-2" placeholder="LinkedIn" onChange={e => setLinkedIn(e.target.value)} />
              <button className="pt-4 shadow-md bg-green-500 mt-2 mb-2 text-white font-bold py-2 px-4 rounded" onClick={updateProfile}>Update Profile</button>
              <button className="pt-4 shadow-md bg-blue-500 mb-2 text-white font-bold py-2 px-4 rounded" onClick={readProfile}>Read Profile</button>
            </>
          )
        }     
      </div>
    </div>
  );
}

export default App;
