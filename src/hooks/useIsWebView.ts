import { useMemo } from 'react'

/**
 * 检测当前环境是否为受限 WebView（微信/QQ/企业微信/钉钉等）。
 * 这些环境下 <a target="_blank"> 会同窗口导航、带离 app，
 * 需要用 window.open 或中间页兜底。
 */
export function useIsWebView(): boolean {
  return useMemo(() => {
    if (typeof navigator === 'undefined') return false
    const ua = navigator.userAgent.toLowerCase()
    // 常见受限 WebView 特征
    return (
      /micromessenger/.test(ua) ||   // 微信
      /qq\//.test(ua) ||              // QQ
      /wxwork/.test(ua) ||            // 企业微信
      /dingtalk/.test(ua) ||          // 钉钉
      /alipayclient/.test(ua) ||      // 支付宝
      /weibo/.test(ua) ||             // 微博
      (/android/.test(ua) && !/chrome/.test(ua)) ||  // Android 非 Chrome
      (/iphone|ipad/.test(ua) && !/safari/.test(ua)) // iOS 非 Safari
    )
  }, [])
}
