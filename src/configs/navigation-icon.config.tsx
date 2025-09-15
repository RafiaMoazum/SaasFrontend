import {
    HiOutlineHome,
    HiUserAdd,
    HiGift,
    HiUserGroup
} from 'react-icons/hi'
import { TbPackages } from "react-icons/tb";
import { AiOutlineSafetyCertificate } from "react-icons/ai";

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    home: <HiOutlineHome />,
    User: <HiUserAdd/>,
    Role: <HiUserGroup />,
    Permission: <AiOutlineSafetyCertificate/>,
    Promo: <HiGift/>,
    Package : <TbPackages/>,
    
}

export default navigationIcon
