import Menu from '@/components/ui/Menu'
import Dropdown from '@/components/ui/Dropdown'
import AuthorityCheck from '@/components/shared/AuthorityCheck'
import { Link, useLocation } from 'react-router-dom'
import VerticalMenuIcon from './VerticalMenuIcon'
import { Trans } from 'react-i18next'
import type { CommonProps } from '@/@types/common'
import type { Direction } from '@/@types/theme'
import type { NavigationTree } from '@/@types/navigation'

interface DefaultItemProps extends CommonProps {
    nav: NavigationTree
    onLinkClick?: (link: { key: string; title: string; path: string }) => void
    userAuthority: string[]
}

interface CollapsedItemProps extends DefaultItemProps {
    direction: Direction
}

interface VerticalCollapsedMenuItemProps extends CollapsedItemProps {
    sideCollapsed?: boolean
}

const { MenuItem, MenuCollapse } = Menu

const DefaultItem = ({ nav, onLinkClick, userAuthority }: DefaultItemProps) => {
    const location = useLocation()

    const isParentActive =
        (nav.path && location.pathname.startsWith(nav.path)) ||
        (nav.subMenu &&
            nav.subMenu.some(
                (subNav) => subNav.path && location.pathname.startsWith(subNav.path)
            ))

    return (
        <AuthorityCheck userAuthority={userAuthority} authority={nav.authority}>
            <MenuCollapse
                key={nav.key}
                eventKey={nav.key}
                expanded={false}
                aria-current={isParentActive ? 'page' : undefined}
                className={`
                    mb-2
                    hover:bg-custom-dark-800
                    ${isParentActive ? 'bg-custom-dark-800 text-emerald-300' : ''}
                `}
                label={
                    <>
                        <VerticalMenuIcon icon={nav.icon} />
                        <span>
                            <Trans i18nKey={nav.translateKey} defaults={nav.title} />
                        </span>
                    </>
                }
            >
                {nav.subMenu?.map((subNav) => {
                    const isActive =
                        subNav.path && location.pathname.startsWith(subNav.path)
                    return (
                        <AuthorityCheck
                            key={subNav.key}
                            userAuthority={userAuthority}
                            authority={subNav.authority}
                        >
                            <MenuItem
                                eventKey={subNav.key}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                {subNav.path ? (
                                    <Link
                                        to={subNav.path}
                                        target={subNav.isExternalLink ? '_blank' : ''}
                                        onClick={() =>
                                            onLinkClick?.({
                                                key: subNav.key,
                                                title: subNav.title,
                                                path: subNav.path,
                                            })
                                        }
                                        aria-current={isActive ? 'page' : undefined}
                                        className="
                                            h-full w-full flex items-center rounded-md px-3 py-2
                                            hover:bg-custom-dark-800
                                            aria-[current=page]:bg-custom-dark-800
                                            aria-[current=page]:text-emerald-300
                                        "
                                    >
                                        <span>
                                            <Trans
                                                i18nKey={subNav.translateKey}
                                                defaults={subNav.title}
                                            />
                                        </span>
                                    </Link>
                                ) : (
                                    <span>
                                        <Trans
                                            i18nKey={subNav.translateKey}
                                            defaults={subNav.title}
                                        />
                                    </span>
                                )}
                            </MenuItem>
                        </AuthorityCheck>
                    )
                })}
            </MenuCollapse>
        </AuthorityCheck>
    )
}

const CollapsedItem = ({
    nav,
    onLinkClick,
    userAuthority,
    direction,
}: CollapsedItemProps) => {
    const location = useLocation()

    const isParentActive =
        (nav.path && location.pathname.startsWith(nav.path)) ||
        (nav.subMenu &&
            nav.subMenu.some(
                (subNav) => subNav.path && location.pathname.startsWith(subNav.path)
            ))

    const menuItem = (
        <MenuItem
            key={nav.key}
            eventKey={nav.key}
            className={`
                mb-2
                ${isParentActive ? 'text-emerald-300 bg-custom-dark-800 rounded-md' : ''}
            `}
        >
            <VerticalMenuIcon icon={nav.icon} />
        </MenuItem>
    )

    return (
        <AuthorityCheck userAuthority={userAuthority} authority={nav.authority}>
            <Dropdown
                trigger="hover"
                renderTitle={menuItem}
                placement={direction === 'rtl' ? 'middle-end-top' : 'middle-start-top'}
            >
                {nav.subMenu?.map((subNav) => {
                    const isActive =
                        subNav.path && location.pathname.startsWith(subNav.path)
                    return (
                        <AuthorityCheck
                            key={subNav.key}
                            userAuthority={userAuthority}
                            authority={subNav.authority}
                        >
                            <Dropdown.Item eventKey={subNav.key}>
                                {subNav.path ? (
                                    <Link
                                        to={subNav.path}
                                        target={subNav.isExternalLink ? '_blank' : ''}
                                        onClick={() =>
                                            onLinkClick?.({
                                                key: subNav.key,
                                                title: subNav.title,
                                                path: subNav.path,
                                            })
                                        }
                                        aria-current={isActive ? 'page' : undefined}
                                        className="
                                            h-full w-full flex items-center rounded-md
                                            aria-[current=page]:text-emerald-300
                                        "
                                    >
                                        <span>
                                            <Trans
                                                i18nKey={subNav.translateKey}
                                                defaults={subNav.title}
                                            />
                                        </span>
                                    </Link>
                                ) : (
                                    <span>
                                        <Trans
                                            i18nKey={subNav.translateKey}
                                            defaults={subNav.title}
                                        />
                                    </span>
                                )}
                            </Dropdown.Item>
                        </AuthorityCheck>
                    )
                })}
            </Dropdown>
        </AuthorityCheck>
    )
}


const VerticalCollapsedMenuItem = ({
    sideCollapsed,
    ...rest
}: VerticalCollapsedMenuItemProps) => {
    return sideCollapsed ? (
        <CollapsedItem {...rest} />
    ) : (
        <DefaultItem {...rest} />
    )
}

export default VerticalCollapsedMenuItem
