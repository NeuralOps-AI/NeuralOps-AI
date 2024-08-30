import { SignInForm } from "@/components";

const SignInPage = () => {
    return (
        <div className="flex flex-col items-center justify-center size-full">
            <div className="max-w-xs mx-auto size-full flex flex-col items-center mt-[270px]">
                <SignInForm />
            </div>
        </div>
    )
};

export default SignInPage
