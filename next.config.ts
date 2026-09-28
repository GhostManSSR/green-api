import type { NextConfig } from 'next'

const config: NextConfig = {
    reactStrictMode: true,

    webpack(config) {
        config.module.rules.push({
            test: /\.less$/,
            use: [
                require.resolve('style-loader'),
                {
                    loader: require.resolve('css-loader'),
                    options: {
                        url: false,
                    },
                },
                {
                    loader: require.resolve('less-loader'),
                    options: {
                        lessOptions: {
                            javascriptEnabled: true,
                        },
                    },
                },
            ],
        })

        return config
    },

    turbopack: {},
}

export default config