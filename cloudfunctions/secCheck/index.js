const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
    const { type, content } = event
    try {
        if (type === 'text') {
            return await cloud.openapi.security.msgSecCheck({
                openid: cloud.getWXContext().OPENID,
                scene: 1,
                version: 2,
                content: content
            })
        }
    } catch (err) {
        return { errcode: -1, errmsg: String(err) }
    }
}