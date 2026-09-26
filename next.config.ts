import type { NextConfig } from 'next'
import withLess from 'next-with-less'

const config: NextConfig = {
    reactStrictMode: true,
}

export default withLess({
    ...config,
    lessOptions: {
        javascriptEnabled: true,
    },
})