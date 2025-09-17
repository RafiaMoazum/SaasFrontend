import { cloneElement } from 'react'
import Logo from '@/components/template/Logo'
import { APP_NAME } from '@/constants/app.constant'
import type { CommonProps } from '@/@types/common'
import type { ReactNode, ReactElement } from 'react'

interface CoverProps extends CommonProps {
    content?: ReactNode
}

const Cover = ({ children, content, ...rest }: CoverProps) => {
    return (
        <div className="grid lg:grid-cols-3 h-full">
            {/* Left Section */}
            <div
                className="col-span-2 py-6 px-16 flex-col justify-between bg-white dark:bg-gray-800 hidden lg:flex"
                style={{
                    background: `radial-gradient(circle at center, #ECFDF5, #A7F3D0)`,
                }}
            >
                <Logo mode="light" />
                <div>
                    <h3 className="text-[#2C2C2C] mb-4 font-semibold text-2xl">
                        {APP_NAME}
                    </h3>
                    <p className="text-lg text-[#2C2C2C] opacity-80 max-w-[700px]">
                        Whether you’re looking to streamline operations, enhance
                        customer experiences, or unlock new revenue streams, our
                        comprehensive suite of services is designed to meet your
                        needs. Let’s build the future together.
                    </p>
                </div>
                <span className="text-[#2C2C2C]">
                    Copyright &copy; {new Date().getFullYear()}{' '}
                    <span className="font-semibold">{APP_NAME}</span>
                </span>
            </div>

            {/* Right Section */}
            <div className="flex flex-col justify-center items-center bg-white dark:bg-gray-800">
                <div className="xl:min-w-[450px] px-8">
                    <div className="mb-8">{content}</div>
                    {children
                        ? cloneElement(children as ReactElement, { ...rest })
                        : null}
                </div>
            </div>
        </div>
    )
}

export default Cover
