export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

export interface PostFormData {
  title: string;
  body: string;
} 