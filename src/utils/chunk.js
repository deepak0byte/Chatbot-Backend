export function chunkText(text, chunkSize = 512, overlap = 50) {
    const words = text.split(' ');
    const chunks = [];
    for (let i = 0; i < words.length; i += chunkSize - overlap) {
        const chunk = words.slice(i, i + chunkSize).join(' ');
        chunks.push(chunk);
        if (i + chunkSize >= words.length) break;
    }
    return chunks;
}
