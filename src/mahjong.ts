import * as constants from "./constants"
import { execFuncOnTextNode, wrapUrlPattern } from "./dom"

// mpsz形式
const MPSZ_SUIT_PATTERN = /[mpsｍｐｓ]/g
const MPSZ_RANK_PATTERN = /[0123456789０１２３４５６７８９]/g
const MPSZ_HONOR_PATTERN = /[zｚ]/g
const MPSZ_LETTER_PATTERN = /[1234567１２３４５６７]/g
const MPSZ_RED_PATTERN = /(?:r5|赤5|ｒ５|赤５)/g
// 漢字形式
const HAN_SUIT_PATTERN = /[萬筒索]/g
const HAN_RANK_PATTERN = /[〇一二三四五六七八九０-９]/g
const HAN_LETTER_PATTERN = /[東南西北白發中]/g
const HAN_RED_PATTERN = /(?:ｒ五|赤五|ｒ５|赤５)/g
// 記号
const SYMBOL_BAR_PATTERN = /(?:-|－|ー|‐|－|―)/g

/**
 * テキスト中の麻雀牌を画像に置き換える
 * @param text 対象テキスト
 * @returns 処理済みテキスト
 */
export const replaceMahjongTile = (text: string): string => {
  // urlを変換しないようにspanタグで囲う
  text = wrapUrlPattern(text)
  // imgタグのsrcなどを変換しないようにテキストノードのみを対象にする
  text = execFuncOnTextNode(text, (child, document) => {})
  return text
}

/**
 * テキスト中のmpsz形式数牌を画像に置き換える
 * @param text 対象テキスト
 * @returns 処理済みテキスト
 */
export const replaceMpszSuitedPattern = (text: string): string => {
  const s = MPSZ_SUIT_PATTERN
  const r = MPSZ_RANK_PATTERN
  const a = MPSZ_RED_PATTERN
  const b = SYMBOL_BAR_PATTERN
  const ra = new RegExp(`(?:${r.source}|${a.source})`, "g")
  const rb = new RegExp(`(?:${ra.source}|${b.source})`, "g")
  const h = new RegExp(
    `(${rb.source}*${ra.source})(${s.source})(?![a-qs-zａ-ｑｓ-ｚ])`,
    "g",
  )
  text = text.replace(h, (_, hand: string, suit: string) => {
    suit = getNormalizedSuit(suit)
    hand = hand.replace(a, "0")
    hand = hand.replace(b, "-")
    hand = hand.replace(r, (rank) => {
      rank = getNormalizedRank(rank)
      const tile = `${suit}${rank}`
      return createTileTag(tile)
    })
    return hand
  })
  return text
}

/**
 * テキスト中のmpsz形式字牌を画像に置き換える
 * @param text 対象テキスト
 * @returns 処理済みテキスト
 */
export const replaceMpszHonorPattern = (text: string): string => {
  const s = MPSZ_HONOR_PATTERN
  const r = MPSZ_LETTER_PATTERN
  const b = SYMBOL_BAR_PATTERN
  const rb = new RegExp(`(?:${r.source}|${b.source})`, "g")
  const h = new RegExp(
    `(${rb.source}*${r.source})(${s.source})(?![a-qs-zａ-ｑｓ-ｚ])`,
    "g",
  )
  text = text.replace(h, (_, hand: string) => {
    hand = hand.replace(b, "-")
    hand = hand.replace(r, (rank) => {
      rank = getNormalizedRank(rank)
      const tile = `z${rank}`
      return createTileTag(tile)
    })
    return hand
  })
  return text
}

/**
 * テキスト中の漢字形式数牌を画像に置き換える
 * @param text 対象テキスト
 * @returns 処理済みテキスト
 */
export const replaceHanSuitedPattern = (text: string): string => {
  const s = HAN_SUIT_PATTERN
  const r = HAN_RANK_PATTERN
  const a = HAN_RED_PATTERN
  const b = SYMBOL_BAR_PATTERN
  const ra = new RegExp(`(?:${r.source}|${a.source})`, "g")
  const rb = new RegExp(`(?:${ra.source}|${b.source})`, "g")
  const h = new RegExp(`(${rb.source}*${ra.source})(${s.source})`, "g")
  text = text.replace(h, (_, hand: string, suit: string) => {
    suit = getNormalizedSuit(suit)
    hand = hand.replace(a, "〇")
    hand = hand.replace(b, "-")
    hand = hand.replace(r, (rank) => {
      rank = getNormalizedRank(rank)
      const tile = `${suit}${rank}`
      return createTileTag(tile)
    })
    return hand
  })
  return text
}

/**
 * テキスト中の漢字形式字牌を画像に置き換える
 * @param text 対象テキスト
 * @returns 処理済みテキスト
 */
export const replaceHanHonorPattern = (text: string): string => {
  const r = HAN_LETTER_PATTERN
  const b = SYMBOL_BAR_PATTERN
  const rb = new RegExp(`(?:${r.source}|${b.source})`, "g")
  const h = new RegExp(`(${rb.source}*${r.source})`, "g")
  text = text.replace(h, (_, hand: string) => {
    hand = hand.replace(b, "-")
    hand = hand.replace(r, (rank) => {
      rank = getNormalizedRank(rank)
      const tile = `z${rank}`
      return createTileTag(tile)
    })
    return hand
  })
  return text
}

export const getNormalizedSuit = (suit: string): string => {
  const targets = ["mps", "ｍｐｓ", "萬筒索"].join("")
  const index = targets.indexOf(suit)
  return "mps"[index % 3]
}

export const getNormalizedRank = (rank: string): string => {
  const targets = [
    "0123456789",
    "０１２３４５６７８９",
    "〇一二三四五六七八九",
    "〇東南西北白發中",
  ].join("")
  const index = targets.indexOf(rank)
  return "0123456789"[index % 10]
}

export const createTileTag = (tile: string): string => {
  return `<img src="${createImageSource(tile)}" alt="${tile}">`
}

export const createImageSource = (tile: string): string => {
  return `/plugins/${constants.PLUGIN_UID}/images/${tile}.png`
}
