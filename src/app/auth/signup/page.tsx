import { SignUpForm } from "@/components";

const SignUpPage = () => {
    return (
        <div className="flex flex-col items-center justify-center size-full">
            <div className="max-w-xs mx-auto size-full flex flex-col items-center mt-[270px]">
                <SignUpForm />
            </div>
        </div>
    )
};

export default SignUpPage
