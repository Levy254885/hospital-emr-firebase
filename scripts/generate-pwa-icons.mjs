/**
 * Generates simple PNG icons for PWA (no native deps).
 */
import fs from 'fs'
import path from 'path'
import zlib from 'zlib'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '../public/icons')
fs.mkdirSync(outDir, { recursive: true })

function crc32(buf) {
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1
  }
  return ~c >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeB = Buffer.from(type)
  const crcBuf = Buffer.concat([typeB, data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(crcBuf))
  return Buffer.concat([len, typeB, data, crc])
}

function png(size) {
  const bg = [0x0d, 0x6b, 0x89]
  const white = [255, 255, 255]
  const rows = []
  const thick = Math.max(Math.floor(size / 12), 2)
  const arm = Math.floor(size / 5)
  const cx = Math.floor(size / 2)
  const cy = Math.floor(size / 2)

  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 3)
    row[0] = 0
    for (let x = 0; x < size; x++) {
      let r = bg[0],
        g = bg[1],
        b = bg[2]
      const onCross =
        (Math.abs(x - cx) <= thick / 2 && Math.abs(y - cy) <= arm) ||
        (Math.abs(y - cy) <= thick / 2 && Math.abs(x - cx) <= arm)
      if (onCross) {
        r = white[0]
        g = white[1]
        b = white[2]
      }
      const i = 1 + x * 3
      row[i] = r
      row[i + 1] = g
      row[i + 2] = b
    }
    rows.push(row)
  }
  const raw = Buffer.concat(rows)
  const compressed = zlib.deflateSync(raw)
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 2
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0
  return Buffer.concat([signature, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))])
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
for (const s of sizes) {
  fs.writeFileSync(path.join(outDir, `icon-${s}.png`), png(s))
}
fs.writeFileSync(path.join(outDir, 'maskable-192.png'), png(192))
fs.writeFileSync(path.join(outDir, 'maskable-512.png'), png(512))
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), png(180))
console.log('PWA icons written to public/icons')
