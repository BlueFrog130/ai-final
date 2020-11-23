module.exports = {
    pluginOptions: {
        electronBuilder: {
            preload: {
                preload: "src/preload.js",
            },
            nodeIntegration: false
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