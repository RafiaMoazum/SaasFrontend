import Avatar from '@/components/ui/Avatar'
import Dropdown from '@/components/ui/Dropdown'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import useAuth from '@/utils/hooks/useAuth'
import { Link } from 'react-router-dom'
import classNames from 'classnames'
import { HiOutlineLogout, HiOutlineUser, HiOutlineCog } from 'react-icons/hi'
import type { CommonProps } from '@/@types/common'
import { useAppSelector } from '@/store'

type DropdownList = {
    label: string
    path: string
    icon: JSX.Element
}

const dropdownItemList: DropdownList[] = [{
        label: 'Account Setting',
        path: '/account/settings/profile',
        icon: <HiOutlineCog />,
    },]

const getFullImageUrl = (filename: string | null) => {
    if (!filename) return null
    return `/uploads/${filename}`
}

const _UserDropdown = ({ className }: CommonProps) => {
    const { signOut } = useAuth()

    const role = useAppSelector((state) => state.auth.user.role)
    const firstName = useAppSelector((state) => state.auth.user.firstName)
    const lastName = useAppSelector((state) => state.auth.user.lastName)
    const email = useAppSelector((state) => state.auth.user.email)
    const profileImage = useAppSelector((state) => state.auth.user.profileImage)

    const avatarSrc = profileImage ? getFullImageUrl(profileImage) : null

    const UserAvatar = (
        <div className={classNames(className, 'flex items-center gap-2')}>
            <Avatar
                size={32}
                shape="circle"
                src={avatarSrc || undefined}
                icon={!avatarSrc ? <HiOutlineUser /> : undefined}
            />
            <div className="hidden md:block">
                <div className="text-xs capitalize text-custom-dark-900"> {typeof role === 'string' ? role : role?.roleName}</div>
                <div className="font-bold text-custom-dark-900">{firstName + ' ' + lastName}</div>
            </div>
        </div>
    )

    return (
        <div>
            <Dropdown
                menuStyle={{ minWidth: 240 }}
                renderTitle={UserAvatar}
                placement="bottom-end"
            >
                <Dropdown.Item variant="header">
                    <div className="py-2 px-3 flex items-center gap-2">
                        <Avatar
                            shape="circle"
                            size={40}
                            src={avatarSrc || undefined}
                            icon={!avatarSrc ? <HiOutlineUser /> : undefined}
                        />
                        <div>
                            <div className="font-bold text-custom-dark-900">
                                {firstName + ' ' + lastName}
                            </div>
                            <div className="text-xs text-custom-dark-900">{email}</div>
                        </div>
                    </div>
                </Dropdown.Item>
                <Dropdown.Item variant="divider" />
                {dropdownItemList.map((item) => (
                    <Dropdown.Item
                        key={item.label}
                        eventKey={item.label}
                        className="mb-1 px-0"
                    >
                        <Link
                            className="flex h-full w-full px-2"
                            to={item.path}
                        >
                            <span className="flex gap-2 items-center w-full">
                                <span className="text-xl opacity-50">
                                    {item.icon}
                                </span>
                                <span className='text-custom-dark-900'>{item.label}</span>
                            </span>
                        </Link>
                    </Dropdown.Item>
                ))}

                <Dropdown.Item
                    eventKey="Sign Out"
                    className="gap-2"
                    onClick={signOut}
                >
                    <span className="text-xl opacity-50 ">
                        <HiOutlineLogout />
                    </span>
                    <span className='text-custom-dark-900'>Sign Out</span>
                </Dropdown.Item>
            </Dropdown>
        </div>
    )
}

const UserDropdown = withHeaderItem(_UserDropdown)

export default UserDropdown
