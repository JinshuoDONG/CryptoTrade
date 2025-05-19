import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { VerifiedIcon, Edit2Icon, SaveIcon } from 'lucide-react'
import AccountVerificationForm from './AccountVerificationForm'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/FirebaseConfig'


const Profile = () => {
  const { user, isLoggedIn } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    email: '',
    name: '',
    dateOfBirth: '',
    nationality: '',
    address: '',
    postCode: '',
    job: '',
    height: ''
  })
  const [isLoading, setIsLoading] = useState(true)

  // 加载用户个人信息
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        const userDocRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userDocRef)
        
        if (userDoc.exists() && userDoc.data().profile) {
          // 如果用户文档存在且有profile字段，加载数据
          const profile = userDoc.data().profile
          setProfileData({
            email: user.email || '',
            name: profile.name || user.name || '',
            dateOfBirth: profile.dateOfBirth || '',
            nationality: profile.nationality || '',
            address: profile.address || '',
            postCode: profile.postCode || '',
            job: profile.job || '',
            height: profile.height || ''
          })
        } else {
          // 如果没有profile数据，使用默认数据
          setProfileData({
            email: user.email || '',
            name: user.name || '',
            dateOfBirth: '',
            nationality: '',
            address: '',
            postCode: '',
            job: '',
            height: ''
          })
        }
      } catch (error) {
        console.error('Error loading profile data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserProfile()
  }, [user])

  // 保存用户个人信息到Firebase
  const saveProfileData = async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      const userDocRef = doc(db, "users", user.uid)
      
      // 检查用户文档是否存在
      const userDoc = await getDoc(userDocRef)
      
      if (userDoc.exists()) {
        // 更新现有文档
        await updateDoc(userDocRef, {
          profile: {
            name: profileData.name,
            dateOfBirth: profileData.dateOfBirth,
            nationality: profileData.nationality,
            address: profileData.address,
            postCode: profileData.postCode,
            job: profileData.job,
            height: profileData.height
          }
        })
      } else {
        // 创建新文档
        await setDoc(userDocRef, {
          email: user.email,
          watchlist: [],
          profile: {
            name: profileData.name,
            dateOfBirth: profileData.dateOfBirth,
            nationality: profileData.nationality,
            address: profileData.address,
            postCode: profileData.postCode,
            job: profileData.job,
            height: profileData.height
          }
        })
      }
      
      console.log('个人信息保存成功')
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving profile data:', error)
      console.error('保存失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 处理输入变化
  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleEnableTwoStepVerification=()=>{
    console.log("two step verification")
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading profile data...</div>
  }

  return (
    <div className='flex flex-col items-center mb-5'>
      <div className='pt-10 w-full lg:w-[60%]'>
        <Card>
          <CardHeader className="pb-9 flex flex-row justify-between items-center">
            <CardTitle>Your info</CardTitle>
            <Button 
              variant={isEditing ? "default" : "outline"}
              onClick={() => isEditing ? saveProfileData() : setIsEditing(true)}
            >
              {isEditing ? (
                <><SaveIcon className="h-4 w-4 mr-2" /> Save</>
              ) : (
                <><Edit2Icon className="h-4 w-4 mr-2" /> Edit</>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <div className='lg:flex gap-32'>
              <div className='space-y-7 flex-1'>
                <div className='flex flex-col'>
                  <Label htmlFor="email">Email:</Label>
                  {isEditing ? (
                    <Input 
                      id="email"
                      value={profileData.email} 
                      disabled={true}
                      className="mt-1"
                    />
                  ) : (
                    <p className='text-gray-700'>{profileData.email}</p>
                  )}
                </div>
                <div className='flex flex-col'>
                  <Label htmlFor="name">Name:</Label>
                  {isEditing ? (
                    <Input 
                      id="name"
                      value={profileData.name} 
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className='text-gray-700'>{profileData.name}</p>
                  )}
                </div>
                <div className='flex flex-col'>
                  <Label htmlFor="dateOfBirth">Date of birth:</Label>
                  {isEditing ? (
                    <Input 
                      id="dateOfBirth"
                      value={profileData.dateOfBirth} 
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className='text-gray-700'>{profileData.dateOfBirth}</p>
                  )}
                </div>
                <div className='flex flex-col'>
                  <Label htmlFor="nationality">Nationality:</Label>
                  {isEditing ? (
                    <Input 
                      id="nationality"
                      value={profileData.nationality} 
                      onChange={(e) => handleInputChange('nationality', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className='text-gray-700'>{profileData.nationality}</p>
                  )}
                </div>
              </div>
              <div className='space-y-7 flex-1 mt-7 lg:mt-0'>
                <div className='flex flex-col'>
                  <Label htmlFor="address">Address:</Label>
                  {isEditing ? (
                    <Input 
                      id="address"
                      value={profileData.address} 
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className='text-gray-700'>{profileData.address}</p>
                  )}
                </div>
                <div className='flex flex-col'>
                  <Label htmlFor="postCode">PostCode:</Label>
                  {isEditing ? (
                    <Input 
                      id="postCode"
                      value={profileData.postCode} 
                      onChange={(e) => handleInputChange('postCode', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className='text-gray-700'>{profileData.postCode}</p>
                  )}
                </div>
                <div className='flex flex-col'>
                  <Label htmlFor="job">Job:</Label>
                  {isEditing ? (
                    <Input 
                      id="job"
                      value={profileData.job} 
                      onChange={(e) => handleInputChange('job', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className='text-gray-700'>{profileData.job}</p>
                  )}
                </div>
                <div className='flex flex-col'>
                  <Label htmlFor="height">Height:</Label>
                  {isEditing ? (
                    <Input 
                      id="height"
                      value={profileData.height} 
                      onChange={(e) => handleInputChange('height', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className='text-gray-700'>{profileData.height}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* <div className='mt-6'>
          <Card className="w-full">
            <CardHeader className="pb-7">
              <div className='flex items-center gap-3'>
                <CardTitle>
                  2 step verification
                </CardTitle>
                {true ? <Badge
                className={"space-x-2 text-white bg-blue-600"}>
                  <VerifiedIcon/>
                  <span>Enabled</span>
                  </Badge> : <Badge className="bg-orange-600">
                  Disabled
                </Badge>}
                
              </div>
            </CardHeader>
            <CardContent>
              <div>
              <Dialog>
              <DialogTrigger>
                <Button>Enabled two step Verification</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Verify ur account?</DialogTitle>
                  
                </DialogHeader>
                <AccountVerificationForm handleSubmit={handleEnableTwoStepVerification}/>
              </DialogContent>
            </Dialog>

              </div>
            </CardContent>
          </Card>
        </div> */}
      </div>
    </div>
  )
}

export default Profile