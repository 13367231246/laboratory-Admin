export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return '/src/assets/icons/user.png'
  if (imageUrl.startsWith('http')) return imageUrl
  // 查看import.meta.env.VITE_BASE_FILE_URL末尾和imageUrl开头是否有/，都没有就加上
  if (!import.meta.env.VITE_BASE_FILE_URL.endsWith('/') && !imageUrl.startsWith('/')) {
    return import.meta.env.VITE_BASE_FILE_URL + '/' + imageUrl
  }
  if (import.meta.env.VITE_BASE_FILE_URL.endsWith('/') && !imageUrl.startsWith('/')) {
    return import.meta.env.VITE_BASE_FILE_URL + imageUrl
  }
  if (!import.meta.env.VITE_BASE_FILE_URL.endsWith('/') && imageUrl.startsWith('/')) {
    return import.meta.env.VITE_BASE_FILE_URL + imageUrl.slice(1)
  }
}
