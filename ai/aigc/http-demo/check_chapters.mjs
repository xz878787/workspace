import { EPubLoader } from '@langchain/community/document_loaders/fs/epub'

async function main() {
  const l = new EPubLoader('./天龙八部.epub')
  const docs = await l.load()
  
  // Check chapters that were matched (48, 57, 17, 11, 110)
  const checkChapters = [47, 56, 16, 10, 109] // 0-indexed
  
  for (const idx of checkChapters) {
    const doc = docs[idx]
    console.log(`Doc ${idx} (chapter ${idx+1}): len=${doc.pageContent.length}`)
    console.log(`  preview: ${doc.pageContent.substring(0, 150)}`)
    console.log()
  }
}
main().catch(console.error)
