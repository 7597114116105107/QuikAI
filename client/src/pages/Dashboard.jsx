import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from "react-hot-toast";
import { Sparkles, Gem } from 'lucide-react'
import {Protect, useAuth} from '@clerk/clerk-react'
import CreationItem from '../components/CreationItem'
import { api } from '../api'

const dummyCreationData = [
  {
    id: 1,
    name: 'AI Article',
    type: 'text',
    content: '## This is an AI generated article\n\nHello world!',
    created_at: '2026-01-29'
  },
  {
    id: 2,
    name: 'Generated Image',
    type: 'image',
    content: 'https://via.placeholder.com/400',
    created_at: '2026-01-28'
  }
]


const Dashboard = () => {
  const [creations, setCreations] = useState([])
  const [loading, setloading] = useState(true)
  const {getToken} = useAuth()
 // const plan = "Premium"

  const getDashbordData = async () => {
    try {
      const {data} = await axios.get(api.getUserCreations, {headers: {Authorization: `Bearer ${await getToken()}`}})

      if (data.success) {
        setCreations(data.creations)
      }else{
        toast.error(data.message)
      }
    }catch (error) {
      toast.error(error.message)
    }
    finally {
      setloading(false)
    }
    }

  useEffect(() => {
  getDashbordData()
  }, [])

  return (
     
    <div className='h-full overflow-y-scroll p-6'>
      <div className='flex justify-start gap-4 flex-wrap'>

        {/* Total Creations */}
        <div className='flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border'>
          <div className='text-slate-600'>
            <p className='text-sm'>Total Creations</p>
            <h2 className='text-xl font-semibold'>{creations.length}</h2>
          </div>
          <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-[#3588F2] to-[#0BB0D7] flex justify-center items-center'>
            <Sparkles className='w-5 text-white'/>
          </div>
        </div>

        {/* Active Plan */}
        <div className='flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border'>
          <div className='text-slate-600'>
            <p className='text-sm'>Active Plan</p>
            <h2 className='text-xl font-semibold'>
              {/* <Protect plan='Premium' fallback="Free">Premium</Protect> */}
              <Protect
                   condition={(has) => has({ metadata: { plan: "Premium" } })}
                    fallback="Free"
>
                    Premium
              </Protect>

            </h2>
          </div>
          <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF61C5] to-[#9E53EE] flex justify-center items-center'>
            <Gem className='w-5 text-white'/>
          </div>
        </div>

      </div>


      {
        loading ? 
        (
          <div className='flex justify-center items-center h-3/4'>
            <div className='animate-spin rounded-full h-11 w-11 border-3 border-purple-500 border-t-transparent'></div>
          </div>
        ) : (
           <div className='space-y-3'>
         <p className='mt-6 mb-4'>Recent Creations</p>
         {
           creations.map((item) => <CreationItem key={item.id} item={item} />)
         }
      </div>
        )
      }

      
    </div>
  )
}

export default Dashboard
