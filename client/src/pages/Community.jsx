import { useAuth, useUser } from '@clerk/clerk-react'
import { Heart } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import  {dummyPublishedCreationData} from '../assets/assets'
import axios from 'axios'
import toast from 'react-hot-toast'


const Community = () => {

  const [Creations, setCreations ] = useState([])
  const {user} = useUser()
  const [loading, setLoading] = useState(true)
  const {getToken} = useAuth()

  const fetchCreations = async () => {
    try {
      const token = await getToken()
      const res = await 
      axios.get('/api/ai/dev/get-published-creations', { headers: { Authorization: `Bearer ${token}` } })
      const data = res?.data
      if (!data) return toast.error('No response from server')
      if (data.success) {
        setCreations(data.creations)
      } else {
        toast.error(data.message || 'Failed to fetch creations')
      }
    }catch (error) {
      toast.error(error.message)
    }
    finally {
      setLoading(false)
    }
    }

    const imageLikeToggle = async (id) => {
      try {
        const token = await getToken()
        const res = await axios.post('/api/user/toggle-like-creations', { id }, 
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const data = res?.data
        if (data?.success) {
          toast.success(data.message)
          await fetchCreations()
        } else {
          toast.error(data?.message || 'Failed to toggle like')
        }
      } catch (error) {
        toast.error(error.message)
      }
    }

  useEffect(()=> {
    if(user){
      fetchCreations()
    }
  },[user])

  return !loading ? (
    <div className='flex-1 h-full flex-col gao-4 p-6'>
     Creations 
      <div className='bg-white h-full w-full rounded-xl overflow-y-scroll'>
       {Creations.map((creation, index)=> (
        <div key={index} className='relative group iniline-block pl-3 pt-3 w-full sm:max-w-1/2 lg:max-w-1/3'>
          <img src={creation.content} alt="" className='w-full h-full object-cover rounded-lg' />

          <div className='absolute bottom-0 top-0 right-0 left-3 flex gap-2 items-end justify-end group-hover:justify-between p-3 group-hover:bg-gradient-to-b from-transparent to-black/80 text-white roounded-lg'>
            <p className='text-sm hidden group-hover:block'>{creation.promt}</p>
            <div className='flex gap-1 items-center'>
              <p className='text-sm'>{(creation.likes || []).length}</p>
              <Heart onClick={() => imageLikeToggle(creation.id)} className={`min-w-5 h-5 hover:scale-110 cursor-pointer ${(Array.isArray(creation.likes) && creation.likes.includes(user.id)) ? 'fill-red-500 text-red-600' : 'text-white'}`}/>
             
            </div>
          </div>
        </div>
       ))}
      </div>
    </div>
  ) : (
    <div className='flex justify-center items-center h-full'>
      <span className='w-10 h-10 rounded-full border-3 border-primary border-t-transparent animate-spin'></span>
    </div>
  )
}

export default Community
