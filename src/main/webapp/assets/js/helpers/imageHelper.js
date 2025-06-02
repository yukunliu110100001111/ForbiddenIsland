/**
 * 简单的图片检查函数
 * @param {string} url - 图片URL
 * @returns {Promise<boolean>} - 图片是否存在
 */
export function checkImageExists(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}
