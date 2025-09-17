import classNames from 'classnames'
import { APP_NAME } from '@/constants/app.constant'
import type { CommonProps } from '@/@types/common'

interface LogoProps extends CommonProps {
    type?: 'full' | 'streamline'
    mode?: 'light' | 'dark'
    imgClass?: string
    logoWidth?: number | string
}

const LOGO_SRC_PATH = '/img/logo/'

const Logo = (props: LogoProps) => {
    const {
        type = 'full',
        mode = 'light',
        className,
        imgClass,
        style,
    } = props

    // ✅ Dynamic width based on type
    const computedWidth = type === 'full' ? '80%' : '100%'

    return (
        <div
            className={classNames('logo mt-[20px] mb-[4px]', className)} 
            style={{
                ...style,
                width: computedWidth,
            }}
        >
            <img
                className={classNames('w-full', imgClass)} 
                src={`${LOGO_SRC_PATH}logo-${mode}-${type}.png`}
                alt={`${APP_NAME} logo`}
            />
        </div>
    )
}

export default Logo
