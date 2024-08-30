'use client'
import { useClerk } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import React from 'react'

const Page = () => {

    const { user, signOut } = useClerk();


    return (
        <div>
            page
                {user?.emailAddresses[0].emailAddress}
            <div onClick={() => signOut()}>
                Sign out
            </div>
        </div>
    )
};

export default Page
