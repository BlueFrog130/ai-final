module.exports = {
    pluginOptions: {
        electronBuilder: {
            preload: "src/preload.js"
        }
    },
    chainWebpack: config => {
        config.module
            .rule("worker-loader")
            .test(/\.worker\.js$/)
            .use("worker-loader")
                .loader("worker-loader")
                .end()
    }
}