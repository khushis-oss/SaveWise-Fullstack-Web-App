"use client";

import VerifyCode from '@/components/VerifyCode/VerifyCode'
import { useSearchParams } from 'next/navigation';

const Verifypage = () => {
  const params = useSearchParams();
  const userString =  params.get("user");
  const userObj = userString ? JSON.parse(decodeURIComponent(userString)) : {}

  return (
    <VerifyCode userObj={userObj}/>
  )
}

export default Verifypage
