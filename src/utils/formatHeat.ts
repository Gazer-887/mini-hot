// 热值归一化：把接口返回的 hot_value（恒为 string）格式化为人类可读展示。
// 覆盖 3 种形态：裸数字串（"11468191"）、数字+中文后缀（"2142239播放"）、数字+小数+缩写（"920.8w"）
// 空值 / 解析失败一律返回 "--"。

/** 保留 1 位小数并去尾 0（如 920.8→"920.8"，1146.85→"1146.9"，100.0→"100"） */
export function keepDecimals(num: number): string {
  if (!Number.isFinite(num)) return '--'
  // 先修浮点误差（如 1146.85 二进制表示为 1146.84999...），再 toFixed(1)
  const rounded = Math.round(num * 10) / 10
  const str = rounded.toFixed(1)
  return str.replace(/\.0$/, '')
}

/** 直接展示的整数/千分位（<1 万的场景） */
export function cleanNumber(num: number): string {
  if (!Number.isFinite(num)) return '--'
  if (Number.isInteger(num)) return num.toLocaleString('en-US')
  return keepDecimals(num)
}

/**
 * formatHeat(raw: string): string
 * - 空值 → "--"
 * - 带量级词（w/W/万/亿）→ 直接按词转义（w→万）
 * - 无词 → 按数值分档（≥1亿→亿、≥1万→万、其余→千分位）
 */
export function formatHeat(raw: string): string {
  if (!raw) return '--'
  const s = String(raw).trim()
  if (!s) return '--'

  const m = s.match(/([\d.]+)\s*(亿|万|w|W)?/)
  if (!m) return s // 无法解析，原样返回兜底

  const num = parseFloat(m[1])
  if (!Number.isFinite(num)) return '--'

  const unit = (m[2] ?? '').toLowerCase()
  if (unit) {
    if (unit === 'w') return keepDecimals(num) + '万'
    return keepDecimals(num) + unit // 亿 / 万
  }

  if (num >= 1e8) return keepDecimals(num / 1e8) + '亿'
  if (num >= 1e4) return keepDecimals(num / 1e4) + '万'
  return cleanNumber(num)
}
