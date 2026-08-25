import { describe, it, expect } from 'vitest'
import { formatHeat, keepDecimals, cleanNumber } from './formatHeat'

describe('formatHeat 热值归一化', () => {
  it('微博：裸数字串', () => {
    expect(formatHeat('11468191')).toBe('1146.8万')
  })

  it('抖音：裸数字串', () => {
    expect(formatHeat('11821659')).toBe('1182.2万')
  })

  it('B站：数字+中文后缀", 播放"', () => {
    expect(formatHeat('2142239播放')).toBe('214.2万')
  })

  it('小红书：数字+小数+缩写 w', () => {
    expect(formatHeat('920.8w')).toBe('920.8万')
  })

  it('知乎：数字+空格+单位 万热度', () => {
    expect(formatHeat('1798 万热度')).toBe('1798万')
  })

  it('头条：空字符串 -> "--"', () => {
    expect(formatHeat('')).toBe('--')
  })

  it('掘金：数字+前缀"热度:"', () => {
    expect(formatHeat('热度:1809')).toBe('1,809')
  })

  it('直接带"万"单位', () => {
    expect(formatHeat('25.3万')).toBe('25.3万')
  })

  it('亿级', () => {
    expect(formatHeat('123456789')).toBe('1.2亿')
  })

  it('小于 1 万', () => {
    expect(formatHeat('8500')).toBe('8,500')
  })
})

describe('keepDecimals 保留 1 位小数并去尾 0', () => {
  it('整数去 .0', () => {
    expect(keepDecimals(100)).toBe('100')
  })
  it('小数保留', () => {
    expect(keepDecimals(920.8)).toBe('920.8')
  })
  it('四舍五入', () => {
    expect(keepDecimals(1146.85)).toBe('1146.9')
  })
  it('非有限数 -> --', () => {
    expect(keepDecimals(NaN)).toBe('--')
  })
})

describe('cleanNumber 千分位', () => {
  it('整数千分位', () => {
    expect(cleanNumber(8500)).toBe('8,500')
  })
  it('小数去尾', () => {
    expect(cleanNumber(12.5)).toBe('12.5')
  })
})
