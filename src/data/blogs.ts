export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  image: string;
  author: string;
  category: string;
  readTime: string;
  summary: string;
  content: string[];
}

export const blogPosts: BlogPost[] = [];
