/**
 * API paths: use production routes when deployed, dev routes when local.
 * Server only registers /dev/* routes when NODE_ENV !== 'production'.
 */
const isProd = import.meta.env.PROD

export const api = {
  getUserCreations: isProd ? '/api/user/get-user-creations' : '/api/ai/dev/get-user-creations',
  getPublishedCreations: isProd ? '/api/user/get-published-creations' : '/api/ai/dev/get-published-creations',
  generateArticle: isProd ? '/api/ai/generate-article' : '/api/ai/dev/generate-article',
  generateBlogTitle: isProd ? '/api/ai/generate-blog-title' : '/api/ai/dev/generate-blog-title',
  generateImage: isProd ? '/api/ai/generate-image' : '/api/ai/dev/generate-image',
  removeImageBackground: isProd ? '/api/ai/remove-image-background' : '/api/ai/dev/remove-image-background',
  removeImageObject: isProd ? '/api/ai/remove-image-Object' : '/api/ai/dev/remove-image-object',
  resumeReview: isProd ? '/api/ai/resume-review' : '/api/ai/dev/resume-review',
  toggleLikeCreations: '/api/user/toggle-like-creations',
}
